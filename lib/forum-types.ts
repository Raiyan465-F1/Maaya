import type { ForumMediaKind } from "@/src/schema/enums";

export type ForumAuthorTag = "Admin" | "User";

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
  viewerHasUpvoted: boolean;
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
  author: {
    id: string;
    email: string;
    tag: ForumAuthorTag;
  };
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

export const FORUM_MEDIA_LIMIT = 4;
export const FORUM_TAG_LIMIT = 5;
