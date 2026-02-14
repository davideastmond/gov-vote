CREATE TYPE "public"."role" AS ENUM('admin', 'voter');--> statement-breakpoint
CREATE TABLE "address" (
	"id" text PRIMARY KEY NOT NULL,
	"street_address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contest" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contest_item" (
	"id" text PRIMARY KEY NOT NULL,
	"contest_id" text NOT NULL,
	"title" text NOT NULL,
	"auxiliary_text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contest_polling_station" (
	"id" text PRIMARY KEY NOT NULL,
	"contest_id" text NOT NULL,
	"polling_station_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "polling_station" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "polling_station_address" (
	"id" text PRIMARY KEY NOT NULL,
	"polling_station_id" text NOT NULL,
	"address_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"role" "role" DEFAULT 'voter' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_address" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"address_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voter_choice" (
	"id" text PRIMARY KEY NOT NULL,
	"contest_id" text NOT NULL,
	"contest_item_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voter_eligibility" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"polling_station_id" text NOT NULL,
	"is_eligible" text NOT NULL,
	"is_complete" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contest_item" ADD CONSTRAINT "contest_item_contest_id_contest_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contest"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_polling_station" ADD CONSTRAINT "contest_polling_station_contest_id_contest_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contest"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_polling_station" ADD CONSTRAINT "contest_polling_station_polling_station_id_polling_station_id_fk" FOREIGN KEY ("polling_station_id") REFERENCES "public"."polling_station"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polling_station_address" ADD CONSTRAINT "polling_station_address_polling_station_id_polling_station_id_fk" FOREIGN KEY ("polling_station_id") REFERENCES "public"."polling_station"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polling_station_address" ADD CONSTRAINT "polling_station_address_address_id_address_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."address"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_address" ADD CONSTRAINT "user_address_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_address" ADD CONSTRAINT "user_address_address_id_address_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."address"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voter_choice" ADD CONSTRAINT "voter_choice_contest_id_contest_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contest"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voter_choice" ADD CONSTRAINT "voter_choice_contest_item_id_contest_item_id_fk" FOREIGN KEY ("contest_item_id") REFERENCES "public"."contest_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voter_choice" ADD CONSTRAINT "voter_choice_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voter_eligibility" ADD CONSTRAINT "voter_eligibility_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voter_eligibility" ADD CONSTRAINT "voter_eligibility_polling_station_id_polling_station_id_fk" FOREIGN KEY ("polling_station_id") REFERENCES "public"."polling_station"("id") ON DELETE cascade ON UPDATE no action;