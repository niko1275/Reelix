ALTER TABLE "videos" DROP CONSTRAINT "videos_user_id_users_clerk_id_fk";
--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "clerk_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "mux_asset_id" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "mux_status" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "mux_upload_id" text;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;