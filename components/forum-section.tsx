"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import type {
  ForumCommentRecord,
  ForumMediaInput,
  ForumPostRecord,
  ForumResponse,
} from "@/lib/forum-types";
import { FORUM_MEDIA_LIMIT, FORUM_TAG_LIMIT } from "@/lib/forum-types";

type MediaDraft = ForumMediaInput & { key: number };

const EMPTY_FORUM: ForumResponse = {
  viewer: {
    isAuthenticated: false,
    id: null,
    role: null,
    tag: null,
  },
  posts: [],
};

async function readJsonResponse(response: Response) {
  const text = await response.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text) as { error?: string } & Partial<ForumResponse>;
  } catch {
    return null;
  }
}

function formatTimeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function initialsFromEmail(email: string) {
  if (!email || email.toLowerCase().startsWith("anonymous ") || email === "Anonymous user") return "AN";
  return email.slice(0, 2).toUpperCase();
}

function tagStyles(tag: "Admin" | "User") {
  return tag === "Admin"
    ? "bg-secondary/10 text-secondary border-secondary/20"
    : "bg-primary/10 text-primary border-primary/20";
}

function viewerChipClass(active: boolean) {
  return active
    ? "border-primary/25 bg-primary text-primary-foreground shadow-sm"
    : "border-primary/15 bg-card text-muted-foreground";
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-3xl border border-primary/15 bg-white/75 px-3 py-3 shadow-sm backdrop-blur">
      <p className="whitespace-nowrap text-[8px] leading-none font-bold uppercase tracking-[0.06em] text-foreground sm:text-[9px] sm:tracking-[0.08em]">
        {label}
      </p>
      <p className="mt-2 whitespace-nowrap text-[30px] leading-none font-semibold text-foreground">{value}</p>
    </div>
  );
}

function MediaPreview({ media }: { media: ForumPostRecord["media"] }) {
  if (!media.length) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {media.map((item) => (
        <div key={item.id} className="overflow-hidden rounded-3xl border border-primary/15 bg-muted/40">
          {item.kind === "image" ? (
            <img src={item.url} alt="Forum attachment" className="h-56 w-full object-cover" />
          ) : (
            <video src={item.url} controls className="h-56 w-full bg-black object-cover" />
          )}
        </div>
      ))}
    </div>
  );
}

function ActionButton({
  active,
  children,
  onClick,
  disabled,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "rounded-full border px-4 py-2 text-sm font-medium transition",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-primary/15 bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
        disabled ? "cursor-not-allowed opacity-50" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function CommentTree({
  comments,
  busyKey,
  onVote,
  onDelete,
  onReply,
  onEdit,
}: {
  comments: ForumCommentRecord[];
  busyKey: string | null;
  onVote: (commentId: number) => void;
  onDelete: (commentId: number) => void;
  onReply: (commentId: number, content: string) => void;
  onEdit: (commentId: number, content: string) => void;
}) {
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  if (!comments.length) {
    return <p className="text-sm text-muted-foreground">No replies yet. Start the conversation.</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const draft = drafts[comment.id] ?? "";
        const busy = busyKey === `comment-${comment.id}`;

        return (
          <div key={comment.id} className="rounded-[1.6rem] border border-primary/12 bg-white/85 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/12 font-mono text-xs text-primary">
                {initialsFromEmail(comment.author.email)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{comment.author.email}</p>
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${tagStyles(comment.author.tag)}`}>
                    {comment.author.tag}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatTimeLabel(comment.updatedAt)}</span>
                </div>

                {editingId === comment.id ? (
                  <div className="mt-3 space-y-3">
                    <textarea
                      value={draft}
                      onChange={(event) => setDrafts((current) => ({ ...current, [comment.id]: event.target.value }))}
                      rows={3}
                      className="w-full rounded-3xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/40"
                    />
                    <div className="flex flex-wrap gap-2">
                      <ActionButton
                        active
                        disabled={busy}
                        onClick={() => {
                          onEdit(comment.id, draft);
                          setEditingId(null);
                        }}
                      >
                        Save
                      </ActionButton>
                      <ActionButton onClick={() => setEditingId(null)}>Cancel</ActionButton>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground/90">{comment.content}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <ActionButton active={comment.viewerHasUpvoted} disabled={busy} onClick={() => onVote(comment.id)}>
                    Upvote {comment.upvotes > 0 ? `(${comment.upvotes})` : ""}
                  </ActionButton>
                  <ActionButton
                    onClick={() => {
                      setReplyingTo(replyingTo === comment.id ? null : comment.id);
                      setEditingId(null);
                    }}
                  >
                    Reply
                  </ActionButton>
                  {comment.canManage ? (
                    <>
                      <ActionButton
                        onClick={() => {
                          setEditingId(comment.id);
                          setReplyingTo(null);
                          setDrafts((current) => ({ ...current, [comment.id]: comment.content }));
                        }}
                      >
                        Edit
                      </ActionButton>
                      <ActionButton disabled={busy} onClick={() => onDelete(comment.id)}>
                        Delete
                      </ActionButton>
                    </>
                  ) : null}
                </div>

                {replyingTo === comment.id ? (
                  <div className="mt-4 space-y-3 rounded-3xl border border-dashed border-primary/20 bg-primary/5 p-4">
                    <textarea
                      value={draft}
                      onChange={(event) => setDrafts((current) => ({ ...current, [comment.id]: event.target.value }))}
                      rows={3}
                      placeholder="Write a thoughtful reply..."
                      className="w-full rounded-3xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/40"
                    />
                    <div className="flex flex-wrap gap-2">
                      <ActionButton
                        active
                        disabled={busy}
                        onClick={() => {
                          onReply(comment.id, draft);
                          setReplyingTo(null);
                        }}
                      >
                        Reply
                      </ActionButton>
                      <ActionButton onClick={() => setReplyingTo(null)}>Cancel</ActionButton>
                    </div>
                  </div>
                ) : null}

                {comment.replies.length ? (
                  <div className="mt-5 border-l border-primary/12 pl-4 sm:pl-6">
                    <CommentTree
                      comments={comment.replies}
                      busyKey={busyKey}
                      onVote={onVote}
                      onDelete={onDelete}
                      onReply={onReply}
                      onEdit={onEdit}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ForumSection() {
  const [forum, setForum] = useState<ForumResponse>(EMPTY_FORUM);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [media, setMedia] = useState<MediaDraft[]>([{ key: 1, kind: "image", url: "" }]);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const discussionCount = forum.posts.length;
  const replyCount = useMemo(() => {
    const countReplies = (items: ForumCommentRecord[]): number =>
      items.reduce((sum, item) => sum + 1 + countReplies(item.replies), 0);

    return forum.posts.reduce((sum, post) => sum + countReplies(post.comments), 0);
  }, [forum.posts]);

  const uniqueTagCount = useMemo(() => new Set(forum.posts.flatMap((post) => post.tags)).size, [forum.posts]);
  const normalizedSearchTerm = deferredSearchTerm.trim().toLowerCase();
  const filteredPosts = useMemo(() => {
    return forum.posts.filter((post) => {
      const matchesTag = activeTag ? post.tags.includes(activeTag) : true;
      const matchesSearch = normalizedSearchTerm
        ? post.title.toLowerCase().includes(normalizedSearchTerm) ||
          post.tags.some((tag) => tag.toLowerCase().includes(normalizedSearchTerm))
        : true;

      return matchesTag && matchesSearch;
    });
  }, [activeTag, forum.posts, normalizedSearchTerm]);

  async function refreshForum() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/forum", { cache: "no-store" });
      const data = await readJsonResponse(response);

      if (!response.ok || !data || !("posts" in data) || !("viewer" in data)) {
        throw new Error((data && "error" in data && data.error) || "Unable to load the forum right now.");
      }

      setForum(data as ForumResponse);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load the forum right now.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refreshForum();
  }, []);

  async function submitJson(url: string, init: RequestInit, nextBusyKey: string) {
    setBusyKey(nextBusyKey);
    setError(null);

    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init.headers ?? {}),
        },
      });

      const data = await readJsonResponse(response);
      if (!response.ok) {
        throw new Error((data && "error" in data && data.error) || "Something went wrong.");
      }

      if (data && "posts" in data && "viewer" in data) {
        setForum(data as ForumResponse);
      } else {
        await refreshForum();
      }

      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
      return false;
    } finally {
      setBusyKey(null);
    }
  }

  async function handleCreatePost() {
    const wasSuccessful = await submitJson(
      "/api/forum",
      {
        method: "POST",
        body: JSON.stringify({
          title,
          content,
          tags: tagInput.split(",").map((item) => item.trim()).filter(Boolean),
          isAnonymous,
          media: media.filter((item) => item.url.trim()).map(({ kind, url }) => ({ kind, url: url.trim() })),
        }),
      },
      "create-post"
    );

    if (wasSuccessful) {
      setTitle("");
      setContent("");
      setTagInput("");
      setIsAnonymous(false);
      setMedia([{ key: Date.now(), kind: "image", url: "" }]);
    }
  }

  function addMediaField() {
    if (media.length >= FORUM_MEDIA_LIMIT) return;
    setMedia((current) => [...current, { key: Date.now() + current.length, kind: "image", url: "" }]);
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-64 animate-pulse rounded-[2rem] border border-primary/10 bg-card/70" />
        <div className="grid gap-8 xl:grid-cols-[0.95fr_1.35fr]">
          <div className="h-[32rem] animate-pulse rounded-[2rem] border border-primary/10 bg-card/70" />
          <div className="space-y-6">
            <div className="h-64 animate-pulse rounded-[2rem] border border-primary/10 bg-card/70" />
            <div className="h-64 animate-pulse rounded-[2rem] border border-primary/10 bg-card/70" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm">
        <div className="grid gap-8 p-6 lg:grid-cols-[0.85fr_1.15fr] lg:p-8">
          <div>
            <p className="font-mono text-xl tracking-[0.28em] text-primary uppercase sm:text-2xl">Forum</p>
            <h1 className="mt-3 max-w-lg font-heading text-3xl font-bold leading-[0.95] tracking-tight text-foreground sm:text-4xl">
              Community <span className="text-primary italic">discussions</span>
            </h1>
            <p className="mt-4 max-w-lg text-xs leading-6 text-muted-foreground sm:text-sm">
              Ask questions, share experiences, and build practical support around women&apos;s health in one calm space.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className={`rounded-full border px-4 py-2 text-sm ${viewerChipClass(Boolean(forum.viewer.isAuthenticated))}`}>
                {forum.viewer.isAuthenticated ? `Signed in as ${forum.viewer.tag ?? "User"}` : "Read-only preview"}
              </span>
              <a
                href="/dashboard"
                className="rounded-full border border-primary/15 bg-card px-4 py-2 text-sm font-medium text-primary transition hover:border-primary/30"
              >
                Back to dashboard
              </a>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatChip label="Discussions" value={String(discussionCount)} />
            <StatChip label="Replies" value={String(replyCount)} />
            <StatChip label="Active Tags" value={String(uniqueTagCount)} />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <aside>
          <div className="rounded-[2rem] border border-primary/15 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-heading text-2xl font-semibold text-foreground">Start a discussion</p>
                <p className="mt-1 text-sm text-muted-foreground">Clear titles and a little context make replies much faster.</p>
              </div>
              <div className="rounded-2xl bg-primary/8 px-3 py-2 text-xs font-medium text-primary">
                {FORUM_TAG_LIMIT} tags max
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Discussion title"
                className="w-full rounded-3xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/40"
              />
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={6}
                placeholder="What would you like help with?"
                className="w-full rounded-[1.75rem] border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/40"
              />
              <input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                placeholder="Tags, separated by commas"
                className="w-full rounded-3xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/40"
              />

              <div className="rounded-[1.75rem] border border-primary/12 bg-muted/25 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Photos or videos</p>
                    <p className="text-xs text-muted-foreground">Paste public `http` or `https` links.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addMediaField}
                    disabled={media.length >= FORUM_MEDIA_LIMIT}
                    className="rounded-full border border-primary/15 px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add media
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {media.map((item) => (
                    <div key={item.key} className="flex flex-col gap-3 sm:flex-row">
                      <select
                        value={item.kind}
                        onChange={(event) =>
                          setMedia((current) =>
                            current.map((entry) =>
                              entry.key === item.key ? { ...entry, kind: event.target.value as "image" | "video" } : entry
                            )
                          )
                        }
                        className="rounded-full border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/40 sm:w-40"
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </select>
                      <input
                        value={item.url}
                        onChange={(event) =>
                          setMedia((current) =>
                            current.map((entry) => (entry.key === item.key ? { ...entry, url: event.target.value } : entry))
                          )
                        }
                        placeholder="https://example.com/media"
                        className="flex-1 rounded-full border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/40"
                      />
                      <button
                        type="button"
                        onClick={() => setMedia((current) => current.filter((entry) => entry.key !== item.key))}
                        className="rounded-full border border-red-200 px-4 py-3 text-sm text-red-500 transition hover:bg-red-50 sm:w-auto"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm text-foreground">
                <input type="checkbox" checked={isAnonymous} onChange={(event) => setIsAnonymous(event.target.checked)} />
                Post as anonymous user
              </label>

              <button
                type="button"
                onClick={handleCreatePost}
                disabled={!forum.viewer.isAuthenticated || busyKey === "create-post"}
                className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busyKey === "create-post" ? "Saving..." : forum.viewer.isAuthenticated ? "Publish discussion" : "Sign in to post"}
              </button>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-primary/15 bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-heading text-2xl font-semibold text-foreground">Find a discussion</p>
                <p className="mt-1 text-sm text-muted-foreground">Search by title or tag, or click a tag chip to narrow the list.</p>
              </div>
              {(searchTerm || activeTag) ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveTag(null);
                  }}
                  className="rounded-full border border-primary/15 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                >
                  Clear filters
                </button>
              ) : null}
            </div>

            <div className="mt-4 space-y-3">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search discussions by title or tag"
                className="w-full rounded-3xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/40"
              />
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  Showing {filteredPosts.length} of {forum.posts.length} discussions
                </span>
                {activeTag ? (
                  <button
                    type="button"
                    onClick={() => setActiveTag(null)}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    Tag: #{activeTag} x
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {error ? (
            <div className="rounded-[1.75rem] border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-600">{error}</div>
          ) : null}

          {!filteredPosts.length ? (
            <div className="rounded-[2rem] border border-dashed border-primary/20 bg-card/60 px-6 py-16 text-center shadow-sm">
              <p className="font-heading text-3xl text-foreground">No matching discussions</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Try a different title search or clear the selected tag filter.
              </p>
            </div>
          ) : null}

          {filteredPosts.map((post) => (
            <ForumPostCard
              key={post.id}
              post={post}
              busyKey={busyKey}
              canInteract={forum.viewer.isAuthenticated}
              activeTag={activeTag}
              onTagClick={(tag) => setActiveTag((current) => (current === tag ? null : tag))}
              onVote={(postId) => submitJson(`/api/forum/posts/${postId}/vote`, { method: "POST" }, `post-${postId}`)}
              onDelete={(postId) => submitJson(`/api/forum/posts/${postId}`, { method: "DELETE" }, `post-${postId}`)}
              onEdit={(postId, payload) =>
                submitJson(`/api/forum/posts/${postId}`, { method: "PATCH", body: JSON.stringify(payload) }, `post-${postId}`)
              }
              onComment={(postId, replyTo, nextContent) =>
                submitJson(
                  "/api/forum/comments",
                  { method: "POST", body: JSON.stringify({ postId, parentCommentId: replyTo, content: nextContent }) },
                  replyTo ? `comment-${replyTo}` : `post-${postId}`
                )
              }
              onCommentVote={(commentId) =>
                submitJson(`/api/forum/comments/${commentId}/vote`, { method: "POST" }, `comment-${commentId}`)
              }
              onCommentDelete={(commentId) =>
                submitJson(`/api/forum/comments/${commentId}`, { method: "DELETE" }, `comment-${commentId}`)
              }
              onCommentEdit={(commentId, nextContent) =>
                submitJson(
                  `/api/forum/comments/${commentId}`,
                  { method: "PATCH", body: JSON.stringify({ content: nextContent }) },
                  `comment-${commentId}`
                )
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ForumPostCard({
  post,
  busyKey,
  canInteract,
  activeTag,
  onTagClick,
  onVote,
  onDelete,
  onEdit,
  onComment,
  onCommentVote,
  onCommentDelete,
  onCommentEdit,
}: {
  post: ForumPostRecord;
  busyKey: string | null;
  canInteract: boolean;
  activeTag: string | null;
  onTagClick: (tag: string) => void;
  onVote: (postId: number) => void;
  onDelete: (postId: number) => void;
  onEdit: (
    postId: number,
    payload: { title: string; content: string; tags: string[]; isAnonymous: boolean; media: ForumMediaInput[] }
  ) => void;
  onComment: (postId: number, parentCommentId: number | null, content: string) => void;
  onCommentVote: (commentId: number) => void;
  onCommentDelete: (commentId: number) => void;
  onCommentEdit: (commentId: number, content: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [draftTitle, setDraftTitle] = useState(post.title);
  const [draftContent, setDraftContent] = useState(post.content);
  const [draftTags, setDraftTags] = useState(post.tags.join(", "));
  const [draftComment, setDraftComment] = useState("");
  const [draftAnonymous, setDraftAnonymous] = useState(post.isAnonymous);
  const busy = busyKey === `post-${post.id}`;

  return (
    <article className="overflow-hidden rounded-[2rem] border border-primary/15 bg-card shadow-sm">
      <div className="h-2 w-full bg-gradient-to-r from-primary via-accent to-secondary" />
      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 font-mono text-sm text-primary">
                {initialsFromEmail(post.author.email)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{post.author.email}</p>
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${tagStyles(post.author.tag)}`}>
                    {post.author.tag}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{formatTimeLabel(post.updatedAt)}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <ActionButton active={post.viewerHasUpvoted} disabled={!canInteract || busy} onClick={() => onVote(post.id)}>
              Upvote {post.upvotes > 0 ? `(${post.upvotes})` : ""}
            </ActionButton>
            <ActionButton onClick={() => setShowCommentBox((current) => !current)}>Comment</ActionButton>
            {post.canManage ? (
              <>
                <ActionButton onClick={() => setIsEditing((current) => !current)}>{isEditing ? "Cancel" : "Edit"}</ActionButton>
                <ActionButton disabled={busy} onClick={() => onDelete(post.id)}>
                  Delete
                </ActionButton>
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick(tag)}
              className={[
                "rounded-full px-3 py-1 text-xs font-medium transition",
                activeTag === tag
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/8 text-primary hover:bg-primary/14",
              ].join(" ")}
            >
              #{tag}
            </button>
          ))}
        </div>

        {isEditing ? (
          <div className="mt-5 space-y-4">
            <input
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              className="w-full rounded-3xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/40"
            />
            <textarea
              value={draftContent}
              onChange={(event) => setDraftContent(event.target.value)}
              rows={5}
              className="w-full rounded-[1.75rem] border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/40"
            />
            <input
              value={draftTags}
              onChange={(event) => setDraftTags(event.target.value)}
              className="w-full rounded-3xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/40"
            />
            <label className="flex items-center gap-3 text-sm text-foreground">
              <input type="checkbox" checked={draftAnonymous} onChange={(event) => setDraftAnonymous(event.target.checked)} />
              Post as anonymous user
            </label>
            <div className="flex flex-wrap gap-2">
              <ActionButton
                active
                disabled={busy}
                onClick={() => {
                  onEdit(post.id, {
                    title: draftTitle,
                    content: draftContent,
                    tags: draftTags.split(",").map((item) => item.trim()).filter(Boolean),
                    isAnonymous: draftAnonymous,
                    media: post.media.map(({ kind, url }) => ({ kind, url })),
                  });
                  setIsEditing(false);
                }}
              >
                Save changes
              </ActionButton>
              <ActionButton onClick={() => setIsEditing(false)}>Cancel</ActionButton>
            </div>
          </div>
        ) : (
          <>
            <h2 className="mt-5 font-heading text-3xl font-semibold leading-tight text-foreground">{post.title}</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-foreground/90">{post.content}</p>
            <div className="mt-5">
              <MediaPreview media={post.media} />
            </div>
          </>
        )}

        {showCommentBox ? (
          <div className="mt-6 rounded-[1.75rem] border border-primary/12 bg-primary/5 p-4">
            <textarea
              value={draftComment}
              onChange={(event) => setDraftComment(event.target.value)}
              rows={3}
              placeholder={canInteract ? "Add a comment..." : "Sign in to comment"}
              disabled={!canInteract}
              className="w-full rounded-[1.5rem] border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <ActionButton
                active
                disabled={!canInteract || busy}
                onClick={() => {
                  onComment(post.id, null, draftComment);
                  setDraftComment("");
                  setShowCommentBox(false);
                }}
              >
                Comment
              </ActionButton>
              <ActionButton onClick={() => setShowCommentBox(false)}>Cancel</ActionButton>
            </div>
          </div>
        ) : null}

        <div className="mt-6">
          <CommentTree
            comments={post.comments}
            busyKey={busyKey}
            onVote={onCommentVote}
            onDelete={onCommentDelete}
            onReply={(commentId, nextContent) => onComment(post.id, commentId, nextContent)}
            onEdit={onCommentEdit}
          />
        </div>
      </div>
    </article>
  );
}
