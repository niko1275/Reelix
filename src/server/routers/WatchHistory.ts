import { z } from "zod";
import { optionalAuthProcedure, protectedProcedure, router } from "../trpc";
import { watchHistory, videos } from "@/lib/db/schema";
import { eq, and, inArray, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const watchHistoryRouter = router({
  getAll: optionalAuthProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth?.userId;

    if (!userId) {
      throw new TRPCError({
        code: "NOT_FOUND", // Cambiar a NOT_FOUND
        message: "Resource not found",
      });
    }
   
    try {
        const historyWithVideos = await ctx.db
        .select({
          id: watchHistory.id,
          userId: watchHistory.userId,
          videoId: watchHistory.videoId,
          watchedAt: watchHistory.watchedAt,
          progress: watchHistory.progress,
          watchDuration: watchHistory.watchDuration,
          lastPosition: watchHistory.lastPosition,
          completed: watchHistory.completed,
          video: {
            id: videos.id,
            title: videos.title,
            thumbnailUrl: videos.thumbnailUrl,
            duration: videos.duration,
            userId: videos.userId,
            muxUploadId:videos.muxUploadId
        
          }
        })
        .from(watchHistory)
        .innerJoin(videos, eq(watchHistory.videoId, videos.id))
        .where(eq(watchHistory.userId, userId))
        .orderBy(desc(watchHistory.watchedAt));
        console.log(historyWithVideos);
        return historyWithVideos;
    } catch (error) {
      console.error("Error fetching watch history:", error);
      throw new Error("Error al obtener el historial");
    }
  }),

  update: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
        userId: z.string(),
        progress: z.number(),
        watchDuration: z.number(),
        lastPosition: z.number(),
        completed: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { videoId, userId, progress, watchDuration, lastPosition, completed } = input;

      try {
        // Actualizar o crear el registro de historial
        await ctx.db
          .insert(watchHistory)
          .values({
            videoId: parseInt(videoId),
            userId,
            progress,
            watchDuration,
            lastPosition,
            completed,
            watchedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [watchHistory.userId, watchHistory.videoId],
            set: {
              progress,
              watchDuration,
              lastPosition,
              completed,
              watchedAt: new Date(),
            },
          });

        return { success: true };
      } catch (error) {
        console.error("Error updating watch history:", error);
        throw new Error("Error al actualizar el historial");
      }
    }),

  delete: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { ids } = input;
      const userId = ctx.auth?.userId;
      if (!userId) {
        throw new Error("User ID is required");
      }

      try {
        await ctx.db
          .delete(watchHistory)
          .where(
            and(
              eq(watchHistory.userId, userId),
              inArray(watchHistory.id, ids.map(id => parseInt(id)))
            )
          );

        return { success: true };
      } catch (error) {
        console.error("Error deleting watch history:", error);
        throw new Error("Error al eliminar el historial");
      }
    }),

  clearHistory: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.auth?.userId;
      if (!userId) {
        throw new Error("User ID is required");
      }

      try {
        await ctx.db
          .delete(watchHistory)
          .where(eq(watchHistory.userId, userId));

        return { success: true };
      } catch (error) {
        console.error("Error clearing watch history:", error);
        throw new Error("Error al limpiar el historial");
      }
    }),
}); 