import { pgTable, text, timestamp, uuid, date, varchar, bigint, json, integer, boolean } from "drizzle-orm/pg-core";
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

export const userCycleOnboarding = pgTable("user_cycle_onboarding", {
  id: bigint("onboarding_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  averageCycleLength: integer("average_cycle_length").default(28),
  averagePeriodLength: integer("average_period_length").default(5),
  height: varchar("height", { length: 20 }),
  weight: varchar("weight", { length: 20 }),
  regularity: varchar("regularity", { length: 50 }),
  flowIntensity: varchar("flow_intensity", { length: 50 }),
  periodSymptoms: json("period_symptoms").$type<string[]>(), 
  concerns: json("concerns").$type<string[]>(),
  stressLevel: varchar("stress_level", { length: 50 }),
  sleepHours: varchar("sleep_hours", { length: 50 }),
  activityLevel: varchar("activity_level", { length: 50 }),
  hydration: varchar("hydration", { length: 50 }),
  primaryGoal: varchar("primary_goal", { length: 255 }),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});