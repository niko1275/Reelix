import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { getUserByClerkId, updateUser, createUser } from '@/lib/controller/users';
import { TRPCError } from '@trpc/server';

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
          createdAt: new Date(),
          updatedAt: new Date(),
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
}); 