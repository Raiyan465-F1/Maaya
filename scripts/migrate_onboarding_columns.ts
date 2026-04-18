import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Applying schema changes to user_cycle_onboarding table...");

  // Drop average_period_length if it exists, add height and weight
  try {
    await sql`ALTER TABLE user_cycle_onboarding DROP COLUMN IF EXISTS average_period_length`;
    console.log("Dropped average_period_length column (if it existed).");
  } catch (e: any) {
    console.log("Note:", e.message);
  }

  try {
    await sql`ALTER TABLE user_cycle_onboarding ADD COLUMN IF NOT EXISTS height varchar(20)`;
    console.log("Added height column.");
  } catch (e: any) {
    console.log("height:", e.message);
  }

  try {
    await sql`ALTER TABLE user_cycle_onboarding ADD COLUMN IF NOT EXISTS weight varchar(20)`;
    console.log("Added weight column.");
  } catch (e: any) {
    console.log("weight:", e.message);
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
