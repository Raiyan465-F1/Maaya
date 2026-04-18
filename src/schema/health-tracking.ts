import { pgTable, text, timestamp, uuid, date, varchar, bigint, json, integer } from "drizzle-orm/pg-core";
import { users } from "./users";

export const cycleLogs = pgTable("cycle_logs", {
  id: bigint("cycle_log_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  cyclePhase: varchar("cycle_phase", { length: 50 }),
  predictedCycleLength: integer("predicted_cycle_length").default(28),
  actualCycleLength: integer("actual_cycle_length"),
  predictedDifference: integer("predicted_difference"),
  predictedStartDate: date("predicted_start_date"),
  predictedEndDate: date("predicted_end_date"),
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
  mood: varchar("mood", { length: 50 }),
  waterIntake: integer("water_intake_ml"),
  flowIntensity: varchar("flow_intensity", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cycleStageTips = pgTable("cycle_stage_tips", {
  id: bigint("cycle_stage_tip_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  phase: varchar("phase", { length: 50 }).notNull(),
  tipTitle: varchar("tip_title", { length: 255 }).notNull(),
  tipDescription: text("tip_description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});