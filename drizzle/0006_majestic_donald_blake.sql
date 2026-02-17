ALTER TABLE "contest" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "contest_item" ALTER COLUMN "auxiliary_text" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "polling_station" ALTER COLUMN "name" DROP NOT NULL;