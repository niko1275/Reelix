import { pgTable, serial, text,timestamp,uniqueIndex } from "drizzle-orm/pg-core";

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
},(t)=>[uniqueIndex('name_unique').on(t.name)]);
