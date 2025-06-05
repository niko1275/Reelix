import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { eq, and, desc, asc, getTableColumns } from "drizzle-orm";
import { playlists, playlistVideos, users, videos } from "@/lib/db/schema";
import type { InferModel } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

type Playlist = InferModel<typeof playlists>;
type PlaylistVideo = InferModel<typeof playlistVideos>;

export const playlistRouter = router({

  getUserPlaylistsWithFirstVideo: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth?.userId;
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
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
  getUserPlaylists: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.auth?.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
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
      playlistId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.auth?.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuario no autenticado",
        });
      }

      const playlist = await ctx.db.query.playlists.findFirst({
        where: and(
          eq(playlists.id, input.playlistId),
          eq(playlists.userId, ctx.auth.userId)
        ),
        with: {
          videos: {
            with: {
              video: true,
            },
            orderBy: [asc(playlistVideos.position)],
          },
        },
      });

      if (!playlist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist no encontrada",
        });
      }

      return playlist;
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
          code: "UNAUTHORIZED",
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
          code: "UNAUTHORIZED",
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
          code: "UNAUTHORIZED",
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
          code: "UNAUTHORIZED",
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
          code: "UNAUTHORIZED",
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
          code: "UNAUTHORIZED",
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
            code: "UNAUTHORIZED",
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