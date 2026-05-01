DO $$
BEGIN
  CREATE TYPE "public"."notification_priority" AS ENUM('low', 'normal', 'high');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "notify_doctor_help" boolean DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS "notify_forum_activity" boolean DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS "notify_moderation" boolean DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS "notify_system" boolean DEFAULT true NOT NULL;

ALTER TABLE "alerts"
  ADD COLUMN IF NOT EXISTS "event_key" varchar(255),
  ADD COLUMN IF NOT EXISTS "event_count" integer DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS "priority" "public"."notification_priority" DEFAULT 'normal' NOT NULL,
  ADD COLUMN IF NOT EXISTS "seen_at" timestamp,
  ADD COLUMN IF NOT EXISTS "archived_at" timestamp;
