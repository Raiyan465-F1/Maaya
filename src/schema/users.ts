import { pgEnum, pgTable, text, timestamp, uuid, boolean, varchar } from "drizzle-orm/pg-core";
import { userRole, accountStatus } from "./enums";

export const userRoleEnum = pgEnum("user_role", userRole);
export const accountStatusEnum = pgEnum("account_status", accountStatus);

export const users = pgTable("users", {
  id: uuid("user_id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull(),
  accountStatus: accountStatusEnum("account_status").default("pending"),
  isAnonymous: boolean("is_anonymous").default(false),
  likedTags: text("liked_tags").array(),
  ageGroup: varchar("age_group", { length: 50 }),
  gender: varchar("gender", { length: 30 }),
  location: varchar("location", { length: 100 }),
  notifyDoctorHelp: boolean("notify_doctor_help").default(true).notNull(),
  notifyForumActivity: boolean("notify_forum_activity").default(true).notNull(),
  notifyModeration: boolean("notify_moderation").default(true).notNull(),
  notifySystem: boolean("notify_system").default(true).notNull(),
  restrictionEndsAt: timestamp("restriction_ends_at", { withTimezone: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
