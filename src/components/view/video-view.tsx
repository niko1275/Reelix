"use client"

import { trpc } from "@/utils/trpc";
import { useAuth } from "@clerk/nextjs";

import { Suspense } from "react"
import { VideoPlayer, VideoPlayerSkeleton } from "../studio/VideoPlayer"
import { VideoBanner } from "./video-banner"
import { VideoTopRow, VideoTopRowSkeleton } from "./video-top-row"
import VideoDescription from "./video-description"
import { VideoComments } from "./video-comments"

import { VideoViewTracker } from "@/components/video/VideoViewTracker"
import { notFound } from "next/navigation"

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


function VideoViewContent({videoId}: VideoViewProps) {

  

    const { userId } = useAuth()
    const { data: video } = trpc.video.getone.useQuery({ id: videoId });
    const addView = trpc.video.addView.useMutation()

    if(!video){
        notFound()
    }
    
    const handleVideoStart = () => {
        // Solo registrar vista si el usuario está autenticado
        if (userId) {
            addView.mutate(
                { videoId }
                // No hagas nada en onSuccess, así no se recarga el video
            )
        }
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="aspect-video relative rounded-md ">
                <VideoPlayer 
                    thumnailurl={video.thumbnailUrl}
                    playbackId={video.playbackId || ""} 
                    autoplay={false}
                    onPlay={handleVideoStart}
                />
                <VideoBanner status={video.muxStatus} />
                {userId && <VideoViewTracker videoId={video.id} />}
            </div>
        
            <VideoTopRow video={video} />
            <VideoDescription 
                description={video.description || ""}
                publishedAt={video.createdAt.toLocaleString()}
                viewCount={video.views}
                likeCount={0}
                dislikeCount={0}
            />
            <VideoComments videoId={video.id} />
        </div>
    )
}