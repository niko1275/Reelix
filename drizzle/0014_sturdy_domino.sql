ALTER TABLE "users" ADD COLUMN "banner_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "banner_key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" DROP COLUMN "banner_url";--> statement-breakpoint
ALTER TABLE "videos" DROP COLUMN "banner_key";