import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { getUserByClerkId, updateUser, createUser } from '@/lib/controller/users';
import { TRPCError } from '@trpc/server';
import { subscriptions, users, videos } from '@/lib/db/schema';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import { json } from 'stream/consumers';

export const userRouter = router({
  getProfile: publicProcedure
    .input(z.object({ clerkId: z.string() }))
    .query(async ({ input }) => {
      if (!input.clerkId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Se requiere un ID de usuario',
        });
      }

      const user = await getUserByClerkId(input.clerkId);
      
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usuario no encontrado',
        });
      }

      return user;
    }),

  updateProfile: publicProcedure
    .input(z.object({
      clerkId: z.string(),
      name: z.string(),
      email: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      if (!input.clerkId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Se requiere un ID de usuario',
        });
      }

      let user = await getUserByClerkId(input.clerkId);
      
      if (!user) {
        // Si el usuario no existe, lo creamos
        user = await createUser({
          clerkId: input.clerkId,
          name: input.name,
          email: input.email,
          imageUrl: '', // Esto debería venir de Clerk
         
    
        });
      } else {
        // Si existe, lo actualizamos
        user = await updateUser(input.clerkId, {
        name: input.name,
        email: input.email,
      });
      }

      if (!user) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al actualizar el usuario',
        });
      }

      return user;
    }),

    getOneUser: publicProcedure
    .input(z.object({ clerkId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!input.clerkId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Se requiere un ID de usuario",
        });
      }
  
      // First get the user with subscriber count
      const userData = await ctx.db
        .select({
          user: {
            ...getTableColumns(users),
          },
          subscriberCount: sql<number>`count(${subscriptions.id})`.as("subscriberCount"),
        })
        .from(users)
        .where(eq(users.clerkId, input.clerkId))
        .leftJoin(subscriptions, eq(subscriptions.subscribedToId, input.clerkId))
        .groupBy(
          users.id,
          users.name,
          users.email,
          users.clerkId,
          users.imageUrl,
          users.createdAt,
          users.updatedAt,
          users.bannerUrl,
          users.bannerKey
        );

      if (!userData || userData.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuario no encontrado",
        });
      }

      // Then get the user's videos
      const userVideos = await ctx.db
        .select({
          ...getTableColumns(videos),
        })
        .from(videos)
        .where(eq(videos.userId, input.clerkId));
      
      return {
        ...userData[0],
        videosUser: userVideos
      };
    }),
    
}); 