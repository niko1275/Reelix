"use server"
import { HydrateClient, trpc } from "@/server/server";
import { VideoContent } from "@/components/video/VideoContent";
import { auth } from '@clerk/nextjs/server'
interface VideoPageProps {
    params: {
        videoId: string
    }
}

export default async function VideoPage({params}: VideoPageProps) {
    const {videoId} = await params;
    const userid = auth.protect()

    await Promise.all([
        trpc.video.getone.prefetch({id: videoId}),
        trpc.video.getVideoSuggestions.prefetchInfinite({
            id: videoId,
            limit: 10,
            cursor: null,
        })
    ]);

    return (
        <HydrateClient>
            <VideoContent videoId={videoId} />
        </HydrateClient>
    );
}