CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscriber_id" text NOT NULL,
	"subscribed_to_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subscriber_id_users_clerk_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."users"("clerk_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subscribed_to_id_users_clerk_id_fk" FOREIGN KEY ("subscribed_to_id") REFERENCES "public"."users"("clerk_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_subscription" ON "subscriptions" USING btree ("subscriber_id","subscribed_to_id");