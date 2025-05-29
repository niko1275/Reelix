import { router } from '../trpc';
import { userRouter } from './user';
import { categoryRouter } from './category';
import { videoRouter } from './video';

export const appRouter = router({
  user: userRouter,
  category: categoryRouter,
  video: videoRouter,
});

export type AppRouter = typeof appRouter; 