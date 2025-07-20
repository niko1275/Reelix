"use client"


import { Skeleton } from "../ui/skeleton"
import MuxPlayer from '@mux/mux-player-react';

interface VideoPlayerProps {
    playbackId: string
    thumnailurl?: string | null
    autoplay?: boolean
    onPlay?: () => void
    onEnded?: () => void
}

export const VideoPlayerSkeleton = () => {
    return (
        <div className="aspect-video bg-gray-200 animate-pulse rounded-md">
            <Skeleton className="h-full w-full"/>
        </div>
    )
}

export const VideoPlayer = ({
    playbackId,
    thumnailurl,
    autoplay = false,
    onPlay,
    onEnded
}: VideoPlayerProps) => {
    return (
        <div className="relative w-full h-[60vw] max-h-[60vw] sm:aspect-video sm:h-auto sm:max-h-none rounded-md">
            <MuxPlayer
                playbackId={playbackId}
                accentColor="#ea580c"
                metadata={{
                    videoTitle: "Video",
                }}
                poster={thumnailurl ?? undefined}
                autoPlay={autoplay}
                onPlay={onPlay}
                onEnded={onEnded}
                streamType="on-demand"
                style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
            />
        </div>
    )
}