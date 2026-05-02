import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/src/db";
import { forumPosts } from "@/src/schema/forum";
import { users } from "@/src/schema/users";
import { authOptions } from "@/lib/auth";
import { suspendedMutationBlockedResponse } from "@/lib/suspended-mutation";

async function isViewerGloballyAnonymous(userId: string) {
  const [row] = await db
    .select({ isAnonymous: users.isAnonymous })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return Boolean(row?.isAnonymous);
}
import {
  buildAnonymousOwnerHash,
  canManageContent,
  ensurePostExists,
  getForumSnapshot,
  replacePostMedia,
  sanitizeMedia,
} from "@/lib/forum-server";
import { FORUM_TAG_LIMIT } from "@/lib/forum-types";

function parsePostId(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseTags(input: unknown) {
  if (!Array.isArray(input)) return [];

  return [...new Set(
    input
      .map((item) => (typeof item === "string" ? item.trim().toLowerCase() : ""))
      .filter(Boolean)
  )].slice(0, FORUM_TAG_LIMIT);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await getServerSession(authOptions);
  const postId = parsePostId((await params).postId);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to edit a discussion." }, { status: 401 });
  }

  const blocked = suspendedMutationBlockedResponse(session, request.headers.get("origin"));
  if (blocked) return blocked;

  if (!postId) {
    return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
  }

  const existing = await ensurePostExists(postId);
  if (!existing) {
    return NextResponse.json({ error: "Discussion not found." }, { status: 404 });
  }

  if (!canManageContent(session.user.id, session.user.role, existing.authorId, existing.anonymousOwnerHash)) {
    return NextResponse.json({ error: "You do not have permission to edit this discussion." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const globallyAnonymous = await isViewerGloballyAnonymous(session.user.id);
    const isAnonymous = globallyAnonymous || Boolean(body.isAnonymous);
    const tags = parseTags(body.tags);
    const media = sanitizeMedia(body.media);

    if (title.length < 4) {
      return NextResponse.json({ error: "Title must be at least 4 characters long." }, { status: 400 });
    }

    if (content.length < 10) {
      return NextResponse.json({ error: "Post content must be at least 10 characters long." }, { status: 400 });
    }

    const nextAuthorId = existing.authorId ?? session.user.id;
    const nextAnonymousOwnerHash = isAnonymous
      ? (existing.anonymousOwnerHash ?? buildAnonymousOwnerHash(existing.authorId ?? session.user.id))
      : null;

    await db
      .update(forumPosts)
      .set({
        authorId: nextAuthorId,
        anonymousOwnerHash: nextAnonymousOwnerHash,
        title,
        content,
        tags,
        isAnonymous,
        updatedAt: new Date(),
      })
      .where(eq(forumPosts.id, postId));

    await replacePostMedia(postId, media);

    const data = await getForumSnapshot(session.user.id, session.user.role);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Unable to update the discussion right now." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await getServerSession(authOptions);
  const postId = parsePostId((await params).postId);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to delete a discussion." }, { status: 401 });
  }

  const blockedDel = suspendedMutationBlockedResponse(session, _request.headers.get("origin"));
  if (blockedDel) return blockedDel;

  if (!postId) {
    return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
  }

  const existing = await ensurePostExists(postId);
  if (!existing) {
    return NextResponse.json({ error: "Discussion not found." }, { status: 404 });
  }

  if (!canManageContent(session.user.id, session.user.role, existing.authorId, existing.anonymousOwnerHash)) {
    return NextResponse.json({ error: "You do not have permission to delete this discussion." }, { status: 403 });
  }

  await db.delete(forumPosts).where(eq(forumPosts.id, postId));

  const data = await getForumSnapshot(session.user.id, session.user.role);
  return NextResponse.json(data);
}
