import { pgTable, text, timestamp, uuid, bigint, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";

export const doctorQuestions = pgTable("doctor_questions", {
  id: bigint("question_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  doctorUserId: uuid("doctor_user_id").references(() => users.id, { onDelete: "set null" }),
  questionText: text("question_text").notNull(),
  isAnonymous: boolean("is_anonymous").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const doctorAnswers = pgTable("doctor_answers", {
  id: bigint("answer_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  questionId: bigint("question_id", { mode: "number" }).notNull().references(() => doctorQuestions.id, { onDelete: "cascade" }),
  doctorUserId: uuid("doctor_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  answerText: text("answer_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});