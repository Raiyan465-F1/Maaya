ALTER TYPE "public"."alert_type" ADD VALUE IF NOT EXISTS 'question_assigned';
ALTER TYPE "public"."alert_type" ADD VALUE IF NOT EXISTS 'forum_comment';
ALTER TYPE "public"."alert_type" ADD VALUE IF NOT EXISTS 'forum_reply';
ALTER TYPE "public"."alert_type" ADD VALUE IF NOT EXISTS 'moderation_update';
ALTER TYPE "public"."alert_type" ADD VALUE IF NOT EXISTS 'account_update';

ALTER TABLE "alerts" ADD COLUMN IF NOT EXISTS "link_href" text;
