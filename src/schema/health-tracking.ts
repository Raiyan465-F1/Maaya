import { pgTable, text, timestamp, uuid, date, varchar, bigint, json, integer } from "drizzle-orm/pg-core";
import { users } from "./users";

export const cycleLogs = pgTable("cycle_logs", {
  id: bigint("cycle_log_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  cyclePhase: varchar("cycle_phase", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const symptomLogs = pgTable("symptom_logs", {
  id: bigint("symptom_log_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  logDate: date("log_date").notNull(),
  symptoms: json("symptoms").notNull().$type<Record<string, boolean | string | number>>(),
  severity: integer("severity"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});