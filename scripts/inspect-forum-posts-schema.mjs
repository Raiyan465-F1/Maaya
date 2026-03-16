import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const rows = await sql`
    SELECT column_name, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'forum_posts'
    ORDER BY ordinal_position
  `;

  console.log(JSON.stringify(rows, null, 2));
}

main().catch((error) => {
  console.error("Failed to inspect forum_posts schema:", error);
  process.exit(1);
});
