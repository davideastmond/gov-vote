CREATE TABLE "voter_card" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"contest_group_id" text NOT NULL,
	"card_status" text NOT NULL,
	"card_code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "voter_eligibility" ALTER COLUMN "is_eligible" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "voter_eligibility" ALTER COLUMN "is_eligible" SET DATA TYPE boolean USING (
	CASE
		WHEN "is_eligible" IS NULL THEN NULL
		WHEN lower(trim("is_eligible")) IN ('true', 't', '1', 'yes', 'y') THEN true
		WHEN lower(trim("is_eligible")) IN ('false', 'f', '0', 'no', 'n') THEN false
		ELSE NULL
	END
);--> statement-breakpoint
ALTER TABLE "voter_eligibility" ALTER COLUMN "is_eligible" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "voter_eligibility" ALTER COLUMN "is_complete" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "voter_eligibility" ALTER COLUMN "is_complete" SET DATA TYPE boolean USING (
	CASE
		WHEN "is_complete" IS NULL THEN NULL
		WHEN lower(trim("is_complete")) IN ('true', 't', '1', 'yes', 'y') THEN true
		WHEN lower(trim("is_complete")) IN ('false', 'f', '0', 'no', 'n') THEN false
		ELSE NULL
	END
);--> statement-breakpoint
ALTER TABLE "voter_eligibility" ALTER COLUMN "is_complete" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "voter_card" ADD CONSTRAINT "voter_card_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voter_card" ADD CONSTRAINT "voter_card_contest_group_id_contest_group_id_fk" FOREIGN KEY ("contest_group_id") REFERENCES "public"."contest_group"("id") ON DELETE cascade ON UPDATE no action;