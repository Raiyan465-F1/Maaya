import { sql } from "@/src/db";

async function main() {
  await sql`
    ALTER TABLE forum_posts
    ALTER COLUMN author_id DROP NOT NULL
  `;

  await sql`
    ALTER TABLE forum_posts
    ADD COLUMN IF NOT EXISTS anonymous_owner_hash text
  `;

  await sql`
    ALTER TABLE forum_posts
    DROP CONSTRAINT IF EXISTS forum_posts_author_id_users_user_id_fk
  `;

  await sql`
    ALTER TABLE forum_posts
    ADD CONSTRAINT forum_posts_author_id_users_user_id_fk
    FOREIGN KEY (author_id) REFERENCES users(user_id) ON DELETE SET NULL
  `;

  console.log("Applied anonymous forum privacy schema changes.");
}

main().catch((error) => {
  console.error("Failed to apply anonymous forum privacy changes:", error);
  process.exit(1);
});
