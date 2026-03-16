CREATE TYPE "public"."forum_media_kind" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TABLE "forum_post_media" (
	"media_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "forum_post_media_media_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"post_id" bigint NOT NULL,
	"kind" "forum_media_kind" NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "forum_post_media" ADD CONSTRAINT "forum_post_media_post_id_forum_posts_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."forum_posts"("post_id") ON DELETE cascade ON UPDATE no action;
