import type { AccountStatus, ContentStatus, ReportStatus, UserRole } from "@/src/schema/enums";

export type ModerationAuthorRecord = {
  id: string | null;
  email: string;
  name: string | null;
  role: UserRole | null;
  accountStatus: AccountStatus | null;
};

export type ModerationReportRecord = {
  id: number;
  status: ReportStatus | null;
  reason: string;
  createdAt: string;
  reporter: {
    id: string;
    email: string;
    name: string | null;
  } | null;
  targetType: "post" | "comment";
  target: {
    id: number;
    status: ContentStatus | null;
    title: string | null;
    content: string;
    postId: number | null;
    postTitle: string | null;
    isAnonymous: boolean;
    author: ModerationAuthorRecord | null;
  } | null;
};

export type ModerationUserRecord = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  accountStatus: AccountStatus | null;
  createdAt: string;
  postCount: number;
  anonymousPostCount: number;
  commentCount: number;
  pendingReports: number;
  reviewedReports: number;
};

export type ModerationSnapshot = {
  reports: ModerationReportRecord[];
  users: ModerationUserRecord[];
};
