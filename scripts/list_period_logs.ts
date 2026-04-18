import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { users, cycleLogs } from "../src/schema";
import { eq } from "drizzle-orm";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

async function main() {
  const email = "meru@gmail.com";

  console.log(`Searching for all period logs for: ${email}`);
  const userList = await db.select().from(users).where(eq(users.email, email));

  if (userList.length === 0) {
    console.log("User not found.");
    return;
  }

  const user = userList[0];
  const logs = await db.select().from(cycleLogs).where(eq(cycleLogs.userId, user.id));

  console.log(`Found ${logs.length} cycle logs for user ${user.id}:`);
  logs.forEach(log => {
    console.log(`ID: ${log.id}, Start: ${log.startDate}, End: ${log.endDate}`);
  });
}

main().catch(console.error);
