import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { eq, and, desc, isNull, isNotNull } from "drizzle-orm";
import { comments, users, commentReactions } from "@/lib/db/schema";
import { TRPCError } from "@trpc/server";

export const commentsRouter = router({
  // Obtener comentarios de un video
  getVideoComments: protectedProcedure
    .input(z.object({
      videoId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        console.log("Fetching comments for videoId:", input.videoId);
        
        // Primero obtenemos los comentarios principales
        const mainComments = await ctx.db.query.comments.findMany({
          where: and(
            eq(comments.videoId, input.videoId),
            isNull(comments.parentId)
          ),
          with: {
            user: true,
          },
          orderBy: [desc(comments.createdAt)],
        });

        // Luego obtenemos todas las respuestas para estos comentarios
        const replies = await ctx.db.query.comments.findMany({
          where: and(
            eq(comments.videoId, input.videoId),
            isNotNull(comments.parentId)
          ),
          with: {
            user: true,
            parent: {
              with: {
                user: true
              }
            }
          },
          orderBy: [desc(comments.createdAt)],
        });

        // Combinamos los comentarios principales con sus respuestas
        const videoComments = await Promise.all(mainComments.map(async comment => {
          const commentReplies = replies.filter(reply => reply.parentId === comment.id);
          const repliesWithUsers = await Promise.all(commentReplies.map(async reply => {
            const replyingToUser = reply.replyingTo ? await ctx.db.query.users.findFirst({
              where: eq(users.clerkId, reply.replyingTo)
            }) : null;
            
            return {
              ...reply,
              replyingToUser
            };
          }));

          return {
            ...comment,
            replies: repliesWithUsers
          };
        }));

        for (const comment of videoComments) {
          console.log(`Replies for comment ${comment.replies}:`, comment.replies);
        }
        console.log("Comments fetched successfully:", videoComments);
        return videoComments;
      } catch (error) {
        console.error("Error fetching video comments:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener los comentarios del video",
          cause: error,
        });
      }
    }),

  // Crear un nuevo comentario
  createComment: protectedProcedure
    .input(z.object({
      content: z.string().min(1).max(1000),
      videoId: z.number(),
      parentId: z.number().optional(),
      replyingTo: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth?.userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuario no autenticado",
        });
      }

      const newComment = await ctx.db.insert(comments).values({
        content: input.content,
        videoId: input.videoId,
        userId: ctx.auth.userId,
        parentId: input.parentId,
        replyingTo: input.replyingTo,
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
          code: "NOT_FOUND",
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
          code: "NOT_FOUND",
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

  // Obtener reacciones de un comentario
  getCommentReactions: protectedProcedure
    .input(z.object({
      commentId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const reactions = await ctx.db.query.commentReactions.findMany({
          where: eq(commentReactions.commentId, input.commentId),
          with: {
            user: true,
          },
        });

        const likes = reactions.filter(r => r.type === 'like').length;
        const dislikes = reactions.filter(r => r.type === 'dislike').length;
        const userReaction = reactions.find(r => r.userId === ctx.auth?.userId)?.type;

        return {
          likes,
          dislikes,
          userReaction,
        };
      } catch (error) {
        console.error("Error fetching comment reactions:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener las reacciones del comentario",
          cause: error,
        });
      }
    }),

  // Agregar o actualizar reacción
  toggleReaction: protectedProcedure
    .input(z.object({
      commentId: z.number(),
      type: z.enum(['like', 'dislike']),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth?.userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuario no autenticado",
        });
      }

      try {
        // Buscar si ya existe una reacción del usuario
        const existingReaction = await ctx.db.query.commentReactions.findFirst({
          where: and(
            eq(commentReactions.commentId, input.commentId),
            eq(commentReactions.userId, ctx.auth.userId)
          ),
        });

        if (existingReaction) {
          // Si la reacción es del mismo tipo, la eliminamos
          if (existingReaction.type === input.type) {
            await ctx.db.delete(commentReactions)
              .where(eq(commentReactions.id, existingReaction.id));
            return { removed: true };
          }
          // Si es diferente, actualizamos el tipo
          await ctx.db.update(commentReactions)
            .set({ type: input.type })
            .where(eq(commentReactions.id, existingReaction.id));
          return { updated: true };
        }

        // Si no existe, creamos una nueva reacción
        await ctx.db.insert(commentReactions).values({
          commentId: input.commentId,
          userId: ctx.auth.userId,
          type: input.type,
        });

        return { added: true };
      } catch (error) {
        console.error("Error toggling reaction:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al actualizar la reacción",
          cause: error,
        });
      }
    }),
}); 