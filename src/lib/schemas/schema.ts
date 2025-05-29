import { pgTable, serial, text, timestamp, boolean, uniqueIndex, integer, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Example table - modify according to your needs
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  clerkId: text('clerk_id').notNull().unique(),
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relaciones de usuarios
export const usersRelations = relations(users, ({ many }) => ({
  videos: many(videos),
}));

// Add more tables as needed 

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
},(t)=>[uniqueIndex('name_unique').on(t.name)]);

// Tabla de videos
export const videos = pgTable('videos', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  videoUrl: text('video_url').notNull(),
  thumbnailUrl: text('thumbnail_url').notNull(),
  duration: integer('duration').notNull(), // duración en segundos
  views: integer('views').default(0).notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  userId: text('user_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),

  categoryId: integer('category_id').references(() => categories.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relaciones de videos
export const videosRelations = relations(videos, ({ one }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [videos.categoryId],
    references: [categories.id],
  }),
}));
