CREATE TABLE "user_history_view" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"video_id" integer NOT NULL,
	"video_title" text NOT NULL,
	"video_thumbnail" text NOT NULL,
	"video_duration" integer NOT NULL,
	"channel_name" text NOT NULL,
	"channel_avatar" text NOT NULL,
	"watched_at" timestamp NOT NULL,
	"watch_duration" integer NOT NULL,
	"progress" integer NOT NULL,
	"completed" boolean NOT NULL,
	"last_position" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "watch_history" ADD COLUMN "progress" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "watch_history" ADD COLUMN "completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "watch_history" ADD COLUMN "last_position" integer DEFAULT 0 NOT NULL;