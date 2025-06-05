"use server"

import { VideoView } from "@/components/view/video-view";
import { HydrateClient, trpc } from "@/server/server"
import { Suggestions } from "@/components/suggestions/Suggestions"
import PlaylistSection from "@/components/playlist/PlaylistSection"
import { VideoSidebar } from "@/components/video/VideoSidebar"

interface VideoPageProps {
    params: {
        videoId: string
    }
}



export default async function VideoPage({params}: VideoPageProps) {
    const {videoId} = params;

    await Promise.all([
        trpc.video.getone.prefetch({id: videoId}),
        trpc.video.getVideoSuggestions.prefetchInfinite({
            id: videoId,
            limit: 10,
            cursor: null,
        })
    ]);

    return (
        <div className="grid sm:grid-cols-4 gap-4 mx-auto h-full grid-cols-1">
            <div className="col-span-3 mx-10 my-10">
                <HydrateClient>
                <VideoView videoId={videoId}/>
                </HydrateClient>
            </div>
            <div className="col-span-1 my-10">
            <HydrateClient>
                <VideoSidebar videoId={videoId} />
                </HydrateClient>
            </div>
        </div>
    )
}