ALTER TABLE "polling_station_address" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "polling_station_address" CASCADE;--> statement-breakpoint
ALTER TABLE "polling_station" ADD COLUMN "address_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "polling_station" ADD CONSTRAINT "polling_station_address_id_address_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."address"("id") ON DELETE cascade ON UPDATE no action;