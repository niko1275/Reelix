import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { eq, and, desc, isNull } from "drizzle-orm";
import { comments } from "@/lib/db/schema";
import { TRPCError } from "@trpc/server";

export const commentsRouter = router({
  // Obtener comentarios de un video
  getVideoComments: protectedProcedure
    .input(z.object({
      videoId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const videoComments = await ctx.db.query.comments.findMany({
        where: and(
          eq(comments.videoId, input.videoId),
          isNull(comments.parentId) // Solo comentarios principales, no respuestas
        ),
        with: {
          user: true,
          replies: {
            with: {
              user: true,
            },
            orderBy: [desc(comments.createdAt)],
          },
        },
        orderBy: [desc(comments.createdAt)],
      });

      return videoComments;
    }),

  // Crear un nuevo comentario
  createComment: protectedProcedure
    .input(z.object({
      content: z.string().min(1).max(1000),
      videoId: z.number(),
      parentId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth?.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuario no autenticado",
        });
      }

      const newComment = await ctx.db.insert(comments).values({
        content: input.content,
        videoId: input.videoId,
        userId: ctx.auth.userId,
        parentId: input.parentId,
      }).returning();

      return newComment;
    }),

  // Actualizar un comentario
  updateComment: protectedProcedure
    .input(z.object({
      commentId: z.number(),
      content: z.string().min(1).max(1000),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth?.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuario no autenticado",
        });
      }

      // Verificar que el usuario es el dueño del comentario
      const comment = await ctx.db.query.comments.findFirst({
        where: and(
          eq(comments.id, input.commentId),
          eq(comments.userId, ctx.auth.userId)
        ),
      });

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comentario no encontrado o no tienes permiso para editarlo",
        });
      }

      const updatedComment = await ctx.db.update(comments)
        .set({
          content: input.content,
          updatedAt: new Date(),
        })
        .where(eq(comments.id, input.commentId))
        .returning();

      return updatedComment[0];
    }),

  // Eliminar un comentario
  deleteComment: protectedProcedure
    .input(z.object({
      commentId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth?.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuario no autenticado",
        });
      }

      // Verificar que el usuario es el dueño del comentario
      const comment = await ctx.db.query.comments.findFirst({
        where: and(
          eq(comments.id, input.commentId),
          eq(comments.userId, ctx.auth.userId)
        ),
      });

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comentario no encontrado o no tienes permiso para eliminarlo",
        });
      }

      await ctx.db.delete(comments).where(eq(comments.id, input.commentId));
      return { success: true };
    }),
}); 