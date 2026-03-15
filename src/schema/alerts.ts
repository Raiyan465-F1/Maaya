import { pgEnum, pgTable, text, timestamp, uuid, varchar, bigint, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";
import { alertType } from "./enums";

export const alertTypeEnum = pgEnum("alert_type", alertType);

export const alerts = pgTable("alerts", {
  id: bigint("alert_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: alertTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  scheduledAt: timestamp("scheduled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});