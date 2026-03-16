ALTER TABLE "forum_posts" ALTER COLUMN "author_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "forum_posts" DROP CONSTRAINT IF EXISTS "forum_posts_author_id_users_user_id_fk";--> statement-breakpoint
ALTER TABLE "forum_posts" ADD COLUMN "anonymous_owner_hash" text;--> statement-breakpoint
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_author_id_users_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;
