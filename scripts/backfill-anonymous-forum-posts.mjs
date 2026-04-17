import "dotenv/config";
import { createHmac } from "node:crypto";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

function buildAnonymousOwnerHash(userId) {
  const secret = process.env.NEXTAUTH_SECRET ?? "maaya-forum-anonymous";
  return createHmac("sha256", secret).update(userId).digest("hex");
}

async function main() {
  const posts = await sql`
    SELECT post_id, author_id
    FROM forum_posts
    WHERE is_anonymous = true AND author_id IS NOT NULL
  `;

  if (!posts.length) {
    console.log("No anonymous forum posts needed backfilling.");
    return;
  }

  for (const post of posts) {
    await sql`
      UPDATE forum_posts
      SET author_id = NULL,
          anonymous_owner_hash = ${buildAnonymousOwnerHash(post.author_id)}
      WHERE post_id = ${post.post_id}
    `;
  }

  console.log(`Backfilled ${posts.length} anonymous forum post(s).`);
}

main().catch((error) => {
  console.error("Failed to backfill anonymous forum posts:", error);
  process.exit(1);
});
