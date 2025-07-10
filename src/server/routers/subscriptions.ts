import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { subscriptions } from "@/lib/db/schema";
import type { InferModel } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

type Subscription = InferModel<typeof subscriptions>;

interface SubscriptionResponse {
  isSubscribed: boolean;
}

export const subscriptionsRouter = router({
  getSubscriptionStatus: protectedProcedure
    .input(z.object({
      subscribedToId: z.string(),
    }))
    .query(async ({ ctx, input }): Promise<SubscriptionResponse> => {
      if (!ctx.auth?.userId) {
        return { isSubscribed: false };
      }

      const subscription = await ctx.db.query.subscriptions.findFirst({
        where: and(
          eq(subscriptions.subscriberId, ctx.auth.userId),
          eq(subscriptions.subscribedToId, input.subscribedToId)
        ),
      });

      return { isSubscribed: !!subscription };
    }),

  toggleSubscription: protectedProcedure
    .input(z.object({
      subscribedToId: z.string(),
    }))
    .mutation(async ({ ctx, input }): Promise<SubscriptionResponse> => {
      if (!ctx.auth?.userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuario no autenticado",
        });
      }

      // No permitir suscribirse a uno mismo
      if (ctx.auth.userId === input.subscribedToId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No puedes suscribirte a ti mismo",
        });
      }

      try {
        // Primero verificamos si existe la suscripción
        const existingSubscription = await ctx.db.query.subscriptions.findFirst({
          where: and(
            eq(subscriptions.subscriberId, ctx.auth.userId),
            eq(subscriptions.subscribedToId, input.subscribedToId)
          ),
        });

        // Si existe, la eliminamos (desuscribirse)
        if (existingSubscription) {
          await ctx.db.delete(subscriptions).where(
            and(
              eq(subscriptions.subscriberId, ctx.auth.userId),
              eq(subscriptions.subscribedToId, input.subscribedToId)
            )
          );
          return { isSubscribed: false };
        }

        // Si no existe, verificamos una vez más antes de insertar
        const doubleCheck = await ctx.db.query.subscriptions.findFirst({
          where: and(
            eq(subscriptions.subscriberId, ctx.auth.userId),
            eq(subscriptions.subscribedToId, input.subscribedToId)
          ),
        });

        if (doubleCheck) {
          // Si por alguna razón ya existe, la eliminamos
          await ctx.db.delete(subscriptions).where(
            and(
              eq(subscriptions.subscriberId, ctx.auth.userId),
              eq(subscriptions.subscribedToId, input.subscribedToId)
            )
          );
          return { isSubscribed: false };
        }

        // Si no existe, creamos la suscripción
        await ctx.db.insert(subscriptions).values({
          subscriberId: ctx.auth.userId,
          subscribedToId: input.subscribedToId,
        });

        return { isSubscribed: true };
      } catch (error) {
        console.error("Error en toggleSubscription:", error);
        
        // Si hay un error de duplicado, intentamos limpiar el estado
        if (error instanceof Error && error.message.includes("unique_subscription")) {
          try {
            await ctx.db.delete(subscriptions).where(
              and(
                eq(subscriptions.subscriberId, ctx.auth.userId),
                eq(subscriptions.subscribedToId, input.subscribedToId)
              )
            );
            return { isSubscribed: false };
          } catch (cleanupError) {
            console.error("Error limpiando estado:", cleanupError);
          }
        }

        // Si el error es de duplicado, devolvemos un estado específico
        if (error instanceof Error && error.message.includes("unique_subscription")) {
          return { isSubscribed: true };
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al actualizar la suscripción",
        });
      }
    }),
}); 