CREATE TYPE "public"."forum_media_kind" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."question_status" AS ENUM('pending', 'answered', 'closed');--> statement-breakpoint
CREATE TABLE "cycle_stage_tips" (
	"cycle_stage_tip_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cycle_stage_tips_cycle_stage_tip_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"phase" varchar(50) NOT NULL,
	"tip_title" varchar(255) NOT NULL,
	"tip_description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_post_media" (
	"media_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "forum_post_media_media_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"post_id" bigint NOT NULL,
	"kind" "forum_media_kind" NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctor_ratings" (
	"rating_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "doctor_ratings_rating_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"doctor_user_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "forum_posts" DROP CONSTRAINT "forum_posts_author_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "forum_posts" ALTER COLUMN "author_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name" varchar(255);--> statement-breakpoint
ALTER TABLE "doctor_profiles" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "doctor_profiles" ADD COLUMN "qualifications" text;--> statement-breakpoint
ALTER TABLE "doctor_profiles" ADD COLUMN "institution" varchar(200);--> statement-breakpoint
ALTER TABLE "cycle_logs" ADD COLUMN "predicted_cycle_length" integer DEFAULT 28;--> statement-breakpoint
ALTER TABLE "cycle_logs" ADD COLUMN "predicted_period_length" integer DEFAULT 5;--> statement-breakpoint
ALTER TABLE "cycle_logs" ADD COLUMN "actual_cycle_length" integer;--> statement-breakpoint
ALTER TABLE "cycle_logs" ADD COLUMN "predicted_difference" integer;--> statement-breakpoint
ALTER TABLE "cycle_logs" ADD COLUMN "predicted_start_date" date;--> statement-breakpoint
ALTER TABLE "cycle_logs" ADD COLUMN "predicted_end_date" date;--> statement-breakpoint
ALTER TABLE "symptom_logs" ADD COLUMN "mood" varchar(50);--> statement-breakpoint
ALTER TABLE "symptom_logs" ADD COLUMN "water_intake_ml" integer;--> statement-breakpoint
ALTER TABLE "symptom_logs" ADD COLUMN "flow_intensity" varchar(50);--> statement-breakpoint
ALTER TABLE "forum_posts" ADD COLUMN "anonymous_owner_hash" text;--> statement-breakpoint
ALTER TABLE "doctor_questions" ADD COLUMN "status" "question_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "forum_post_media" ADD CONSTRAINT "forum_post_media_post_id_forum_posts_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."forum_posts"("post_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_ratings" ADD CONSTRAINT "doctor_ratings_doctor_user_id_users_user_id_fk" FOREIGN KEY ("doctor_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_ratings" ADD CONSTRAINT "doctor_ratings_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_author_id_users_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;