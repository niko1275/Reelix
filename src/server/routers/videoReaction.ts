import { router, protectedProcedure, optionalAuthProcedure } from "../trpc";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { videoReactions, videos } from "@/lib/db/schema";
import type { InferModel } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

type VideoReaction = InferModel<typeof videoReactions>;

interface ReactionResponse {
  likes: number;
  dislikes: number;
  userReaction: 'like' | 'dislike' | null;
}

interface ToggleResponse {
  type: 'like' | 'dislike' | null;
}

export const videoReactionsRouter = router({
  
    getReactions: protectedProcedure
    .input(z.object({
      videoId: z.number(),
    }))
    .query(async ({ ctx, input }): Promise<ReactionResponse> => {
      console.log("▶️ getReactions - INPUT:", input);
  
      const reactions = await ctx.db.query.videoReactions.findMany({
        where: eq(videoReactions.videoId, input.videoId),
      });
  
      console.log("📦 REACTIONS ENCONTRADAS:", reactions);
  
      const likes = reactions.filter((r: VideoReaction) => r.type === 'like').length;
      const dislikes = reactions.filter((r: VideoReaction) => r.type === 'dislike').length;
  
      console.log("👍 Likes:", likes);
      console.log("👎 Dislikes:", dislikes);
      console.log("🔐 User ID:", ctx.auth?.userId);
  
      const userReaction = reactions.find((r: VideoReaction) => r.userId === ctx.auth?.userId);
  
      console.log("👤 Reacción del usuario:", userReaction);
  
      return {
        likes,
        dislikes,
        userReaction: userReaction?.type || null,
      };
    }),
  

  toggleReaction: protectedProcedure
    .input(z.object({
      videoId: z.number(),
      type: z.enum(['like', 'dislike']),
    }))
    .mutation(async ({ ctx, input }): Promise<ToggleResponse> => {
      if (!ctx.auth?.userId) {
        throw new Error("Usuario no autenticado");
      }
      
      const videoId = input.videoId;
      
      // Buscar reacción existente
      const existingReaction = await ctx.db.query.videoReactions.findFirst({
        where: and(
          eq(videoReactions.videoId, videoId),
          eq(videoReactions.userId, ctx.auth.userId)
        ),
      });

      if (existingReaction) {
        if (existingReaction.type === input.type) {
          // Si la reacción es del mismo tipo, la eliminamos
          await ctx.db.delete(videoReactions).where(
            and(
              eq(videoReactions.videoId, videoId),
              eq(videoReactions.userId, ctx.auth.userId)
            )
          );
          return { type: null };
        } else {
          console.log("User ID des "+ ctx.auth.userId + " cambiando reacción de "+ existingReaction.type + " a "+ input.type)
          await ctx.db.update(videoReactions)
            .set({ type: input.type })
            .where(
              and(
                eq(videoReactions.videoId, videoId),
                eq(videoReactions.userId, ctx.auth.userId)
              )
            );
          return { type: input.type };
        }
      } else {
        // Si no hay reacción, creamos una nueva
        await ctx.db.insert(videoReactions).values({
          videoId,
          userId: ctx.auth.userId,
          type: input.type,
        });
        return { type: input.type };
      }
    }),

  getLikedVideos: optionalAuthProcedure
  .input(z.object({
    userId: z.string(),
  }))
  .query(async ({ ctx, input }) => {
     const userId = ctx.auth?.userId;
    console.log("🔐 User ID:", userId);
    if (!userId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Resource not found',
      });}
    

    const likedVideos = await ctx.db
      .select()
      .from(videoReactions)
      .innerJoin(videos, eq(videoReactions.videoId, videos.id))
    
      .where(
        and(
          eq(videoReactions.userId, input.userId),
          eq(videoReactions.type, "like")
        )
      )
      

    return {
      likedVideos,
    };
  })
});