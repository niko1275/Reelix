import 'server-only'; // <-- ensure this file cannot be imported from the client
import { createHydrationHelpers } from '@trpc/react-query/rsc';
import { cache } from 'react';
import { appRouter } from './routers/_app';
import { createCallerFactory, createTRPCContext } from './trpc';
import { makeQueryClient } from '@/trcp/query-client';
import { NextRequest } from 'next/server';


export const getQueryClient = cache(makeQueryClient);

const caller = createCallerFactory(appRouter)(createTRPCContext);

export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(
  caller,
  getQueryClient,
);