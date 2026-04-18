import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { symptomLogs } from "../src/schema";
import { eq, and } from "drizzle-orm";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

async function main() {
  const userId = "c694505d-1397-4042-986a-ea5e86dbf84e"; // ID for meru@gmail.com
  const today = "2026-04-18";

  console.log(`Clearing today's symptom data for User ID: ${userId}`);
  const result = await db.delete(symptomLogs).where(
    and(
      eq(symptomLogs.userId, userId),
      eq(symptomLogs.logDate, today)
    )
  );

  console.log("Delete operation completed.");
}

main().catch(console.error);
