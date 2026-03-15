import { pgTable, text, timestamp, bigint, varchar, json, numeric, uuid } from "drizzle-orm/pg-core";
import { articles } from "./articles";
import { users } from "./users";

// Define the quiz question type for TypeScript
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctOption: number;
  explanation?: string;
}

export const quizzes = pgTable("quizzes", {
  id: bigint("quiz_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  articleId: bigint("article_id", { mode: "number" }).references(() => articles.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  questions: json("questions").notNull().$type<QuizQuestion[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: bigint("attempt_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  quizId: bigint("quiz_id", { mode: "number" }).notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  score: numeric("score", { precision: 5, scale: 2 }),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});