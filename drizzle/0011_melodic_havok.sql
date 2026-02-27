CREATE TYPE "public"."card_status" AS ENUM('generated', 'active', 'inactive');--> statement-breakpoint
ALTER TABLE "voter_card" RENAME COLUMN "card_status" TO "cardStatus";