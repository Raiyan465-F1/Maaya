import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { users, symptomLogs, cycleLogs } from "../src/schema";
import { eq, and } from "drizzle-orm";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

async function main() {
  const email = "meru@gmail.com";
  const today = "2026-04-18";

  console.log(`Searching for user: ${email}`);
  const userList = await db.select().from(users).where(eq(users.email, email));

  if (userList.length === 0) {
    console.log("User not found.");
    return;
  }

  const user = userList[0];
  console.log(`User found: ID ${user.id}`);

  console.log(`Checking symptom_logs for ${today}...`);
  const symptoms = await db.select().from(symptomLogs).where(
    and(
      eq(symptomLogs.userId, user.id),
      eq(symptomLogs.logDate, today)
    )
  );
  console.log(`Found ${symptoms.length} symptom logs.`);
  symptoms.forEach(s => console.log(JSON.stringify(s, null, 2)));

  console.log(`Checking cycle_logs for ${today}...`);
  // cycle_logs has start_date as date
  const cycles = await db.select().from(cycleLogs).where(
    and(
      eq(cycleLogs.userId, user.id),
      eq(cycleLogs.startDate, today)
    )
  );
  console.log(`Found ${cycles.length} cycle logs.`);
  cycles.forEach(c => console.log(JSON.stringify(c, null, 2)));
}

main().catch(console.error);
