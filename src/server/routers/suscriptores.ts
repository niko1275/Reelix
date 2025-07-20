import { z } from "zod"

import { subscriptions, users } from "@/lib/db/schema"
import { eq, and, sql } from "drizzle-orm"
import { router,protectedProcedure } from "../trpc"
import { TRPCError } from "@trpc/server"


export const subscriptionsRouter = router({
  toggleSubscription: protectedProcedure
    .input(z.object({
      subscribedToId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { subscribedToId } = input
      const userId = ctx.auth?.userId
      if (!userId) throw new Error("No user ID in session");


      // Check if subscription exists
      const existingSubscription = await ctx.db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.subscriberId, userId),
            eq(subscriptions.subscribedToId, subscribedToId)
          )
        )
        .limit(1)

      if (existingSubscription.length > 0) {
        // Unsubscribe
        await ctx.db
          .delete(subscriptions)
          .where(
            and(
              eq(subscriptions.subscriberId, userId),
              eq(subscriptions.subscribedToId, subscribedToId)
            )
          )

        await ctx.db
          .delete(subscriptions)
          .where(
            and(
              eq(subscriptions.subscriberId, userId),
              eq(subscriptions.subscribedToId, subscribedToId)
            )
          )

        return { isSubscribed: false }
      } else {
       
        // Subscribe
        await ctx.db.insert(subscriptions).values({
          subscriberId: userId,
          subscribedToId,
        })

      

        return { isSubscribed: true }
      }
    }),

  getSubscriptionStatus: protectedProcedure
    .input(z.object({
      subscribedToId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { subscribedToId } = input
      const userId = ctx.auth?.userId

      if(!userId) throw new Error("No user ID in session");

      const subscription = await ctx.db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.subscriberId, userId),
            eq(subscriptions.subscribedToId, subscribedToId)
          )
        )
        .limit(1)

      return { isSubscribed: subscription.length > 0 }
    }),

  getSubscriberCount: protectedProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { userId } = input
    

      const result = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(subscriptions)
        .where(eq(subscriptions.subscribedToId, userId))

      return { count: Number(result[0].count) }
    }),

  getUserSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth?.userId;
     if (!ctx.auth?.userId) {
       throw new TRPCError({
         code: "NOT_FOUND",
         message: "You must be logged in to access this resource",
       });
     }

    // Join manual para obtener los datos del usuario suscrito
    const subs = await ctx.db
      .select({
        id: users.clerkId,
        name: users.name,
        imageUrl: users.imageUrl,
      })
      .from(subscriptions)
      .innerJoin(users, eq(subscriptions.subscribedToId, users.clerkId))
      .where(eq(subscriptions.subscriberId, userId || ""));

    return subs;
  }),
}) 