import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Restoring average_period_length column...");

  try {
    await sql`ALTER TABLE user_cycle_onboarding ADD COLUMN IF NOT EXISTS average_period_length integer DEFAULT 5`;
    console.log("Added average_period_length column.");
  } catch (e: any) {
    console.log("Error:", e.message);
  }

  // Verify final columns
  const cols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'user_cycle_onboarding'
    ORDER BY ordinal_position
  `;
  console.log("\nCurrent columns:");
  cols.forEach((c: any) => console.log(` - ${c.column_name} (${c.data_type})`));
}

main().catch(console.error);
