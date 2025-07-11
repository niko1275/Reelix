import { pgTable, serial, text, timestamp, boolean, uniqueIndex, integer, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';


import { createInsertSchema ,createUpdateSchema, createSelectSchema} from 'drizzle-zod';

// Example table - modify according to your needs
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  clerkId: text('clerk_id').notNull().unique(),
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  bannerUrl: text('banner_url'),
  bannerKey: text('banner_key'),
});

// Relaciones de usuarios
export const usersRelations = relations(users, ({ many }) => ({
  videos: many(videos),
  videoViews: many(videoViews),
  videoReactions: many(videoReactions),
  subscriptions: many(subscriptions, { relationName: 'subscriber' }),
  subscribers: many(subscriptions, { relationName: 'subscribedTo' }),
  comments: many(comments),
  playlists: many(playlists),
  watchHistory: many(watchHistory),
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

  muxAssetId: text('mux_asset_id').notNull(),
  muxStatus: text('mux_status').notNull().default('uploading'),
  muxUploadId: text('mux_upload_id').notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  playbackId: text('playback_id'),
  visibility: text('visibility').notNull().default('public'),
});

export const videoInsertSchema = createInsertSchema(videos);
export const videoUpdateSchema = createUpdateSchema(videos);
export const videoSelectSchema = createSelectSchema(videos);

// Relaciones de videos
export const videosRelations = relations(videos, ({ one, many }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.clerkId],
  }),
  category: one(categories, {
    fields: [videos.categoryId],
    references: [categories.id],
  }),
  views: many(videoViews),
  reactions: many(videoReactions),
  comments: many(comments),
  playlists: many(playlistVideos),
  watchHistory: many(watchHistory),
}));


export const videoViews = pgTable('video_views', {
  id: serial('id').primaryKey(),
  videoId: integer('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  // Índice compuesto para evitar vistas duplicadas del mismo usuario al mismo video
  uniqueUserVideo: uniqueIndex('unique_user_video').on(t.userId, t.videoId),
}));

// Relaciones de videoViews
export const videoViewsRelations = relations(videoViews, ({ one }) => ({
  video: one(videos, {
    fields: [videoViews.videoId],
    references: [videos.id],
  }),
  user: one(users, {
    fields: [videoViews.userId],
    references: [users.clerkId],
  }),
}));


export const videoViewSelectSchema = createSelectSchema(videoViews);
export const videoViewInsertSchema = createInsertSchema(videoViews);
export const videoViewUpdateSchema = createUpdateSchema(videoViews);

export const videoReactions = pgTable('video_reactions', {
  id: serial('id').primaryKey(),
  videoId: integer('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  type: text('type', { enum: ['like', 'dislike'] }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  // Índice compuesto para evitar reacciones duplicadas del mismo usuario al mismo video
  uniqueUserVideo: uniqueIndex('unique_user_video_reaction').on(t.userId, t.videoId),
}));

// Relaciones de videoReactions
export const videoReactionsRelations = relations(videoReactions, ({ one }) => ({
  video: one(videos, {
    fields: [videoReactions.videoId],
    references: [videos.id],
  }),
  user: one(users, {
    fields: [videoReactions.userId],
    references: [users.clerkId],
  }),
}));

export const videoReactionSelectSchema = createSelectSchema(videoReactions);
export const videoReactionInsertSchema = createInsertSchema(videoReactions);
export const videoReactionUpdateSchema = createUpdateSchema(videoReactions);

// Tabla de suscripciones
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  subscriberId: text('subscriber_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  subscribedToId: text('subscribed_to_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  // Índice compuesto para evitar suscripciones duplicadas
  uniqueSubscription: uniqueIndex('unique_subscription').on(t.subscriberId, t.subscribedToId),
}));

// Relaciones de suscripciones
export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  subscriber: one(users, {
    fields: [subscriptions.subscriberId],
    references: [users.clerkId],
    relationName: 'subscriber',
  }),
  subscribedTo: one(users, {
    fields: [subscriptions.subscribedToId],
    references: [users.clerkId],
    relationName: 'subscribedTo',
  }),
}));

export const subscriptionSelectSchema = createSelectSchema(subscriptions);
export const subscriptionInsertSchema = createInsertSchema(subscriptions);
export const subscriptionUpdateSchema = createUpdateSchema(subscriptions);

// Tabla de comentarios
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  videoId: integer('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  parentId: integer('parent_id'),
  replyingTo: text('replying_to'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabla de reacciones a comentarios
export const commentReactions = pgTable('comment_reactions', {
  id: serial('id').primaryKey(),
  commentId: integer('comment_id').notNull().references(() => comments.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  type: text('type', { enum: ['like', 'dislike'] }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  // Índice compuesto para evitar reacciones duplicadas del mismo usuario al mismo comentario
  uniqueUserComment: uniqueIndex('unique_user_comment_reaction').on(t.userId, t.commentId),
}));

// Relaciones de comentarios
export const commentsRelations = relations(comments, ({ one, many }) => ({
  video: one(videos, {
    fields: [comments.videoId],
    references: [videos.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.clerkId],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
  }),
  replies: many(comments, {
    relationName: 'parent',
  }),
  reactions: many(commentReactions),
}));

// Relaciones de commentReactions
export const commentReactionsRelations = relations(commentReactions, ({ one }) => ({
  comment: one(comments, {
    fields: [commentReactions.commentId],
    references: [comments.id],
  }),
  user: one(users, {
    fields: [commentReactions.userId],
    references: [users.clerkId],
  }),
}));

// Tipos para las reacciones a comentarios
export type CommentReaction = typeof commentReactions.$inferSelect;
export type NewCommentReaction = typeof commentReactions.$inferInsert;

// Schemas para validación de reacciones a comentarios
export const commentReactionSelectSchema = createSelectSchema(commentReactions);
export const commentReactionInsertSchema = createInsertSchema(commentReactions);
export const commentReactionUpdateSchema = createUpdateSchema(commentReactions);

// Tipos para los comentarios
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

// Schemas para validación
export const commentSelectSchema = createSelectSchema(comments);
export const commentInsertSchema = createInsertSchema(comments);
export const commentUpdateSchema = createUpdateSchema(comments);

// Tabla de playlists
export const playlists = pgTable('playlists', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  userId: text('user_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  isPublic: boolean('is_public').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabla de videos en playlists
export const playlistVideos = pgTable('playlist_videos', {
  id: serial('id').primaryKey(),
  playlistId: integer('playlist_id').notNull().references(() => playlists.id, { onDelete: 'cascade' }),
  videoId: integer('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  // Índice compuesto para evitar videos duplicados en la misma playlist
  uniquePlaylistVideo: uniqueIndex('unique_playlist_video').on(t.playlistId, t.videoId),
}));

// Tabla de historial mejorada
export const watchHistory = pgTable('watch_history', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  videoId: integer('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
  watchedAt: timestamp('watched_at').defaultNow().notNull(),
  watchDuration: integer('watch_duration').default(0).notNull(), // duración en segundos
  progress: integer('progress').default(0).notNull(), // progreso del video en segundos
  completed: boolean('completed').default(false).notNull(), // si el video se completó
  lastPosition: integer('last_position').default(0).notNull(), // última posición vista
}, (t) => ({
  // Índice compuesto para mantener solo la última vista de cada video por usuario
  uniqueUserVideo: uniqueIndex('unique_user_video_history').on(t.userId, t.videoId),
}));

// Vista para el historial del usuario con información detallada
export const userHistoryView = pgTable('user_history_view', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  videoId: integer('video_id').notNull(),
  videoTitle: text('video_title').notNull(),
  videoThumbnail: text('video_thumbnail').notNull(),
  videoDuration: integer('video_duration').notNull(),
  channelName: text('channel_name').notNull(),
  channelAvatar: text('channel_avatar').notNull(),
  watchedAt: timestamp('watched_at').notNull(),
  watchDuration: integer('watch_duration').notNull(),
  progress: integer('progress').notNull(),
  completed: boolean('completed').notNull(),
  lastPosition: integer('last_position').notNull(),
});

// Relaciones de playlists
export const playlistsRelations = relations(playlists, ({ one, many }) => ({
  user: one(users, {
    fields: [playlists.userId],
    references: [users.clerkId],
  }),
  videos: many(playlistVideos),
}));

// Relaciones de playlistVideos
export const playlistVideosRelations = relations(playlistVideos, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistVideos.playlistId],
    references: [playlists.id],
  }),
  video: one(videos, {
    fields: [playlistVideos.videoId],
    references: [videos.id],
  }),
}));

// Relaciones de watchHistory
export const watchHistoryRelations = relations(watchHistory, ({ one }) => ({
  user: one(users, {
    fields: [watchHistory.userId],
    references: [users.clerkId],
  }),
  video: one(videos, {
    fields: [watchHistory.videoId],
    references: [videos.id],
  }),
}));

// Schemas para validación
export const playlistSelectSchema = createSelectSchema(playlists);
export const playlistInsertSchema = createInsertSchema(playlists);
export const playlistUpdateSchema = createUpdateSchema(playlists);

export const playlistVideoSelectSchema = createSelectSchema(playlistVideos);
export const playlistVideoInsertSchema = createInsertSchema(playlistVideos);
export const playlistVideoUpdateSchema = createUpdateSchema(playlistVideos);

export const watchHistorySelectSchema = createSelectSchema(watchHistory);
export const watchHistoryInsertSchema = createInsertSchema(watchHistory);
export const watchHistoryUpdateSchema = createUpdateSchema(watchHistory);

// Tipos para el historial
export type WatchHistory = typeof watchHistory.$inferSelect;
export type NewWatchHistory = typeof watchHistory.$inferInsert;
export type UserHistoryView = typeof userHistoryView.$inferSelect;



