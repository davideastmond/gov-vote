CREATE TYPE "public"."contest_status" AS ENUM('upcoming', 'active', 'closed');--> statement-breakpoint
ALTER TABLE "contest" ADD COLUMN "contestStatus" "contest_status" DEFAULT 'upcoming' NOT NULL;