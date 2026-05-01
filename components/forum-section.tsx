"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowDown, ArrowUp, ImagePlus, MessageSquare, MoreHorizontal, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { isSuspendedAndActive, formatRestrictionRemaining } from "@/lib/account-restriction-helpers";
import type {
  ForumAuthorTag,
  ForumCommentRecord,
  ForumMediaInput,
  ForumPostRecord,
  ForumResponse,
  ForumVoteSnapshot,
} from "@/lib/forum-types";
import { FORUM_MEDIA_LIMIT, FORUM_TAG_LIMIT } from "@/lib/forum-types";
import { useConfirm } from "@/hooks/use-confirm";
import { Button } from "@/components/ui/button";

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
    return JSON.parse(text) as { error?: string } & Partial<ForumResponse> & Partial<ForumVoteSnapshot>;
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

function tagStyles(tag: ForumAuthorTag) {
  if (tag === "Admin") return "bg-secondary/10 text-secondary border-secondary/20";
  if (tag === "Doctor") return "bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800";
  return "bg-primary/10 text-primary border-primary/20";
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
  disabled,
}: {
  value: string;
  onChange: (nextValue: string) => void;
  availableTags: string[];
  placeholder: string;
  disabled?: boolean;
}) {
  const selectedTags = parseTagString(value);
  const suggestedTags = availableTags.filter((tag) => !selectedTags.includes(tag)).slice(0, 12);

  return (
    <div className="space-y-4">
      <div className="relative group">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-[1.5rem] border border-violet-200/60 bg-white/50 backdrop-blur-sm px-5 py-3.5 text-sm outline-none transition-all focus:border-violet-400 focus:bg-white focus:shadow-lg focus:shadow-violet-500/5 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-r from-violet-400/10 to-violet-400/10 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity" />
      </div>

      {selectedTags.length ? (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <button
              key={tag}
              type="button"
              disabled={disabled}
              onClick={() => onChange(stringifyTags(selectedTags.filter((item) => item !== tag)))}
              className="group flex items-center gap-1.5 rounded-full border border-rose-200 bg-violet-50 px-3.5 py-1.5 text-xs font-bold text-violet-700 transition-all hover:bg-violet-100 hover:border-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              #{tag}
              <span className="text-[10px] opacity-60 group-hover:opacity-100">✕</span>
            </button>
          ))}
        </div>
      ) : null}

      {suggestedTags.length ? (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            <span className="h-px w-4 bg-muted-foreground/30" />
            Suggested Topics
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                disabled={disabled}
                onClick={() => onChange(stringifyTags(toggleTag(selectedTags, tag)))}
                className="rounded-full border border-border/60 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-violet-300 hover:text-violet-600 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
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
  menuDisabled,
}: {
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  deleteDisabled?: boolean;
  /** When true (e.g. account suspended), actions are not available. */
  menuDisabled?: boolean;
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
        disabled={menuDisabled}
        onClick={() => {
          if (menuDisabled) return;
          setIsOpen((current) => !current);
        }}
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-primary/8 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
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

function isVoteSnapshot(data: unknown): data is ForumVoteSnapshot {
  if (!data || typeof data !== "object") return false;

  const candidate = data as Partial<ForumVoteSnapshot>;
  return (
    (candidate.target === "post" || candidate.target === "comment") &&
    typeof candidate.id === "number" &&
    typeof candidate.upvotes === "number" &&
    typeof candidate.downvotes === "number" &&
    typeof candidate.viewerHasUpvoted === "boolean" &&
    typeof candidate.viewerHasDownvoted === "boolean"
  );
}

function getOptimisticVoteSnapshot(
  target: "post" | "comment",
  item: Pick<ForumVoteSnapshot, "id" | "upvotes" | "downvotes" | "viewerHasUpvoted" | "viewerHasDownvoted">,
  voteType: "upvote" | "downvote"
): ForumVoteSnapshot {
  let upvotes = item.upvotes;
  let downvotes = item.downvotes;
  let viewerHasUpvoted = item.viewerHasUpvoted;
  let viewerHasDownvoted = item.viewerHasDownvoted;

  if (voteType === "upvote") {
    if (viewerHasUpvoted) {
      upvotes = Math.max(0, upvotes - 1);
      viewerHasUpvoted = false;
    } else {
      if (viewerHasDownvoted) {
        downvotes = Math.max(0, downvotes - 1);
        viewerHasDownvoted = false;
      }
      upvotes += 1;
      viewerHasUpvoted = true;
    }
  } else if (viewerHasDownvoted) {
    downvotes = Math.max(0, downvotes - 1);
    viewerHasDownvoted = false;
  } else {
    if (viewerHasUpvoted) {
      upvotes = Math.max(0, upvotes - 1);
      viewerHasUpvoted = false;
    }
    downvotes += 1;
    viewerHasDownvoted = true;
  }

  return {
    target,
    id: item.id,
    upvotes,
    downvotes,
    viewerHasUpvoted,
    viewerHasDownvoted,
  };
}

function applyVoteSnapshotToComments(
  comments: ForumCommentRecord[],
  voteSnapshot: ForumVoteSnapshot
): ForumCommentRecord[] {
  return comments.map((comment) => {
    const updatedReplies: ForumCommentRecord[] = applyVoteSnapshotToComments(comment.replies, voteSnapshot);

    if (voteSnapshot.target === "comment" && comment.id === voteSnapshot.id) {
      return {
        ...comment,
        upvotes: voteSnapshot.upvotes,
        downvotes: voteSnapshot.downvotes,
        viewerHasUpvoted: voteSnapshot.viewerHasUpvoted,
        viewerHasDownvoted: voteSnapshot.viewerHasDownvoted,
        replies: updatedReplies,
      };
    }

    if (updatedReplies !== comment.replies) {
      return { ...comment, replies: updatedReplies };
    }

    return comment;
  });
}

function findCommentVoteSnapshot(comments: ForumCommentRecord[], commentId: number): ForumVoteSnapshot | null {
  for (const comment of comments) {
    if (comment.id === commentId) {
      return {
        target: "comment",
        id: comment.id,
        upvotes: comment.upvotes,
        downvotes: comment.downvotes,
        viewerHasUpvoted: comment.viewerHasUpvoted,
        viewerHasDownvoted: comment.viewerHasDownvoted,
      };
    }

    const nestedComment = findCommentVoteSnapshot(comment.replies, commentId);
    if (nestedComment) {
      return nestedComment;
    }
  }

  return null;
}

function findVoteSnapshotInForum(
  currentForum: ForumResponse,
  target: "post" | "comment",
  itemId: number
): ForumVoteSnapshot | null {
  if (target === "post") {
    const post = currentForum.posts.find((entry) => entry.id === itemId);
    return post
      ? {
          target: "post",
          id: post.id,
          upvotes: post.upvotes,
          downvotes: post.downvotes,
          viewerHasUpvoted: post.viewerHasUpvoted,
          viewerHasDownvoted: post.viewerHasDownvoted,
        }
      : null;
  }

  for (const post of currentForum.posts) {
    const comment = findCommentVoteSnapshot(post.comments, itemId);
    if (comment) {
      return comment;
    }
  }

  return null;
}

function applyVoteSnapshotToForum(currentForum: ForumResponse, voteSnapshot: ForumVoteSnapshot): ForumResponse {
  return {
    ...currentForum,
    posts: currentForum.posts.map((post) => {
      if (voteSnapshot.target === "post" && post.id === voteSnapshot.id) {
        return {
          ...post,
          upvotes: voteSnapshot.upvotes,
          downvotes: voteSnapshot.downvotes,
          viewerHasUpvoted: voteSnapshot.viewerHasUpvoted,
          viewerHasDownvoted: voteSnapshot.viewerHasDownvoted,
        };
      }

      const updatedComments = applyVoteSnapshotToComments(post.comments, voteSnapshot);
      if (updatedComments !== post.comments) {
        return { ...post, comments: updatedComments };
      }

      return post;
    }),
  };
}

function CommentTree({
  comments,
  canInteract,
  interactionLocked,
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
  interactionLocked: boolean;
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
          <div
            key={comment.id}
            className="rounded-[1.6rem] border border-primary/12 bg-white/85 p-4 shadow-sm"
          >
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
                      disabled={interactionLocked}
                      className="w-full rounded-3xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <div className="flex flex-wrap gap-2">
                      <ActionButton
                        active
                        disabled={busy || interactionLocked}
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
                    <InlineActionButton
                      active={comment.viewerHasUpvoted}
                      disabled={busy || interactionLocked || !canInteract}
                      onClick={() => onVote(comment.id, "upvote")}
                    >
                      <ArrowUp className="h-4 w-4" />
                      <span>{comment.upvotes > 0 ? comment.upvotes : "Upvote"}</span>
                    </InlineActionButton>
                    <InlineActionButton
                      active={comment.viewerHasDownvoted}
                      disabled={busy || interactionLocked || !canInteract}
                      onClick={() => onVote(comment.id, "downvote")}
                    >
                      <ArrowDown className="h-4 w-4" />
                      <span>{comment.downvotes > 0 ? comment.downvotes : "Downvote"}</span>
                    </InlineActionButton>
                    <InlineActionButton
                      disabled={interactionLocked || !canInteract}
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
                      menuDisabled={interactionLocked}
                      onEdit={() => {
                        setEditingId(comment.id);
                        setReplyingTo(null);
                        setDrafts((current) => ({ ...current, [comment.id]: comment.content }));
                      }}
                      onDelete={() => onDelete(comment.id)}
                    />
                  ) : canInteract ? (
                    <ManagementMenu
                      menuDisabled={interactionLocked}
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
                      disabled={interactionLocked}
                      className="w-full rounded-3xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <div className="flex flex-wrap gap-2">
                      <ActionButton
                        active
                        disabled={busy || interactionLocked}
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
                  interactionLocked={interactionLocked}
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

function ForumSectionContent() {
  const { confirm, ConfirmDialog } = useConfirm();
  const searchParams = useSearchParams();
  const initialPostId = searchParams.get("post");
  
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
  const [isGloballyAnonymous, setIsGloballyAnonymous] = useState(false);
  const [media, setMedia] = useState<MediaDraft[]>([{ key: 1, kind: "image", url: "" }]);
  const [userLikedTags, setUserLikedTags] = useState<string[]>([]);
  
  useEffect(() => {
    if (initialPostId && !isLoading && forum.posts.length > 0) {
      const postId = Number(initialPostId);
      if (!Number.isNaN(postId)) {
        setFocusedPostId(postId);
        // We'll let the render logic handle the scroll since the element needs to be in the DOM
      }
    }
  }, [initialPostId, isLoading, forum.posts.length]);

  const deferredSearchTerm = useDeferredValue(searchTerm);
  const filterPanelRef = useRef<HTMLDivElement | null>(null);
  const { data: session } = useSession();
  const interactionLocked = isSuspendedAndActive(
    session?.user?.accountStatus,
    session?.user?.restrictionEndsAt
  );

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

  useEffect(() => {
    let isMounted = true;
    async function loadLikedTags() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) return;
        const data = (await res.json()) as { likedTags?: unknown; isAnonymous?: unknown };
        const tags = Array.isArray(data.likedTags)
          ? data.likedTags.filter((t): t is string => typeof t === "string" && Boolean(t.trim())).map((t) => t.trim().toLowerCase())
          : [];
        if (isMounted) {
          setUserLikedTags(tags);
          setIsGloballyAnonymous(Boolean(data.isAnonymous));
        }
      } catch {
        // best-effort
      }
    }
    loadLikedTags();
    return () => { isMounted = false; };
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

  async function submitVote(
    url: string,
    nextBusyKey: string,
    target: "post" | "comment",
    itemId: number,
    voteType: "upvote" | "downvote"
  ) {
    const currentVote = findVoteSnapshotInForum(forum, target, itemId);
    if (!currentVote) {
      return submitJson(url, { method: "POST", body: JSON.stringify({ voteType }) }, nextBusyKey);
    }

    const optimisticVote = getOptimisticVoteSnapshot(target, currentVote, voteType);
    const previousForum = forum;

    setBusyKey(nextBusyKey);
    setError(null);
    setForum((current) => applyVoteSnapshotToForum(current, optimisticVote));

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voteType }),
      });

      const data = await readJsonResponse(response);
      if (!response.ok) {
        throw new Error((data && "error" in data && data.error) || "Something went wrong.");
      }

      if (isVoteSnapshot(data)) {
        setForum((current) => applyVoteSnapshotToForum(current, data));
      } else {
        await refreshForum();
      }

      return true;
    } catch (caught) {
      setForum(previousForum);
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
      return false;
    } finally {
      setBusyKey(null);
    }
  }

  const focusedPost = forum.posts.find((post) => post.id === focusedPostId) ?? null;

  async function handleCreatePost() {
    if (interactionLocked) {
      toast.error(
        "Your account is suspended. You can read discussions but cannot start new topics until the suspension lifts."
      );
      return;
    }
    const wasSuccessful = await submitJson(
      "/api/forum",
      {
        method: "POST",
        body: JSON.stringify({
          title,
          content,
          tags: parseTagString(tagInput),
          isAnonymous: isGloballyAnonymous || isAnonymous,
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
      <div className="relative max-w-[84rem] overflow-hidden rounded-[2.5rem] border border-violet-200/60 bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,0.15),_transparent_50%),linear-gradient(145deg,rgba(245,243,255,0.95),rgba(255,255,255,1))] dark:border-violet-900/30 dark:bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,0.15),_transparent_50%),linear-gradient(145deg,rgba(20,10,15,0.95),rgba(0,0,0,1))] shadow-2xl shadow-violet-900/5 group">
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-violet-400/20 blur-[100px] group-hover:bg-violet-400/30 transition-all duration-700" />
        <div className="relative grid gap-6 p-8 lg:grid-cols-[48rem_minmax(14rem,1fr)] lg:p-10 z-10">
          <div>
            <p className="font-mono text-lg tracking-[0.22em] text-violet-600 dark:text-violet-400 uppercase sm:text-xl">Community Hub</p>
            <h1 className="mt-2 max-w-lg font-heading text-3xl font-bold leading-[0.95] tracking-tight text-foreground sm:text-[3.05rem]">
              Open <span className="text-violet-600 italic">Discussions</span>
            </h1>
            <p className="mt-3 max-w-lg text-sm font-medium leading-6 text-muted-foreground">
              Ask questions, share experiences, and build practical support around health and wellness in one inclusive space.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:ml-auto lg:w-full lg:max-w-[24rem]">
            <StatChip label="Discussions" value={String(discussionCount)} />
            <StatChip label="Replies" value={String(replyCount)} />
            <StatChip label="Active Tags" value={String(uniqueTagCount)} />
          </div>
        </div>
      </div>

      {interactionLocked ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">Account suspended — read-only mode</p>
          <p className="mt-1 text-amber-900/90">
            Posting, commenting, voting, and reporting are disabled{" "}
            {formatRestrictionRemaining(session?.user?.restrictionEndsAt ?? null)}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-8 lg:ml-32 lg:flex-row lg:items-start lg:gap-8">
        <div className="min-w-0 flex-1 space-y-8 lg:max-w-[48rem]">
          <div ref={filterPanelRef} className="rounded-[2.5rem] border border-border/60 bg-card p-8 shadow-lg relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-100 dark:bg-rose-900/30 blur-3xl pointer-events-none" />
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between relative z-10">
              <div>
                <p className="font-heading text-2xl font-extrabold text-foreground">Find a discussion</p>
                <p className="mt-1 text-sm font-medium text-muted-foreground">Search by title or tag, or click a tag chip to narrow the list.</p>
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
                  {filteredPosts.length === 0 ? (
                    <>0 of {forum.posts.length} discussions</>
                  ) : (
                    <>
                      {filteredPosts.length} of {forum.posts.length} discussions
                      {filteredPosts.length !== forum.posts.length ? " matching" : ""}
                    </>
                  )}
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
              isGloballyAnonymous={isGloballyAnonymous}
              interactionLocked={interactionLocked}
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
                submitVote(
                  `/api/forum/posts/${postId}/vote`,
                  `post-${postId}`,
                  "post",
                  postId,
                  voteType
                )
              }
              onDelete={async (postId) => {
                const ok = await confirm({
                  title: "Delete this post?",
                  description: "This action cannot be undone.",
                  confirmLabel: "Delete",
                  destructive: true,
                });
                if (!ok) return false;

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
                submitVote(
                  `/api/forum/comments/${commentId}/vote`,
                  `comment-${commentId}`,
                  "comment",
                  commentId,
                  voteType
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

        <div className="w-full shrink-0 lg:w-80">
          <div className="space-y-8 lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto lg:overflow-x-hidden scrollbar-hidden">
            {userLikedTags.length > 0 && (
            <div className="overflow-hidden rounded-[2.5rem] border border-border/60 bg-card shadow-lg relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
              <div className="border-b border-border/50 px-6 py-5 relative z-10">
                <p className="font-mono text-xs font-bold tracking-[0.22em] text-indigo-600 dark:text-indigo-400 uppercase">Your interests</p>
                <h2 className="mt-2 font-heading text-xl font-extrabold text-foreground">Liked tags</h2>
                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  Click a tag to filter discussions matching your interests.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 p-6 relative z-10">
                {userLikedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => applyTagFilter(tag)}
                    className={[
                      "rounded-full border px-3.5 py-2 text-sm font-medium transition",
                      activeTag === tag
                        ? "border-secondary bg-secondary text-primary-foreground"
                        : "border-secondary/15 bg-white text-foreground hover:border-secondary/30 hover:text-secondary",
                    ].join(" ")}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
            )}

            <div className="overflow-hidden rounded-[2.5rem] border-2 border-violet-200/50 bg-gradient-to-b from-violet-50/50 to-violet-100/10 dark:border-violet-900/40 dark:from-violet-950/40 dark:to-background shadow-xl relative group/trending">
              <div className="absolute top-0 right-0 w-40 h-40 bg-violet-200/30 dark:bg-violet-700/20 rounded-full blur-[40px] pointer-events-none transition-transform duration-700 group-hover/trending:scale-150" />
            <div className="border-b border-violet-200/30 dark:border-violet-900/30 px-6 py-5 relative z-10">
              <p className="font-mono text-xs font-bold tracking-[0.22em] text-violet-600 dark:text-violet-400 uppercase flex items-center gap-2"><Sparkles className="size-3.5" /> Trending now</p>
              <h2 className="mt-2 font-heading text-2xl font-extrabold text-foreground">Topics & Tags</h2>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                Jump into the conversations people are engaging with the most.
              </p>
            </div>

            <div className="grid gap-6 p-6 relative z-10">
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
          </div>
        </div>
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
              isGloballyAnonymous={isGloballyAnonymous}
              interactionLocked={interactionLocked}
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
                submitVote(
                  `/api/forum/posts/${postId}/vote`,
                  `post-${postId}`,
                  "post",
                  postId,
                  voteType
                )
              }
              onDelete={async (postId) => {
                const ok = await confirm({
                  title: "Delete this post?",
                  description: "This action cannot be undone.",
                  confirmLabel: "Delete",
                  destructive: true,
                });
                if (!ok) return false;

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
                submitVote(
                  `/api/forum/comments/${commentId}/vote`,
                  `comment-${commentId}`,
                  "comment",
                  commentId,
                  voteType
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

      <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6 lg:right-8 flex flex-col items-end max-w-full">
        {isComposerOpen ? (
          <div className="mb-4 w-[min(94vw,32rem)] max-h-[calc(100vh-8rem)] overflow-y-auto rounded-[2.5rem] border border-violet-200/60 bg-white/95 backdrop-blur-2xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(139,92,246,0.15)] relative scrollbar-hidden">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-400/10 blur-[60px] pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-violet-400/10 blur-[60px] pointer-events-none" />
            
            <div className="relative z-10 flex items-start justify-between gap-6 mb-8">
              <div className="min-w-0">
                <h2 className="font-heading text-2xl font-extrabold text-foreground leading-tight">Start a discussion</h2>
                <p className="mt-2 text-sm font-medium text-muted-foreground leading-relaxed">Clear titles and a little context make replies much faster.</p>
              </div>
              <div className="shrink-0 rounded-2xl bg-violet-50 border border-violet-100 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-violet-600">
                {FORUM_TAG_LIMIT} tags max
              </div>
            </div>

            <div className="mt-8 space-y-6 relative z-10">
              {interactionLocked ? (
                <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-900">
                   <AlertTriangle className="size-4 shrink-0" />
                   Suspended accounts cannot start discussions.
                </div>
              ) : null}
              
              <div className="space-y-1.5">
                 <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="What's on your mind?"
                  disabled={interactionLocked}
                  className="w-full rounded-[1.5rem] border border-violet-100 bg-violet-50/30 px-5 py-4 text-sm font-medium outline-none transition-all focus:border-violet-400 focus:bg-white focus:shadow-lg focus:shadow-violet-500/5 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div className="space-y-1.5">
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={5}
                  placeholder="Provide some details or context..."
                  disabled={interactionLocked}
                  className="w-full rounded-[2rem] border border-violet-100 bg-violet-50/30 px-5 py-4 text-sm font-medium outline-none transition-all focus:border-violet-400 focus:bg-white focus:shadow-lg focus:shadow-violet-500/5 disabled:cursor-not-allowed disabled:opacity-60 resize-none"
                />
              </div>

              <TagSelector
                value={tagInput}
                onChange={setTagInput}
                availableTags={availableTags}
                placeholder="Type custom tags, separated by commas"
                disabled={interactionLocked}
              />

              <div className="rounded-[2rem] border border-violet-100/60 bg-violet-50/40 p-6 shadow-inner">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border border-violet-100 text-violet-500">
                       <ImagePlus className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Add Media</p>
                      <p className="text-[10px] font-medium text-muted-foreground">Photos or video links</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addMediaField}
                    disabled={interactionLocked || media.length >= FORUM_MEDIA_LIMIT}
                    className="rounded-full bg-white border border-rose-200 px-4 py-2 text-xs font-bold text-violet-600 transition-all hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add Field
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  {media.map((item) => (
                    <div key={item.key} className="flex flex-col gap-3 sm:flex-row items-center">
                      <select
                        value={item.kind}
                        disabled={interactionLocked}
                        onChange={(event) =>
                          setMedia((current) =>
                            current.map((entry) =>
                              entry.key === item.key ? { ...entry, kind: event.target.value as "image" | "video" } : entry
                            )
                          )
                        }
                        className="rounded-full border border-rose-200 bg-white px-4 py-3 text-xs font-bold outline-none transition focus:border-violet-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-32"
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </select>
                      <input
                        value={item.url}
                        disabled={interactionLocked}
                        onChange={(event) =>
                          setMedia((current) =>
                            current.map((entry) => (entry.key === item.key ? { ...entry, url: event.target.value } : entry))
                          )
                        }
                        placeholder="https://..."
                        className="flex-1 rounded-full border border-rose-200 bg-white px-5 py-3 text-xs font-medium outline-none transition focus:border-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                      <button
                        type="button"
                        disabled={interactionLocked}
                        onClick={() => setMedia((current) => current.filter((entry) => entry.key !== item.key))}
                        className="h-10 w-10 flex items-center justify-center rounded-full border border-rose-200 text-violet-400 transition-all hover:bg-violet-50 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <label
                  className={[
                    "relative flex items-center gap-3 cursor-pointer group",
                    isGloballyAnonymous ? "opacity-70" : "opacity-100",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={isGloballyAnonymous || isAnonymous}
                    disabled={isGloballyAnonymous || interactionLocked}
                    onChange={(event) => setIsAnonymous(event.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-violet-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                  <span className="text-sm font-bold text-foreground">Post as anonymous user</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCreatePost}
                  disabled={!forum.viewer.isAuthenticated || busyKey === "create-post" || interactionLocked}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyKey === "create-post"
                    ? "Saving..."
                    : interactionLocked
                      ? "Suspended"
                      : forum.viewer.isAuthenticated
                        ? "Publish Discussion"
                        : "Sign in to post"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="rounded-2xl border border-border/60 bg-white px-6 py-4 text-sm font-bold text-muted-foreground transition-all hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200"
                >
                  Cancel
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
            disabled={interactionLocked}
            title={interactionLocked ? "Your account is suspended" : undefined}
            onClick={() => setIsComposerOpen((current) => !current)}
            className="rounded-full border border-primary/20 bg-gradient-to-r from-primary via-accent to-secondary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start a discussion
          </button>
        </div>
      </div>
      <ConfirmDialog />
    </section>
  );
}

export function ForumSection() {
  return (
    <Suspense fallback={
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
    }>
      <ForumSectionContent />
    </Suspense>
  );
}

function ForumPostCard({
  post,
  busyKey,
  expanded,
  canInteract,
  isAdminViewer,
  isGloballyAnonymous,
  interactionLocked,
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
  isGloballyAnonymous: boolean;
  interactionLocked: boolean;
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
        "overflow-hidden rounded-[2.5rem] border bg-card/80 backdrop-blur-sm transition-all duration-300",
        expanded 
          ? "mx-auto shadow-2xl border-violet-200/60 dark:border-violet-800/40 max-w-4xl" 
          : "cursor-pointer border-border/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-violet-300/50 hover:bg-white dark:hover:bg-card group/card",
      ].join(" ")}
      onClick={handleCardClick}
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-violet-400 via-violet-400 to-indigo-400 opacity-80 group-hover/card:opacity-100 transition-opacity" />
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
                  {post.hasDoctorReply ? (
                    <span className={`rounded-full border ${expanded ? "px-2 py-0.5 text-[10px]" : "px-2 py-0.5 text-[10px]"} font-medium ${tagStyles("Doctor")}`}>
                      Doctor
                    </span>
                  ) : null}
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
                menuDisabled={interactionLocked}
                onEdit={() => setIsEditing((current) => !current)}
                onDelete={() => {
                  void onDelete(post.id);
                }}
              />
            ) : canInteract ? (
              <ManagementMenu
                menuDisabled={interactionLocked}
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
              disabled={interactionLocked}
              className="w-full rounded-3xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <textarea
              value={draftContent}
              onChange={(event) => setDraftContent(event.target.value)}
              rows={5}
              disabled={interactionLocked}
              className="w-full rounded-[1.75rem] border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <TagSelector
              value={draftTags}
              onChange={setDraftTags}
              availableTags={availableTags}
              placeholder="Type custom tags, separated by commas"
              disabled={interactionLocked}
            />
            <div>
              <label
                className={[
                  "flex items-center gap-3 text-sm",
                  isGloballyAnonymous ? "text-muted-foreground/70" : "text-foreground",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  checked={isGloballyAnonymous || draftAnonymous}
                  disabled={isGloballyAnonymous || interactionLocked}
                  onChange={(event) => setDraftAnonymous(event.target.checked)}
                  onClick={(event) => {
                    if (isGloballyAnonymous) {
                      event.preventDefault();
                      toast.info(
                        "Anonymous posting is turned on in your profile settings. Turn it off from Profile → Privacy to post with your identity."
                      );
                    }
                  }}
                  className="disabled:cursor-not-allowed disabled:opacity-60"
                />
                Post as anonymous user
              </label>
              {isGloballyAnonymous ? (
                <p className="mt-1.5 text-xs text-primary">
                  Anonymous mode is on from your profile.
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton
                active
                disabled={busy || interactionLocked}
                onClick={() => {
                  onEdit(post.id, {
                    title: draftTitle,
                    content: draftContent,
                    tags: parseTagString(draftTags),
                    isAnonymous: isGloballyAnonymous || draftAnonymous,
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
                  disabled={!canInteract || busy || interactionLocked}
                  onClick={() => onVote(post.id, "upvote")}
                >
                  <ArrowUp className="h-4 w-4" />
                  <span>{post.upvotes > 0 ? post.upvotes : "Upvote"}</span>
                </InlineActionButton>
                <InlineActionButton
                  active={post.viewerHasDownvoted}
                  disabled={!canInteract || busy || interactionLocked}
                  onClick={() => onVote(post.id, "downvote")}
                >
                  <ArrowDown className="h-4 w-4" />
                  <span>{post.downvotes > 0 ? post.downvotes : "Downvote"}</span>
                </InlineActionButton>
                <InlineActionButton
                  disabled={interactionLocked || !canInteract}
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
              disabled={!canInteract || interactionLocked}
              className="w-full rounded-[1.5rem] border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <ActionButton
                active
                disabled={!canInteract || busy || interactionLocked}
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
              interactionLocked={interactionLocked}
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
