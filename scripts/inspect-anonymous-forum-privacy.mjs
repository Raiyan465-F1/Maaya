import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const rows = await sql`
    SELECT
      COUNT(*) FILTER (WHERE is_anonymous = true AND author_id IS NOT NULL) AS anonymous_with_author_id,
      COUNT(*) FILTER (WHERE is_anonymous = true AND anonymous_owner_hash IS NOT NULL) AS anonymous_with_owner_hash
    FROM forum_posts
  `;

  console.log(JSON.stringify(rows, null, 2));
}

main().catch((error) => {
  console.error("Failed to inspect anonymous forum privacy state:", error);
  process.exit(1);
});
