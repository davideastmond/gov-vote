CREATE TYPE "public"."contest_item_type" AS ENUM('candidate', 'initiative', 'other');--> statement-breakpoint
ALTER TYPE "public"."role" ADD VALUE 'super_admin';--> statement-breakpoint
CREATE TABLE "admin_contest" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_id" text NOT NULL,
	"contest_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contest_item" ADD COLUMN "contestItemType" "contest_item_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_contest" ADD CONSTRAINT "admin_contest_admin_id_user_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_contest" ADD CONSTRAINT "admin_contest_contest_id_contest_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contest"("id") ON DELETE cascade ON UPDATE no action;