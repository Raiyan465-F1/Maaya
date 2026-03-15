import { pgTable, uuid, bigint, timestamp, integer, text } from "drizzle-orm/pg-core";
import { users } from "./users";

export const doctorRatings = pgTable("doctor_ratings", {
  id: bigint("rating_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  doctorUserId: uuid("doctor_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
