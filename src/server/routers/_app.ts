import { router } from '../trpc';
import { userRouter } from './user';
import { categoryRouter } from './category';
import { videoRouter } from './video';
import { videoViewRouter } from './videoView';
import { videoReactionsRouter } from './videoReaction';
import { subscriptionsRouter } from './suscriptores';
import { commentsRouter } from './comments';
import { playlistRouter } from './playlist';
import { watchHistoryRouter } from './WatchHistory';

export const appRouter = router({
  user: userRouter,
  category: categoryRouter,
  video: videoRouter,
  videoView: videoViewRouter,
  videoReactions: videoReactionsRouter,
  subscriptions: subscriptionsRouter,
  comments: commentsRouter,
  playlist: playlistRouter,
  watchHistory: watchHistoryRouter,
});

export type AppRouter = typeof appRouter; 