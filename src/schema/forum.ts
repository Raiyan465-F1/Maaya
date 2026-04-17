import { AnyPgColumn, pgEnum, pgTable, text, timestamp, uuid, varchar, bigint, boolean, integer } from "drizzle-orm/pg-core";
import { users } from "./users";
import { contentStatus, forumMediaKind, voteType } from "./enums";

export const contentStatusEnum = pgEnum("content_status", contentStatus);
export const voteTypeEnum = pgEnum("vote_type", voteType);
export const forumMediaKindEnum = pgEnum("forum_media_kind", forumMediaKind);

export const forumPosts = pgTable("forum_posts", {
  id: bigint("post_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
  anonymousOwnerHash: text("anonymous_owner_hash"),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  tags: text("tags").array(),
  isAnonymous: boolean("is_anonymous").default(false),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  status: contentStatusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const forumPostVotes = pgTable("forum_post_votes", {
  postId: bigint("post_id", { mode: "number" }).notNull().references(() => forumPosts.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  voteType: voteTypeEnum("vote_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pk: { columns: [table.postId, table.userId] },
}));

export const forumPostMedia = pgTable("forum_post_media", {
  id: bigint("media_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  postId: bigint("post_id", { mode: "number" }).notNull().references(() => forumPosts.id, { onDelete: "cascade" }),
  kind: forumMediaKindEnum("kind").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: bigint("comment_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  postId: bigint("post_id", { mode: "number" }).notNull().references(() => forumPosts.id, { onDelete: "cascade" }),
  parentCommentId: bigint("parent_comment_id", { mode: "number" }).references((): AnyPgColumn => comments.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  status: contentStatusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const commentVotes = pgTable("comment_votes", {
  commentId: bigint("comment_id", { mode: "number" }).notNull().references(() => comments.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  voteType: voteTypeEnum("vote_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pk: { columns: [table.commentId, table.userId] },
}));
