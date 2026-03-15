import { pgEnum, pgTable, text, timestamp, uuid, bigint } from "drizzle-orm/pg-core";
import { users } from "./users";
import { forumPosts, comments } from "./forum";
import { reportStatus } from "./enums";

export const reportStatusEnum = pgEnum("report_status", reportStatus);

export const reports = pgTable("reports", {
  id: bigint("report_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  reporterId: uuid("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: bigint("post_id", { mode: "number" }).references(() => forumPosts.id, { onDelete: "cascade" }),
  commentId: bigint("comment_id", { mode: "number" }).references(() => comments.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  status: reportStatusEnum("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});