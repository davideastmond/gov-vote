ALTER TABLE "contest_polling_station" RENAME TO "contest_group_polling_station";--> statement-breakpoint
ALTER TABLE "contest_group_polling_station" RENAME COLUMN "contest_id" TO "contest_group_id";--> statement-breakpoint
ALTER TABLE "contest_group_polling_station" DROP CONSTRAINT "contest_polling_station_contest_id_contest_id_fk";
--> statement-breakpoint
ALTER TABLE "contest_group_polling_station" DROP CONSTRAINT "contest_polling_station_polling_station_id_polling_station_id_fk";
--> statement-breakpoint
ALTER TABLE "contest_group_polling_station" ADD CONSTRAINT "contest_group_polling_station_contest_group_id_contest_group_id_fk" FOREIGN KEY ("contest_group_id") REFERENCES "public"."contest_group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_group_polling_station" ADD CONSTRAINT "contest_group_polling_station_polling_station_id_polling_station_id_fk" FOREIGN KEY ("polling_station_id") REFERENCES "public"."polling_station"("id") ON DELETE cascade ON UPDATE no action;