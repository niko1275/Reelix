import { router } from '../trpc';
import { userRouter } from './user';
import { categoryRouter } from './category';

export const appRouter = router({
  user: userRouter,
  category: categoryRouter,
});

export type AppRouter = typeof appRouter; 