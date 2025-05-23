import { initTRPC, TRPCError } from '@trpc/server';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import db from '@/lib/db/db';

export interface Context {
  auth: ReturnType<typeof getAuth>;
  db: typeof db;
}

export const createTRPCContext = async (opts: { req: NextRequest }) => {
  const { req } = opts;
  const auth = getAuth(req);

  return {
    auth,
    db,
  };
};

const t = initTRPC.context<Context>().create();

// Exportar los procedimientos base
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

// Middleware de autenticación
const isAuthed = t.middleware(async ({ next, ctx }) => {
  const { userId } = ctx.auth;

  if (!userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);

// Exportar el router

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;