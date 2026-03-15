import { pgTable, text, timestamp, uuid, varchar, bigint } from "drizzle-orm/pg-core";
import { users } from "./users";

export const articles = pgTable("articles", {
  id: bigint("article_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  contentBody: text("content_body").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const savedArticles = pgTable("saved_articles", {
  id: bigint("saved_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  articleId: bigint("article_id", { mode: "number" }).notNull().references(() => articles.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});