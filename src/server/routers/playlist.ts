import { router, protectedProcedure, baseProcedure, publicProcedure, optionalAuthProcedure } from "../trpc";
import { z } from "zod";
import { eq, and, desc, asc, getTableColumns, sql } from "drizzle-orm";
import { playlists, playlistVideos, users, videos, subscriptions, videoReactions } from "@/lib/db/schema";
import { TRPCError } from "@trpc/server";



export const playlistRouter = router({

  getUserPlaylistsWithFirstVideo: optionalAuthProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth?.userId;
    if (!userId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Usuario no autenticado",
      });
      
    }
  

    const playlistsResult = await ctx.db
    .select({
      ...getTableColumns(playlists),
      firstVideo: {
        ...getTableColumns(videos),
      },
      user:{
        ...getTableColumns(users),
      }
    })
    .from(playlists)
    .leftJoin(playlistVideos, and(
      eq(playlistVideos.playlistId, playlists.id),
      eq(playlistVideos.position, 0)   // solo videos en posición 0
    ))
    .leftJoin(videos, eq(videos.id, playlistVideos.videoId))
    .innerJoin(users, eq(users.clerkId, playlists.userId))
    .where(eq(playlists.userId, userId))
    .orderBy(desc(playlists.updatedAt));
  
  return playlistsResult;
  }),

  // Get all playlists for the current user
  getUserPlaylists: publicProcedure
    .query(async ({ ctx }) => {
      if (!ctx.auth?.userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuario no autenticado",
        });
      }

      const userPlaylists = await ctx.db.query.playlists.findMany({
        where: eq(playlists.userId, ctx.auth.userId),
        orderBy: [desc(playlists.updatedAt)],
      });

      return userPlaylists;
    }),

  // Get a specific playlist with its videos
  getPlaylist: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const userId = ctx.auth?.userId;
      console.log("▶️ getPlaylist - INPUT:", userId);
      try {
        const [playlist] = await ctx.db
          .select({
            ...getTableColumns(playlists),
            user: {
              ...getTableColumns(users),
              subscribersCount: sql<number>`(
                SELECT COUNT(*)::int
                FROM ${subscriptions}
                WHERE ${subscriptions.subscribedToId} = ${users.clerkId}
              )`,
              isSubscribed: userId ? sql<boolean>`EXISTS (
                SELECT 1
                FROM ${subscriptions}
                WHERE ${subscriptions.subscriberId} = ${userId}
                AND ${subscriptions.subscribedToId} = ${users.clerkId}
              )` : sql<boolean>`false`,
            },
          })
          .from(playlists)
          .leftJoin(users, eq(users.clerkId, playlists.userId))
          .where(
            and(
              eq(playlists.id, parseInt(id)),
              eq(users.clerkId, userId || "")
            )
            );

        if (!playlist) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Playlist no encontrada",
          });
        }

        if (!playlist.isPublic && playlist.userId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permiso para ver esta playlist",
          });
        }

        // Obtener los videos de la playlist con sus estadísticas
        const playlistVideosResult = await ctx.db.query.playlistVideos.findMany({
          where: eq(playlistVideos.playlistId, parseInt(id)),
          with: {
            video: {
              with: {
                user: true,
              },
            },
          },
          orderBy: [asc(playlistVideos.position)],
        });

        // Obtener las estadísticas de cada video
        const videosWithStats = await Promise.all(
          playlistVideosResult.map(async (pv) => {
            const [stats] = await ctx.db
              .select({
                likes: sql<number>`(
                  SELECT COUNT(*)::int
                  FROM ${videoReactions}
                  WHERE ${videoReactions.videoId} = ${pv.video.id}
                  AND ${videoReactions.type} = 'like'
                )`,
                dislikes: sql<number>`(
                  SELECT COUNT(*)::int
                  FROM ${videoReactions}
                  WHERE ${videoReactions.videoId} = ${pv.video.id}
                  AND ${videoReactions.type} = 'dislike'
                )`,
                userReaction: userId ? sql<'like' | 'dislike' | null>`(
                  SELECT type
                  FROM ${videoReactions}
                  WHERE ${videoReactions.videoId} = ${pv.video.id}
                  AND ${videoReactions.userId} = ${userId}
                )` : sql<null>`null`,
              })
              .from(videoReactions)
              .where(eq(videoReactions.videoId, pv.video.id));

            // Get user subscription data
            const [userData] = await ctx.db
              .select({
                subscribersCount: sql<number>`(
                  SELECT COUNT(*)::int
                  FROM ${subscriptions}
                  WHERE ${subscriptions.subscribedToId} = ${pv.video.user.clerkId}
                )`,
                isSubscribed: userId ? sql<boolean>`EXISTS (
                  SELECT 1
                  FROM ${subscriptions}
                  WHERE ${subscriptions.subscriberId} = ${userId}
                  AND ${subscriptions.subscribedToId} = ${pv.video.user.clerkId}
                )` : sql<boolean>`false`,
              })
              .from(subscriptions)
              .where(eq(subscriptions.subscribedToId, pv.video.user.clerkId));

            return {
              ...pv,
              video: {
                ...pv.video,
                stats,
                user: {
                  ...pv.video.user,
                  ...userData,
                },
              },
            };
          })
        );
        
        return {
          ...playlist,
          videos: videosWithStats,
        };
      } catch (error) {
        console.error("Error al obtener la playlist:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener la playlist",
        });
      }
    }),

  // Create a new playlist
  createPlaylist: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      isPublic: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth?.userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuario no autenticado",
        });
      }

      const [playlist] = await ctx.db.insert(playlists).values({
        name: input.name,
        description: input.description,
        isPublic: input.isPublic,
        userId: ctx.auth.userId,
      }).returning();

      return playlist;
    }),

  // Update a playlist
  updatePlaylist: protectedProcedure
    .input(z.object({
      playlistId: z.number(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      isPublic: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth?.userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuario no autenticado",
        });
      }

      const [playlist] = await ctx.db.update(playlists)
        .set({
          name: input.name,
          description: input.description,
          isPublic: input.isPublic,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(playlists.id, input.playlistId),
            eq(playlists.userId, ctx.auth.userId)
          )
        )
        .returning();

      if (!playlist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist no encontrada",
        });
      }

      return playlist;
    }),

  // Delete a playlist
  deletePlaylist: protectedProcedure
    .input(z.object({
      playlistId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth?.userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuario no autenticado",
        });
      }

      const [playlist] = await ctx.db.delete(playlists)
        .where(
          and(
            eq(playlists.id, input.playlistId),
            eq(playlists.userId, ctx.auth.userId)
          )
        )
        .returning();

      if (!playlist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist no encontrada",
        });
      }

      return playlist;
    }),

  // Add a video to a playlist
  addVideo: protectedProcedure
    .input(z.object({
      playlistId: z.number(),
      videoId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth?.userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuario no autenticado",
        });
      }

      // Verify playlist ownership
      const playlist = await ctx.db.query.playlists.findFirst({
        where: and(
          eq(playlists.id, input.playlistId),
          eq(playlists.userId, ctx.auth.userId)
        ),
      });

      if (!playlist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist no encontrada",
        });
      }

      // Get the current highest position
      const lastVideo = await ctx.db.query.playlistVideos.findFirst({
        where: eq(playlistVideos.playlistId, input.playlistId),
        orderBy: [desc(playlistVideos.position)],
      });

      const position = lastVideo ? lastVideo.position + 1 : 0;

      try {
        const [playlistVideo] = await ctx.db.insert(playlistVideos)
          .values({
            playlistId: input.playlistId,
            videoId: input.videoId,
            position,
          })
          .returning();

        return playlistVideo;
      } catch (error) {
        if (error instanceof Error && error.message.includes("unique_playlist_video")) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "El video ya está en la playlist",
          });
        }
        throw error;
      }
    }),

  // Remove a video from a playlist
  removeVideo: protectedProcedure
    .input(z.object({
      playlistId: z.number(),
      videoId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth?.userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuario no autenticado",
        });
      }

      // Verify playlist ownership
      const playlist = await ctx.db.query.playlists.findFirst({
        where: and(
          eq(playlists.id, input.playlistId),
          eq(playlists.userId, ctx.auth.userId)
        ),
      });

      if (!playlist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist no encontrada",
        });
      }

      const [playlistVideo] = await ctx.db.delete(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, input.playlistId),
            eq(playlistVideos.videoId, input.videoId)
          )
        )
        .returning();

      if (!playlistVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video no encontrado en la playlist",
        });
      }

      return playlistVideo;
    }),

  // Reorder videos in a playlist
  reorderVideos: protectedProcedure
    .input(z.object({
      playlistId: z.number(),
      videoPositions: z.array(z.object({
        videoId: z.number(),
        position: z.number(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth?.userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuario no autenticado",
        });
      }

      // Verify playlist ownership
      const playlist = await ctx.db.query.playlists.findFirst({
        where: and(
          eq(playlists.id, input.playlistId),
          eq(playlists.userId, ctx.auth.userId)
        ),
      });

      if (!playlist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist no encontrada",
        });
      }

      // Update positions in a transaction
      await ctx.db.transaction(async (tx) => {
        for (const { videoId, position } of input.videoPositions) {
          await tx.update(playlistVideos)
            .set({ position })
            .where(
              and(
                eq(playlistVideos.playlistId, input.playlistId),
                eq(playlistVideos.videoId, videoId)
              )
            );
        }
      });

      return { success: true };
    }),

    // Get all playlists for the current user
    getUserPlaylistsAndVideosPlaylists: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.auth?.userId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuario no autenticado",
          });
        }

        const playlistsWithVideos = await ctx.db
        .select({
          playlistId: playlists.id,
          playlistName: playlists.name,
          videos: {
            id: videos.id,
            title: videos.title,
            url: videos.url,
          },
        })
        .from(playlists)
        .innerJoin(playlistVideos, eq(playlistVideos.playlistId, playlists.id))
        .innerJoin(videos, eq(videos.id, playlistVideos.videoId))
        .where(eq(playlists.userId, playlistVideos.userId));
      }),
}); 