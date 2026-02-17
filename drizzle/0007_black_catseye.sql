ALTER TABLE "admin_contest" RENAME TO "admin_contest_group";--> statement-breakpoint
ALTER TABLE "admin_contest_group" RENAME COLUMN "contest_id" TO "contest_group_id";--> statement-breakpoint
ALTER TABLE "admin_contest_group" DROP CONSTRAINT "admin_contest_admin_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "admin_contest_group" DROP CONSTRAINT "admin_contest_contest_id_contest_id_fk";
--> statement-breakpoint
ALTER TABLE "admin_contest_group" ADD CONSTRAINT "admin_contest_group_admin_id_user_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_contest_group" ADD CONSTRAINT "admin_contest_group_contest_group_id_contest_group_id_fk" FOREIGN KEY ("contest_group_id") REFERENCES "public"."contest_group"("id") ON DELETE cascade ON UPDATE no action;