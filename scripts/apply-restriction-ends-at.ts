/**
 * Applies migrations/0004_account_restriction_ends_at.sql without drizzle-kit push
 * (push can suggest unrelated destructive changes).
 *
 * Usage: pnpm db:apply-restriction-column
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env" });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Missing DATABASE_URL in .env");
  process.exit(1);
}

const sql = neon(url);

await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "restriction_ends_at" timestamp with time zone`;

console.log('OK: column "users"."restriction_ends_at" is present.');
