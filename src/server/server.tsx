"server-only";
import { createHydrationHelpers } from '@trpc/react-query/rsc';
import { cache } from 'react';
import { appRouter } from './routers/_app';
import { createCallerFactory, createTRPCContext } from './trpc';
import { makeQueryClient } from '@/trcp/query-client';

export const getQueryClient = cache(makeQueryClient);

const caller = createCallerFactory(appRouter)(createTRPCContext);

export const { HydrateClient, trpc } = createHydrationHelpers<typeof appRouter>(
  caller,
  getQueryClient,
);