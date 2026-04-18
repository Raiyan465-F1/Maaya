DO $$ BEGIN
 CREATE TYPE "public"."question_status" AS ENUM('pending', 'answered', 'closed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
ALTER TABLE "doctor_questions" ADD COLUMN IF NOT EXISTS "status" "question_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
UPDATE "doctor_questions" AS dq
SET "status" = 'answered'
WHERE EXISTS (
  SELECT 1 FROM "doctor_answers" da WHERE da."question_id" = dq."question_id"
);
