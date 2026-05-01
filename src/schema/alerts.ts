import { pgEnum, pgTable, text, timestamp, uuid, varchar, bigint, boolean, integer } from "drizzle-orm/pg-core";
import { users } from "./users";
import { alertType, notificationPriority } from "./enums";

export const alertTypeEnum = pgEnum("alert_type", alertType);
export const notificationPriorityEnum = pgEnum(
  "notification_priority",
  notificationPriority,
);

export const alerts = pgTable("alerts", {
  id: bigint("alert_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: alertTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  linkHref: text("link_href"),
  eventKey: varchar("event_key", { length: 255 }),
  eventCount: integer("event_count").default(1).notNull(),
  priority: notificationPriorityEnum("priority").default("normal").notNull(),
  isRead: boolean("is_read").default(false),
  seenAt: timestamp("seen_at"),
  archivedAt: timestamp("archived_at"),
  scheduledAt: timestamp("scheduled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
