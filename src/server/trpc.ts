import { initTRPC, TRPCError } from '@trpc/server';
import { getAuth } from '@clerk/nextjs/server';
import db from '@/lib/db/db';
import { auth } from '@clerk/nextjs/server'
import { cache } from 'react';
import { videoReactionsRouter } from "./routers/videoReaction";
import { subscriptionsRouter } from "./routers/subscriptions";
import { userRouter } from "./routers/user";
import { videoRouter } from "./routers/video";
import { categoryRouter } from "./routers/category";

export interface Context {
  auth: ReturnType<typeof getAuth> | null;
  db: typeof db;
}


export const createTRPCContext = cache(async () => {
  const { userId } = await auth();
  return {
    auth: { userId },
    db,
  }
});

const t = initTRPC.context<Context>().create();

// Exportar los procedimientos base
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

// Middleware de autenticación
const isAuthed = t.middleware(async ({ next, ctx }) => {
  if (!ctx.auth?.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.auth.userId,
    },
  });
});

// Procedimiento que puede ser público o protegido
export const optionalAuthProcedure = t.procedure.use(
  t.middleware(async ({ next, ctx }) => {
    return next({
      ctx: {
        ...ctx,
        userId: ctx.auth?.userId || null,
      },
    });
  })
);

export const protectedProcedure = t.procedure.use(isAuthed);

// Exportar el router
export const router = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;