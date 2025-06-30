"use client"

import { trpc } from "@/utils/trpc"
import { Suspense, useEffect, useRef } from "react"
import { VideoPlayer, VideoPlayerSkeleton } from "../studio/VideoPlayer"
import { VideoBanner } from "./video-banner"
import { VideoTopRow, VideoTopRowSkeleton } from "./video-top-row"
import VideoDescription from "./video-description"
import { VideoComments } from "./video-comments"
import { type videos } from "@/lib/db/schema"
import { type InferSelectModel } from "drizzle-orm"
import { VideoViewTracker } from "@/components/video/VideoViewTracker"
import { useAuth } from "@clerk/nextjs"

interface VideoViewProps {
    videoId: string
}

export function VideoView({videoId}: VideoViewProps) {
    return (
        <Suspense fallback={<VideoViewSkeleton/>}>
            <VideoViewContent videoId={videoId}/>
        </Suspense>
    )
}

export const VideoViewSkeleton = () => {
    return (
        <div className="flex flex-col gap-4">
            <VideoPlayerSkeleton/>
            <VideoTopRowSkeleton/>
        </div>
    )
}

type Video = InferSelectModel<typeof videos>

function VideoViewContent({videoId}: VideoViewProps) {

    const { userId } = useAuth()

    const [video] = trpc.video.getone.useSuspenseQuery({id: videoId}) as unknown as [Video & { isOwner: boolean }]
    const addView = trpc.video.addView.useMutation()
    const utils = trpc.useUtils()
  
    
    const handleVideoStart = () => {
        addView.mutate(
            { videoId },
            {
                onSuccess: () => {
                    // Invalidar la consulta para actualizar el contador de vistas
                    utils.video.getone.invalidate({ id: videoId })
                }
            }
        )
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="aspect-video relative rounded-md ">
                <VideoPlayer 
                    thumnailurl={video.thumbnailUrl}
                    playbackId={video.playbackId} 
                    autoplay={false}
                    onPlay={handleVideoStart}
                />
                <VideoBanner status={video.muxStatus} />
                {userId && <VideoViewTracker videoId={video.id} />}
            </div>
        
            <VideoTopRow video={video} />
            <VideoDescription 
                description={video.description}
                compactView={video.views.toLocaleString()}
                compactdate={video.createdAt.toLocaleString()}
                expandeddate={video.createdAt.toLocaleString()}
                expandedView={video.views.toLocaleString()}
            />
            <VideoComments videoId={video.id} />
        </div>
    )
}