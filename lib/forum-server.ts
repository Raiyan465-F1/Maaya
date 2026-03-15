import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/src/db";
import { comments, commentVotes, forumPostMedia, forumPosts, forumPostVotes } from "@/src/schema/forum";
import { users } from "@/src/schema/users";
import type { ForumResponse, ForumCommentRecord, ForumMediaInput } from "@/lib/forum-types";
import { FORUM_MEDIA_LIMIT, FORUM_TAG_LIMIT } from "@/lib/forum-types";
import type { UserRole } from "@/src/schema/enums";

function toIsoString(value: Date | string | null | undefined) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return new Date(value).toISOString();
  return new Date().toISOString();
}

function toAuthorTag(role: UserRole | null | undefined): "Admin" | "User" {
  return role === "admin" ? "Admin" : "User";
}

function buildAnonymousAlias(seed: string) {
  const adjectives = ["Quiet", "Gentle", "Brave", "Silver", "Kind", "Calm", "Bright", "Soft"];
  const nouns = ["Willow", "Bloom", "River", "Orchid", "Comet", "Meadow", "Lantern", "Star"];

  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  const adjective = adjectives[hash % adjectives.length];
  const noun = nouns[(hash >>> 3) % nouns.length];
  const suffix = String((hash % 900) + 100);

  return `${adjective} ${noun} ${suffix}`;
}

function sanitizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];

  const values = tags
    .map((tag) => (typeof tag === "string" ? tag.trim().toLowerCase() : ""))
    .filter(Boolean);

  return [...new Set(values)].slice(0, FORUM_TAG_LIMIT);
}

export function sanitizeMedia(media: unknown): ForumMediaInput[] {
  if (!Array.isArray(media)) return [];

  return media
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const kind = "kind" in item && (item.kind === "image" || item.kind === "video") ? item.kind : null;
      const url = "url" in item && typeof item.url === "string" ? item.url.trim() : "";

      if (!kind || !url) return null;

      try {
        const parsed = new URL(url);
        if (!["http:", "https:"].includes(parsed.protocol)) return null;
      } catch {
        return null;
      }

      return { kind, url };
    })
    .filter((item): item is ForumMediaInput => item !== null)
    .slice(0, FORUM_MEDIA_LIMIT);
}

export function canManageContent(viewerId: string | null, viewerRole: string | null, authorId: string) {
  return viewerRole === "admin" || viewerId === authorId;
}

export async function getForumSnapshot(viewerId: string | null, viewerRole: string | null): Promise<ForumResponse> {
  const posts = await db
    .select({
      id: forumPosts.id,
      title: forumPosts.title,
      content: forumPosts.content,
      tags: forumPosts.tags,
      isAnonymous: forumPosts.isAnonymous,
      createdAt: forumPosts.createdAt,
      updatedAt: forumPosts.updatedAt,
      authorId: users.id,
      authorEmail: users.email,
      authorRole: users.role,
    })
    .from(forumPosts)
    .innerJoin(users, eq(forumPosts.authorId, users.id))
    .orderBy(desc(forumPosts.createdAt));

  const postIds = posts.map((post) => post.id);

  const [mediaRows, postVoteRows, commentRows] = postIds.length
    ? await Promise.all([
        db.select().from(forumPostMedia).where(inArray(forumPostMedia.postId, postIds)),
        db.select().from(forumPostVotes).where(inArray(forumPostVotes.postId, postIds)),
        db
          .select({
            id: comments.id,
            postId: comments.postId,
            parentCommentId: comments.parentCommentId,
            content: comments.content,
            createdAt: comments.createdAt,
            updatedAt: comments.updatedAt,
            authorId: users.id,
            authorEmail: users.email,
            authorRole: users.role,
          })
          .from(comments)
          .innerJoin(users, eq(comments.authorId, users.id))
          .where(inArray(comments.postId, postIds)),
      ])
    : [[], [], []];

  const commentIds = commentRows.map((comment) => comment.id);

  const commentVoteRows = commentIds.length
    ? await db.select().from(commentVotes).where(inArray(commentVotes.commentId, commentIds))
    : [];

  const postMediaMap = new Map<number, ForumResponse["posts"][number]["media"]>();
  for (const media of mediaRows) {
    const current = postMediaMap.get(media.postId) ?? [];
    current.push({ id: media.id, kind: media.kind, url: media.url });
    postMediaMap.set(media.postId, current);
  }

  const postVoteCountMap = new Map<number, number>();
  const viewerPostVotes = new Set<number>();
  for (const vote of postVoteRows) {
    postVoteCountMap.set(vote.postId, (postVoteCountMap.get(vote.postId) ?? 0) + 1);
    if (viewerId && vote.userId === viewerId) {
      viewerPostVotes.add(vote.postId);
    }
  }

  const commentVoteCountMap = new Map<number, number>();
  const viewerCommentVotes = new Set<number>();
  for (const vote of commentVoteRows) {
    commentVoteCountMap.set(vote.commentId, (commentVoteCountMap.get(vote.commentId) ?? 0) + 1);
    if (viewerId && vote.userId === viewerId) {
      viewerCommentVotes.add(vote.commentId);
    }
  }

  const commentTreeMap = new Map<number, ForumCommentRecord>();
  const commentsByPostId = new Map<number, ForumCommentRecord[]>();

  for (const comment of commentRows) {
    const normalized: ForumCommentRecord = {
      id: comment.id,
      postId: comment.postId,
      parentCommentId: comment.parentCommentId,
      content: comment.content,
      createdAt: toIsoString(comment.createdAt),
      updatedAt: toIsoString(comment.updatedAt),
      author: {
        id: comment.authorId,
        email: comment.authorEmail,
        tag: toAuthorTag(comment.authorRole),
      },
      upvotes: commentVoteCountMap.get(comment.id) ?? 0,
      viewerHasUpvoted: viewerCommentVotes.has(comment.id),
      canManage: canManageContent(viewerId, viewerRole, comment.authorId),
      replies: [],
    };

    commentTreeMap.set(normalized.id, normalized);
  }

  for (const comment of commentTreeMap.values()) {
    if (comment.parentCommentId) {
      const parent = commentTreeMap.get(comment.parentCommentId);
      if (parent) {
        parent.replies.push(comment);
        continue;
      }
    }

    const current = commentsByPostId.get(comment.postId) ?? [];
    current.push(comment);
    commentsByPostId.set(comment.postId, current);
  }

  const sortComments = (items: ForumCommentRecord[]) => {
    items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    for (const item of items) sortComments(item.replies);
  };

  for (const list of commentsByPostId.values()) sortComments(list);

  return {
    viewer: {
      isAuthenticated: Boolean(viewerId),
      id: viewerId,
      role: viewerRole,
      tag: viewerRole ? toAuthorTag(viewerRole as UserRole) : null,
    },
    posts: posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      tags: sanitizeTags(post.tags ?? []),
      isAnonymous: Boolean(post.isAnonymous),
      createdAt: toIsoString(post.createdAt),
      updatedAt: toIsoString(post.updatedAt),
      author: {
        id: post.authorId,
        email: post.isAnonymous ? buildAnonymousAlias(`${post.id}-${post.authorId}`) : post.authorEmail,
        tag: toAuthorTag(post.authorRole),
      },
      media: postMediaMap.get(post.id) ?? [],
      upvotes: postVoteCountMap.get(post.id) ?? 0,
      viewerHasUpvoted: viewerPostVotes.has(post.id),
      canManage: canManageContent(viewerId, viewerRole, post.authorId),
      comments: commentsByPostId.get(post.id) ?? [],
    })),
  };
}

export async function ensurePostExists(postId: number) {
  const [post] = await db
    .select({
      id: forumPosts.id,
      authorId: forumPosts.authorId,
    })
    .from(forumPosts)
    .where(eq(forumPosts.id, postId))
    .limit(1);

  return post ?? null;
}

export async function ensureCommentExists(commentId: number) {
  const [comment] = await db
    .select({
      id: comments.id,
      postId: comments.postId,
      authorId: comments.authorId,
      parentCommentId: comments.parentCommentId,
    })
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1);

  return comment ?? null;
}

export async function replacePostMedia(postId: number, media: ForumMediaInput[]) {
  await db.delete(forumPostMedia).where(eq(forumPostMedia.postId, postId));

  if (!media.length) return;

  await db.insert(forumPostMedia).values(
    media.map((item) => ({
      postId,
      kind: item.kind,
      url: item.url,
    }))
  );
}

export async function toggleUpvoteForPost(postId: number, userId: string) {
  const [existing] = await db
    .select()
    .from(forumPostVotes)
    .where(and(eq(forumPostVotes.postId, postId), eq(forumPostVotes.userId, userId)))
    .limit(1);

  if (existing) {
    await db.delete(forumPostVotes).where(and(eq(forumPostVotes.postId, postId), eq(forumPostVotes.userId, userId)));
    return false;
  }

  await db.insert(forumPostVotes).values({
    postId,
    userId,
    voteType: "upvote",
  });

  return true;
}

export async function toggleUpvoteForComment(commentId: number, userId: string) {
  const [existing] = await db
    .select()
    .from(commentVotes)
    .where(and(eq(commentVotes.commentId, commentId), eq(commentVotes.userId, userId)))
    .limit(1);

  if (existing) {
    await db.delete(commentVotes).where(and(eq(commentVotes.commentId, commentId), eq(commentVotes.userId, userId)));
    return false;
  }

  await db.insert(commentVotes).values({
    commentId,
    userId,
    voteType: "upvote",
  });

  return true;
}
