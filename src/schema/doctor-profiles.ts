import { pgTable, text, timestamp, uuid, varchar, bigint } from "drizzle-orm/pg-core";
import { users } from "./users";

export const doctorProfiles = pgTable("doctor_profiles", {
  id: bigint("doctor_profile_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  specialty: varchar("specialty", { length: 100 }),
  availabilityInfo: text("availability_info"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});