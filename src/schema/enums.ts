// Custom enum types for Maaya database schema

export const userRole = ["user", "doctor", "admin"] as const;
export type UserRole = (typeof userRole)[number];

export const accountStatus = ["pending", "active", "banned", "suspended"] as const;
export type AccountStatus = (typeof accountStatus)[number];

export const voteType = ["upvote", "downvote"] as const;
export type VoteType = (typeof voteType)[number];

export const contentStatus = ["active", "hidden", "removed"] as const;
export type ContentStatus = (typeof contentStatus)[number];

export const reportStatus = ["pending", "reviewed"] as const;
export type ReportStatus = (typeof reportStatus)[number];

export const alertType = [
  "reminder",
  "reply",
  "doctor_response",
  "article_update",
  "system",
  "question_assigned",
  "forum_comment",
  "forum_reply",
  "moderation_update",
  "account_update",
] as const;
export type AlertType = (typeof alertType)[number];

export const notificationPriority = ["low", "normal", "high"] as const;
export type NotificationPriority = (typeof notificationPriority)[number];

export const forumMediaKind = ["image", "video"] as const;
export type ForumMediaKind = (typeof forumMediaKind)[number];

export const questionStatus = ["pending", "answered", "closed"] as const;
export type QuestionStatus = (typeof questionStatus)[number];
