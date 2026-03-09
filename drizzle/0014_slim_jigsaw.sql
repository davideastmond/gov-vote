CREATE TABLE "voter_id_photo" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"contest_group_id" text NOT NULL,
	"photo_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "voter_id_photo" ADD CONSTRAINT "voter_id_photo_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voter_id_photo" ADD CONSTRAINT "voter_id_photo_contest_group_id_contest_group_id_fk" FOREIGN KEY ("contest_group_id") REFERENCES "public"."contest_group"("id") ON DELETE cascade ON UPDATE no action;