CREATE TABLE "comment_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_replying_to_users_clerk_id_fk";
--> statement-breakpoint
ALTER TABLE "comment_reactions" ADD CONSTRAINT "comment_reactions_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_reactions" ADD CONSTRAINT "comment_reactions_user_id_users_clerk_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("clerk_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_comment_reaction" ON "comment_reactions" USING btree ("user_id","comment_id");--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "is_reply";