import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { cycleLogs } from "../src/schema";
import { eq } from "drizzle-orm";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

async function main() {
  const userId = "c694505d-1397-4042-986a-ea5e86dbf84e"; // ID for meru@gmail.com

  console.log(`Deleting all cycle logs for User ID: ${userId}`);
  const result = await db.delete(cycleLogs).where(eq(cycleLogs.userId, userId));

  console.log("Delete operation completed.");
}

main().catch(console.error);
