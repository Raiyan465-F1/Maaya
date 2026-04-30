import type { ForumMediaKind } from "@/src/schema/enums";

export type ForumAuthorTag = "Admin" | "Doctor" | "User";

export type ForumMediaInput = {
  kind: ForumMediaKind;
  url: string;
};

export type ForumMediaRecord = ForumMediaInput & {
  id: number;
};

export type ForumCommentRecord = {
  id: number;
  postId: number;
  parentCommentId: number | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    email: string;
    tag: ForumAuthorTag;
  };
  upvotes: number;
  downvotes: number;
  viewerHasUpvoted: boolean;
  viewerHasDownvoted: boolean;
  canManage: boolean;
  replies: ForumCommentRecord[];
};

export type ForumPostRecord = {
  id: number;
  title: string;
  content: string;
  tags: string[];
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  /** True when any reply in the thread was written by a verified doctor. */
  hasDoctorReply: boolean;
  author: {
    id: string;
    email: string;
    tag: ForumAuthorTag;
  };
  realAuthor?: {
    id: string;
    email: string;
    tag: ForumAuthorTag;
  } | null;
  media: ForumMediaRecord[];
  upvotes: number;
  downvotes: number;
  viewerHasUpvoted: boolean;
  viewerHasDownvoted: boolean;
  canManage: boolean;
  comments: ForumCommentRecord[];
};

export type ForumResponse = {
  viewer: {
    isAuthenticated: boolean;
    id: string | null;
    role: string | null;
    tag: ForumAuthorTag | null;
  };
  posts: ForumPostRecord[];
};

export type ForumVoteSnapshot = {
  target: "post" | "comment";
  id: number;
  upvotes: number;
  downvotes: number;
  viewerHasUpvoted: boolean;
  viewerHasDownvoted: boolean;
};

export const FORUM_MEDIA_LIMIT = 4;
export const FORUM_TAG_LIMIT = 5;
