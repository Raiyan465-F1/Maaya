import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "@/src/db";
import { forumPosts } from "@/src/schema/forum";
import { buildAnonymousOwnerHash } from "@/lib/forum-server";

async function main() {
  const anonymousPosts = await db
    .select({
      id: forumPosts.id,
      authorId: forumPosts.authorId,
    })
    .from(forumPosts)
    .where(and(eq(forumPosts.isAnonymous, true), isNotNull(forumPosts.authorId)));

  if (!anonymousPosts.length) {
    console.log("No anonymous forum posts needed backfilling.");
    return;
  }

  for (const post of anonymousPosts) {
    if (!post.authorId) continue;

    await db
      .update(forumPosts)
      .set({
        authorId: null,
        anonymousOwnerHash: buildAnonymousOwnerHash(post.authorId),
      })
      .where(eq(forumPosts.id, post.id));
  }

  console.log(`Backfilled ${anonymousPosts.length} anonymous forum post(s).`);
}

main().catch((error) => {
  console.error("Failed to backfill anonymous forum posts:", error);
  process.exit(1);
});
