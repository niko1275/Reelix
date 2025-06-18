ALTER TABLE "comments" ADD COLUMN "is_reply" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "replying_to" text;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_replying_to_users_clerk_id_fk" FOREIGN KEY ("replying_to") REFERENCES "public"."users"("clerk_id") ON DELETE cascade ON UPDATE no action;