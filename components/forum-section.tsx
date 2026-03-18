"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, MessageSquare, MoreHorizontal } from "lucide-react";
import type {
  ForumCommentRecord,
  ForumMediaInput,
  ForumPostRecord,
  ForumResponse,
} from "@/lib/forum-types";
import { FORUM_MEDIA_LIMIT, FORUM_TAG_LIMIT } from "@/lib/forum-types";

type MediaDraft = ForumMediaInput & { key: number };
type ForumSortOption = "latest" | "oldest" | "popular";

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

function normalizeTagValue(tag: string) {
  return tag.trim().replace(/^#+/, "").toLowerCase();
}

function parseTagString(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => normalizeTagValue(item))
        .filter(Boolean)
    )
  );
}

function stringifyTags(tags: string[]) {
  return tags.join(", ");
}

function toggleTag(tags: string[], tag: string) {
  const normalizedTag = normalizeTagValue(tag);
  return tags.includes(normalizedTag) ? tags.filter((item) => item !== normalizedTag) : [...tags, normalizedTag];
}

function forumProfileHref(userId: string) {
  return `/forum/users/${userId}`;
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center justify-end">
      <p className="mb-2 min-h-[1.55rem] text-center text-[10px] leading-tight font-bold uppercase tracking-[0.04em] text-foreground sm:text-[11px]">
        {label}
      </p>
      <p className="font-mono text-[2.5rem] leading-none font-medium tracking-[-0.05em] text-foreground tabular-nums sm:text-[3rem]">
        {value}
      </p>
    </div>
  );
}

function TagSelector({
  value,
  onChange,
  availableTags,
  placeholder,
}: {
  value: string;
  onChange: (nextValue: string) => void;
  availableTags: string[];
  placeholder: string;
}) {
  const selectedTags = parseTagString(value);
  const suggestedTags = availableTags.filter((tag) => !selectedTags.includes(tag)).slice(0, 12);

  return (
    <div className="space-y-3">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-3xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/40"
      />

      {selectedTags.length ? (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onChange(stringifyTags(selectedTags.filter((item) => item !== tag)))}
              className="rounded-full border border-primary/15 bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/14"
            >
              #{tag} x
            </button>
          ))}
        </div>
      ) : null}

      {suggestedTags.length ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Existing tags</p>
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onChange(stringifyTags(toggleTag(selectedTags, tag)))}
                className="rounded-full border border-primary/15 bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary/30 hover:text-primary"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      ) : null}
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

function InlineActionButton({
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
        "inline-flex items-center gap-2 text-sm font-medium transition",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground",
        disabled ? "cursor-not-allowed opacity-50" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ManagementMenu({
  onEdit,
  onDelete,
  onReport,
  deleteDisabled,
}: {
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  deleteDisabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-primary/8 hover:text-foreground"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {isOpen ? (
        <div className="absolute right-0 top-11 z-10 min-w-32 rounded-2xl border border-primary/12 bg-white p-2 shadow-lg">
          {onEdit ? (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onEdit();
              }}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm text-foreground transition hover:bg-primary/8"
            >
              Edit
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onDelete();
              }}
              disabled={deleteDisabled}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete
            </button>
          ) : null}
          {onReport ? (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onReport();
              }}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm text-amber-700 transition hover:bg-amber-50"
            >
              Report
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function countReplies(items: ForumCommentRecord[]): number {
  return items.reduce((sum, item) => sum + 1 + countReplies(item.replies), 0);
}

function normalizeSearchValue(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function postPopularityScore(post: ForumPostRecord) {
  return post.upvotes - post.downvotes + countReplies(post.comments) * 2;
}

function CommentTree({
  comments,
  canInteract,
  busyKey,
  onVote,
  onDelete,
  onReply,
  onEdit,
  onReport,
  depth = 0,
}: {
  comments: ForumCommentRecord[];
  canInteract: boolean;
  busyKey: string | null;
  onVote: (commentId: number, voteType: "upvote" | "downvote") => void;
  onDelete: (commentId: number) => void;
  onReply: (commentId: number, content: string) => void;
  onEdit: (commentId: number, content: string) => void;
  onReport: (commentId: number, reason: string) => void;
  depth?: number;
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
        const replyCount = countReplies(comment.replies);

        return (
          <div key={comment.id} className="rounded-[1.6rem] border border-primary/12 bg-white/85 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <Link
                href={forumProfileHref(comment.author.id)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/12 font-mono text-xs text-primary transition hover:bg-primary/18"
                onClick={(event) => event.stopPropagation()}
              >
                {initialsFromEmail(comment.author.email)}
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={forumProfileHref(comment.author.id)}
                    className="truncate text-sm font-semibold text-foreground transition hover:text-primary"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {comment.author.email}
                  </Link>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatTimeLabel(comment.updatedAt)}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${tagStyles(comment.author.tag)}`}>
                    {comment.author.tag}
                  </span>
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

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-4">
                    <InlineActionButton active={comment.viewerHasUpvoted} disabled={busy} onClick={() => onVote(comment.id, "upvote")}>
                      <ArrowUp className="h-4 w-4" />
                      <span>{comment.upvotes > 0 ? comment.upvotes : "Upvote"}</span>
                    </InlineActionButton>
                    <InlineActionButton active={comment.viewerHasDownvoted} disabled={busy} onClick={() => onVote(comment.id, "downvote")}>
                      <ArrowDown className="h-4 w-4" />
                      <span>{comment.downvotes > 0 ? comment.downvotes : "Downvote"}</span>
                    </InlineActionButton>
                    <InlineActionButton
                      onClick={() => {
                        setReplyingTo(replyingTo === comment.id ? null : comment.id);
                        setEditingId(null);
                      }}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>{replyCount > 0 ? `${replyCount} replies` : "Reply"}</span>
                    </InlineActionButton>
                  </div>
                  {comment.canManage ? (
                    <ManagementMenu
                      deleteDisabled={busy}
                      onEdit={() => {
                        setEditingId(comment.id);
                        setReplyingTo(null);
                        setDrafts((current) => ({ ...current, [comment.id]: comment.content }));
                      }}
                      onDelete={() => onDelete(comment.id)}
                    />
                  ) : canInteract ? (
                    <ManagementMenu
                      onReport={() => {
                        const reason = window.prompt("Why are you reporting this comment?");
                        if (!reason?.trim()) return;
                        onReport(comment.id, reason.trim());
                      }}
                    />
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

              </div>
            </div>

            {comment.replies.length ? (
              <div
                className={[
                  "mt-5 border-t border-primary/10 pt-4",
                  depth > 0 ? "border-dashed" : "",
                ].join(" ")}
              >
                <CommentTree
                  comments={comment.replies}
                  canInteract={canInteract}
                  busyKey={busyKey}
                  onVote={onVote}
                  onDelete={onDelete}
                  onReply={onReply}
                  onEdit={onEdit}
                  onReport={onReport}
                  depth={depth + 1}
                />
              </div>
            ) : null}
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
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [focusedPostId, setFocusedPostId] = useState<number | null>(null);
  const [commentTargetPostId, setCommentTargetPostId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<ForumSortOption>("latest");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [media, setMedia] = useState<MediaDraft[]>([{ key: 1, kind: "image", url: "" }]);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const filterPanelRef = useRef<HTMLDivElement | null>(null);

  const discussionCount = forum.posts.length;
  const replyCount = useMemo(() => {
    return forum.posts.reduce((sum, post) => sum + countReplies(post.comments), 0);
  }, [forum.posts]);

  const uniqueTagCount = useMemo(() => new Set(forum.posts.flatMap((post) => post.tags)).size, [forum.posts]);
  const availableTags = useMemo(
    () => Array.from(new Set(forum.posts.flatMap((post) => post.tags))).sort((left, right) => left.localeCompare(right)),
    [forum.posts]
  );
  const trendingTopics = useMemo(() => {
    return [...forum.posts]
      .sort((left, right) => {
        const scoreDiff = postPopularityScore(right) - postPopularityScore(left);
        if (scoreDiff !== 0) return scoreDiff;
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      })
      .slice(0, 5);
  }, [forum.posts]);
  const trendingTags = useMemo(() => {
    const tagCountMap = new Map<string, number>();

    for (const post of forum.posts) {
      for (const tag of post.tags) {
        const normalizedTag = normalizeTagValue(tag);
        tagCountMap.set(normalizedTag, (tagCountMap.get(normalizedTag) ?? 0) + 1);
      }
    }

    return [...tagCountMap.entries()]
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, 10);
  }, [forum.posts]);
  const normalizedSearchTerm = deferredSearchTerm.trim().toLowerCase();
  const compactSearchTerm = normalizeSearchValue(deferredSearchTerm.trim());
  const filteredPosts = useMemo(() => {
    const matchingPosts = forum.posts.filter((post) => {
      const normalizedPostTags = post.tags.map((tag) => normalizeTagValue(tag));
      const matchesTag = activeTag ? normalizedPostTags.includes(activeTag) : true;
      const searchableValues = [
        post.title,
        ...normalizedPostTags,
        post.author.id,
        post.author.email,
        String(post.id),
      ];
      const matchesSearch = normalizedSearchTerm
        ? searchableValues.some((value) => value.toLowerCase().includes(normalizedSearchTerm)) ||
          searchableValues.some((value) => normalizeSearchValue(value).includes(compactSearchTerm))
        : true;

      return matchesTag && matchesSearch;
    });

    return [...matchingPosts].sort((left, right) => {
      if (sortBy === "oldest") {
        return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
      }

      if (sortBy === "popular") {
        const leftScore = postPopularityScore(left);
        const rightScore = postPopularityScore(right);

        if (rightScore !== leftScore) {
          return rightScore - leftScore;
        }

        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
  }, [activeTag, compactSearchTerm, forum.posts, normalizedSearchTerm, sortBy]);

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

  const focusedPost = forum.posts.find((post) => post.id === focusedPostId) ?? null;

  async function handleCreatePost() {
    const wasSuccessful = await submitJson(
      "/api/forum",
      {
        method: "POST",
        body: JSON.stringify({
          title,
          content,
          tags: parseTagString(tagInput),
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
      setIsComposerOpen(false);
    }
  }

  function addMediaField() {
    if (media.length >= FORUM_MEDIA_LIMIT) return;
    setMedia((current) => [...current, { key: Date.now() + current.length, kind: "image", url: "" }]);
  }

  function applyTagFilter(tag: string) {
    const normalizedTag = normalizeTagValue(tag);
    setSearchTerm("");
    setActiveTag((current) => (current === normalizedTag ? null : normalizedTag));
    setFocusedPostId(null);
    setCommentTargetPostId(null);

    window.requestAnimationFrame(() => {
      filterPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-[96rem] space-y-8 px-4 py-10 sm:px-6 lg:px-8">
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
    <section className="mx-auto max-w-[90rem] space-y-7 px-3 py-8 pb-24 sm:px-4 lg:px-5">
      <div className="max-w-[84rem] overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm">
        <div className="grid gap-5 p-5 lg:grid-cols-[48rem_minmax(14rem,1fr)] lg:p-6">
          <div>
            <p className="font-mono text-lg tracking-[0.22em] text-primary uppercase sm:text-xl">Forum</p>
            <h1 className="mt-2 max-w-lg font-heading text-3xl font-bold leading-[0.95] tracking-tight text-foreground sm:text-[3.05rem]">
              Community <span className="text-primary italic">Discussions</span>
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
              Ask questions, share experiences, and build practical support around women&apos;s health in one calm space.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:ml-auto lg:w-full lg:max-w-[24rem]">
            <StatChip label="Discussions" value={String(discussionCount)} />
            <StatChip label="Replies" value={String(replyCount)} />
            <StatChip label="Active Tags" value={String(uniqueTagCount)} />
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:ml-32 lg:grid-cols-[48rem_18rem]">
        <div className="space-y-6 lg:max-w-[48rem]">
          <div ref={filterPanelRef} className="rounded-[1.8rem] border border-primary/15 bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-heading text-[1.85rem] font-semibold text-foreground">Find a discussion</p>
                <p className="mt-1 text-sm text-muted-foreground">Search by title or tag, or click a tag chip to narrow the list.</p>
              </div>
              {(searchTerm || activeTag) ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveTag(null);
                    setSortBy("latest");
                  }}
                  className="rounded-full border border-primary/15 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                >
                  Clear filters
                </button>
              ) : null}
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex flex-col gap-3 lg:flex-row">
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by title, tag, user ID, email, or discussion ID"
                  className="w-full rounded-3xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/40"
                />
                <div className="flex items-center gap-3 rounded-3xl border border-primary/15 bg-background px-4 py-3 lg:min-w-56">
                  <label htmlFor="forum-sort" className="shrink-0 text-sm font-medium text-muted-foreground">
                    Sort by
                  </label>
                  <select
                    id="forum-sort"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as ForumSortOption)}
                    className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none"
                  >
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                    <option value="popular">Popular</option>
                  </select>
                </div>
              </div>
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
              expanded={false}
              canInteract={forum.viewer.isAuthenticated}
              isAdminViewer={forum.viewer.role === "admin"}
              activeTag={activeTag}
              availableTags={availableTags}
              onOpen={(postId) => {
                setFocusedPostId(postId);
                setCommentTargetPostId(null);
              }}
              onOpenComments={(postId) => {
                setFocusedPostId(postId);
                setCommentTargetPostId(postId);
              }}
              onClose={() => setFocusedPostId(null)}
              onTagClick={applyTagFilter}
              onVote={(postId, voteType) =>
                submitJson(
                  `/api/forum/posts/${postId}/vote`,
                  { method: "POST", body: JSON.stringify({ voteType }) },
                  `post-${postId}`
                )
              }
              onDelete={(postId) => {
                if (!window.confirm("Delete this post? This action cannot be undone.")) {
                  return Promise.resolve(false);
                }

                return submitJson(`/api/forum/posts/${postId}`, { method: "DELETE" }, `post-${postId}`);
              }}
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
              onReport={(postId, reason) =>
                submitJson(
                  `/api/forum/posts/${postId}/report`,
                  { method: "POST", body: JSON.stringify({ reason }) },
                  `post-${postId}`
                )
              }
              onCommentVote={(commentId, voteType) =>
                submitJson(
                  `/api/forum/comments/${commentId}/vote`,
                  { method: "POST", body: JSON.stringify({ voteType }) },
                  `comment-${commentId}`
                )
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
              onCommentReport={(commentId, reason) =>
                submitJson(
                  `/api/forum/comments/${commentId}/report`,
                  { method: "POST", body: JSON.stringify({ reason }) },
                  `comment-${commentId}`
                )
              }
            />
          ))}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-5 lg:self-start">
          <div className="overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-white via-card to-primary/5 shadow-sm">
            <div className="border-b border-primary/10 px-5 py-4">
              <p className="font-mono text-xs tracking-[0.22em] text-primary uppercase">Trending now</p>
              <h2 className="mt-2 font-heading text-2xl font-semibold text-foreground">Topics and tags</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Jump into the conversations people are engaging with the most.
              </p>
            </div>

            <div className="grid gap-5 p-5">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">Trending topics</p>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Top {trendingTopics.length}
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {trendingTopics.length ? (
                    trendingTopics.map((post, index) => (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() => {
                          setFocusedPostId(post.id);
                          setCommentTargetPostId(null);
                        }}
                        className="w-full rounded-[1.4rem] border border-primary/12 bg-white/80 px-4 py-3 text-left transition hover:border-primary/30 hover:bg-primary/5"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-semibold text-foreground">{post.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {postPopularityScore(post)} activity points
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="rounded-[1.4rem] border border-dashed border-primary/15 px-4 py-5 text-sm text-muted-foreground">
                      Trending topics will appear here once discussions start picking up.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">Trending tags</p>
                  <span className="text-xs text-muted-foreground">Click to filter</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {trendingTags.length ? (
                    trendingTags.map(([tag, count]) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => applyTagFilter(tag)}
                        className={[
                          "rounded-full border px-3.5 py-2 text-sm font-medium transition",
                          activeTag === tag
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-primary/15 bg-white text-foreground hover:border-primary/30 hover:text-primary",
                        ].join(" ")}
                      >
                        #{tag} <span className="text-xs opacity-75">({count})</span>
                      </button>
                    ))
                  ) : (
                    <p className="rounded-[1.4rem] border border-dashed border-primary/15 px-4 py-5 text-sm text-muted-foreground">
                      Tags will show here as people begin categorizing discussions.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {focusedPost ? (
        <div
          className="fixed inset-0 z-40 flex items-start justify-center bg-black/40 px-4 py-6 backdrop-blur-sm sm:px-6"
          onClick={() => {
            setFocusedPostId(null);
            setCommentTargetPostId(null);
          }}
        >
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto" onClick={(event) => event.stopPropagation()}>
            <ForumPostCard
              post={focusedPost}
              busyKey={busyKey}
              expanded
              canInteract={forum.viewer.isAuthenticated}
              isAdminViewer={forum.viewer.role === "admin"}
              activeTag={activeTag}
              availableTags={availableTags}
              autoOpenComments={commentTargetPostId === focusedPost.id}
              onOpen={() => undefined}
              onOpenComments={() => undefined}
              onClose={() => {
                setFocusedPostId(null);
                setCommentTargetPostId(null);
              }}
              onTagClick={applyTagFilter}
              onVote={(postId, voteType) =>
                submitJson(
                  `/api/forum/posts/${postId}/vote`,
                  { method: "POST", body: JSON.stringify({ voteType }) },
                  `post-${postId}`
                )
              }
              onDelete={(postId) => {
                if (!window.confirm("Delete this post? This action cannot be undone.")) {
                  return Promise.resolve(false);
                }

                setFocusedPostId(null);
                return submitJson(`/api/forum/posts/${postId}`, { method: "DELETE" }, `post-${postId}`);
              }}
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
              onReport={(postId, reason) =>
                submitJson(
                  `/api/forum/posts/${postId}/report`,
                  { method: "POST", body: JSON.stringify({ reason }) },
                  `post-${postId}`
                )
              }
              onCommentVote={(commentId, voteType) =>
                submitJson(
                  `/api/forum/comments/${commentId}/vote`,
                  { method: "POST", body: JSON.stringify({ voteType }) },
                  `comment-${commentId}`
                )
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
              onCommentReport={(commentId, reason) =>
                submitJson(
                  `/api/forum/comments/${commentId}/report`,
                  { method: "POST", body: JSON.stringify({ reason }) },
                  `comment-${commentId}`
                )
              }
            />
          </div>
        </div>
      ) : null}

      <div className="fixed right-2 bottom-4 z-30 sm:right-4 sm:bottom-6 lg:right-5">
        {isComposerOpen ? (
          <div className="mb-4 w-[min(92vw,30rem)] rounded-[2rem] border border-primary/15 bg-card p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-heading text-xl font-semibold text-foreground">Start a discussion</p>
                <p className="mt-1 text-sm text-muted-foreground">Clear titles and a little context make replies much faster.</p>
              </div>
              <div className="rounded-2xl bg-primary/8 px-3 py-2 text-xs font-medium text-primary">
                {FORUM_TAG_LIMIT} tags max
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Discussion title"
                className="w-full rounded-3xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/40"
              />
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={5}
                placeholder="What would you like help with?"
                className="w-full rounded-[1.75rem] border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/40"
              />
              <TagSelector
                value={tagInput}
                onChange={setTagInput}
                availableTags={availableTags}
                placeholder="Type custom tags, separated by commas"
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

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCreatePost}
                  disabled={!forum.viewer.isAuthenticated || busyKey === "create-post"}
                  className="flex-1 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyKey === "create-post" ? "Saving..." : forum.viewer.isAuthenticated ? "Publish discussion" : "Sign in to post"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="rounded-full border border-primary/15 px-5 py-3 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="group relative flex items-center justify-end gap-3">
          <div className="pointer-events-none absolute right-0 bottom-full mb-3 w-64 rounded-2xl border border-primary/15 bg-white/95 p-3 text-sm text-muted-foreground opacity-0 shadow-lg transition duration-200 group-hover:opacity-100">
            Add a title, a little context, optional tags, and media links when you want the community to jump in faster.
          </div>
          <button
            type="button"
            onClick={() => setIsComposerOpen((current) => !current)}
            className="rounded-full border border-primary/20 bg-gradient-to-r from-primary via-accent to-secondary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25"
          >
            Start a discussion
          </button>
        </div>
      </div>
    </section>
  );
}

function ForumPostCard({
  post,
  busyKey,
  expanded,
  canInteract,
  isAdminViewer,
  activeTag,
  availableTags,
  autoOpenComments = false,
  onOpen,
  onOpenComments,
  onClose,
  onTagClick,
  onVote,
  onDelete,
  onEdit,
  onComment,
  onReport,
  onCommentVote,
  onCommentDelete,
  onCommentEdit,
  onCommentReport,
}: {
  post: ForumPostRecord;
  busyKey: string | null;
  expanded: boolean;
  canInteract: boolean;
  isAdminViewer: boolean;
  activeTag: string | null;
  availableTags: string[];
  autoOpenComments?: boolean;
  onOpen: (postId: number) => void;
  onOpenComments: (postId: number) => void;
  onClose: () => void;
  onTagClick: (tag: string) => void;
  onVote: (postId: number, voteType: "upvote" | "downvote") => void;
  onDelete: (postId: number) => void;
  onEdit: (
    postId: number,
    payload: { title: string; content: string; tags: string[]; isAnonymous: boolean; media: ForumMediaInput[] }
  ) => void;
  onComment: (postId: number, parentCommentId: number | null, content: string) => void;
  onReport: (postId: number, reason: string) => void;
  onCommentVote: (commentId: number, voteType: "upvote" | "downvote") => void;
  onCommentDelete: (commentId: number) => void;
  onCommentEdit: (commentId: number, content: string) => void;
  onCommentReport: (commentId: number, reason: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(expanded);
  const [draftTitle, setDraftTitle] = useState(post.title);
  const [draftContent, setDraftContent] = useState(post.content);
  const [draftTags, setDraftTags] = useState(post.tags.join(", "));
  const [draftComment, setDraftComment] = useState("");
  const [draftAnonymous, setDraftAnonymous] = useState(post.isAnonymous);
  const commentTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const busy = busyKey === `post-${post.id}`;
  const commentCount = countReplies(post.comments);

  useEffect(() => {
    if (expanded) {
      setShowCommentBox(true);
    }
  }, [expanded]);

  useEffect(() => {
    if (!expanded || !autoOpenComments) return;

    setShowCommentBox(true);
    const frame = window.requestAnimationFrame(() => {
      commentTextareaRef.current?.focus();
      commentTextareaRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [autoOpenComments, expanded]);

  function handleOpen() {
    onOpen(post.id);
  }

  function handleCardClick(event: React.MouseEvent<HTMLElement>) {
    if (expanded || isEditing) return;

    const target = event.target as HTMLElement;
    if (target.closest("button, input, textarea, select, summary, video, a")) {
      return;
    }

    handleOpen();
  }

  return (
    <article
      className={[
        "overflow-hidden rounded-[2rem] border border-primary/15 bg-card shadow-sm",
        expanded ? "mx-auto" : "cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md",
      ].join(" ")}
      onClick={handleCardClick}
    >
      <div className="h-2 w-full bg-gradient-to-r from-primary via-accent to-secondary" />
      <div className={expanded ? "p-6 sm:p-7" : "p-3.5 sm:p-4"}>
        <div className={expanded ? "flex flex-wrap items-start justify-between gap-4" : "flex items-start justify-between gap-3"}>
          <div className="min-w-0 flex-1">
            <div className={expanded ? "flex items-start gap-3 min-w-0" : "flex items-start gap-3 min-w-0"}>
              {post.isAnonymous ? (
                <div className={expanded ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs text-primary" : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs text-primary"}>
                  {initialsFromEmail(post.author.email)}
                </div>
              ) : (
                <Link
                  href={forumProfileHref(post.author.id)}
                  className={expanded ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs text-primary transition hover:bg-primary/16" : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs text-primary transition hover:bg-primary/16"}
                  onClick={(event) => event.stopPropagation()}
                >
                  {initialsFromEmail(post.author.email)}
                </Link>
              )}
              <div className="min-w-0 flex-1">
                <div className={expanded ? "flex items-center gap-2 min-w-0" : "flex items-center gap-2 min-w-0"}>
                  {post.isAnonymous ? (
                    <p className={expanded ? "truncate text-sm font-semibold text-foreground" : "truncate text-sm font-semibold text-foreground"}>{post.author.email}</p>
                  ) : (
                    <Link
                      href={forumProfileHref(post.author.id)}
                      className={expanded ? "truncate text-sm font-semibold text-foreground transition hover:text-primary" : "truncate text-sm font-semibold text-foreground transition hover:text-primary"}
                      onClick={(event) => event.stopPropagation()}
                    >
                      {post.author.email}
                    </Link>
                  )}
                  <p className={expanded ? "shrink-0 text-xs text-muted-foreground" : "shrink-0 text-xs text-muted-foreground"}>{formatTimeLabel(post.updatedAt)}</p>
                </div>
                <div className={expanded ? "mt-0.5 flex flex-wrap items-center gap-1.5" : "mt-1 flex flex-wrap items-center gap-1.5"}>
                  <span className={`rounded-full border ${expanded ? "px-2 py-0.5 text-[10px]" : "px-2 py-0.5 text-[10px]"} font-medium ${tagStyles(post.author.tag)}`}>
                    {post.author.tag}
                  </span>
                  {post.isAnonymous ? (
                    <span className={expanded ? "rounded-full border border-primary/20 bg-primary/8 px-2 py-0.5 text-[10px] font-medium text-primary" : "rounded-full border border-primary/20 bg-primary/8 px-2 py-0.5 text-[10px] font-medium text-primary"}>
                      Posted anonymously
                    </span>
                  ) : null}
                  {post.isAnonymous && isAdminViewer && post.realAuthor ? (
                    <Link
                      href={forumProfileHref(post.realAuthor.id)}
                      className={expanded ? "rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 transition hover:bg-amber-100" : "rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 transition hover:bg-amber-100"}
                      onClick={(event) => event.stopPropagation()}
                    >
                      Real user: {post.realAuthor.email}
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <div className={expanded ? "flex max-w-full shrink-0 flex-wrap items-start justify-end gap-1.5 sm:max-w-[35%]" : "flex shrink-0 items-center gap-1.5 self-start"}>
            {post.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onTagClick(tag);
                }}
                className={[
                  expanded ? "max-w-full truncate rounded-full px-3 py-1 text-xs font-medium transition" : "max-w-[4.25rem] truncate rounded-full px-2.5 py-0.5 text-[11px] font-medium transition",
                  activeTag === tag
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/8 text-primary hover:bg-primary/14",
                ].join(" ")}
                title={`#${tag}`}
              >
                #{tag}
              </button>
            ))}
            {post.canManage ? (
              <ManagementMenu
                deleteDisabled={busy}
                onEdit={() => setIsEditing((current) => !current)}
                onDelete={() => {
                  void onDelete(post.id);
                }}
              />
            ) : canInteract ? (
              <ManagementMenu
                onReport={() => {
                  const reason = window.prompt("Why are you reporting this discussion?");
                  if (!reason?.trim()) return;
                  void onReport(post.id, reason.trim());
                }}
              />
            ) : null}
            {expanded ? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-primary/15 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
              >
                Close
              </button>
            ) : null}
          </div>
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
            <TagSelector
              value={draftTags}
              onChange={setDraftTags}
              availableTags={availableTags}
              placeholder="Type custom tags, separated by commas"
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
                    tags: parseTagString(draftTags),
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
            <h2 className={expanded ? "mt-5 font-heading text-[2.35rem] font-semibold leading-tight text-foreground" : "mt-3 font-heading text-[1.15rem] font-semibold leading-snug text-foreground"}>
              {post.title}
            </h2>
            <p
              className={[
                expanded
                  ? "mt-3 whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm leading-6 text-foreground/90"
                  : "mt-2 whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-[13px] leading-5 text-foreground/90 line-clamp-2",
                expanded ? "" : "",
              ].join(" ")}
            >
              {post.content}
            </p>
            <div className={expanded ? "mt-5" : "mt-3"}>
              <MediaPreview media={post.media} />
            </div>
            <div className={expanded ? "mt-4 flex items-center justify-between gap-3 border-t border-primary/10 pt-3" : "mt-3 flex items-center justify-between gap-2 border-t border-primary/10 pt-2.5"}>
              <div className={expanded ? "flex flex-wrap items-center gap-3" : "flex flex-wrap items-center gap-2.5"}>
                <InlineActionButton
                  active={post.viewerHasUpvoted}
                  disabled={!canInteract || busy}
                  onClick={() => onVote(post.id, "upvote")}
                >
                  <ArrowUp className="h-4 w-4" />
                  <span>{post.upvotes > 0 ? post.upvotes : "Upvote"}</span>
                </InlineActionButton>
                <InlineActionButton
                  active={post.viewerHasDownvoted}
                  disabled={!canInteract || busy}
                  onClick={() => onVote(post.id, "downvote")}
                >
                  <ArrowDown className="h-4 w-4" />
                  <span>{post.downvotes > 0 ? post.downvotes : "Downvote"}</span>
                </InlineActionButton>
                <InlineActionButton
                  onClick={() => {
                    if (expanded) {
                      setShowCommentBox((current) => !current);
                      return;
                    }

                    onOpenComments(post.id);
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>{commentCount > 0 ? `${commentCount} comments` : "Comment"}</span>
                </InlineActionButton>
              </div>
              {!expanded ? (
                <button
                  type="button"
                  onClick={handleOpen}
                  className="text-sm font-medium text-primary transition hover:text-primary/80"
                >
                  Open discussion
                </button>
              ) : null}
            </div>
          </>
        )}

        {expanded && showCommentBox ? (
          <div className="mt-6 rounded-[1.75rem] border border-primary/12 bg-primary/5 p-4">
            <textarea
              ref={commentTextareaRef}
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

        {expanded ? (
          <div className="mt-6">
            <CommentTree
              comments={post.comments}
              canInteract={canInteract}
              busyKey={busyKey}
              onVote={onCommentVote}
              onDelete={onCommentDelete}
              onReply={(commentId, nextContent) => onComment(post.id, commentId, nextContent)}
              onEdit={onCommentEdit}
              onReport={onCommentReport}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}
