
import { z } from 'zod';
import { router, publicProcedure,protectedProcedure } from '../trpc';
import db from '@/lib/db/db';
import { videoViews } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

export const videoViewRouter = router({
    create: protectedProcedure
    .input(z.object({
        videoId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
        const { videoId } = input;
        const { userId } = ctx;

        const [existingVideoView] = await db
        .select().from(videoViews).where
        (
            and(
                eq(videoViews.videoId, videoId),
                eq(videoViews.userId, userId)
            )
        )

        if(existingVideoView){
            return existingVideoView;
        }

        const newVideoView = await db.insert(videoViews).values({
            videoId,
            userId,
        }).returning();

        return newVideoView[0];
    }),
}); 