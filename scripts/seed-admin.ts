/**
 * One-off script to insert an admin user into the database.
 *
 * Usage:
 *   ADMIN_EMAIL=admin@maaya.health ADMIN_PASSWORD=your-secure-password pnpm run db:seed-admin
 *
 * Defaults (for local dev only): admin@maaya.local / admin123 — override in production!
 */

import { config } from "dotenv";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/schema";

config({ path: ".env" });

const DATABASE_URL = process.env.DATABASE_URL;
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "admin@maaya.local").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

async function seedAdmin() {
  if (!DATABASE_URL) {
    console.error("Missing DATABASE_URL in .env");
    process.exit(1);
  }

  const sql = neon(DATABASE_URL);
  const db = drizzle({ client: sql, schema });

  const passwordHash = await hash(ADMIN_PASSWORD, 12);

  try {
    const [existing] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, ADMIN_EMAIL))
      .limit(1);

    if (existing) {
      await db
        .update(schema.users)
        .set({
          role: "admin",
          accountStatus: "active",
          passwordHash,
          updatedAt: new Date(),
        })
        .where(eq(schema.users.id, existing.id));
      console.log(`Updated existing user to admin: ${ADMIN_EMAIL}`);
    } else {
      await db.insert(schema.users).values({
        email: ADMIN_EMAIL,
        passwordHash,
        role: "admin",
        accountStatus: "active",
      });
      console.log(`Created admin user: ${ADMIN_EMAIL}`);
    }
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }

  process.exit(0);
}

seedAdmin();
