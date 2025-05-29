"use client"

import { useEffect, useRef } from "react"
import Hls from "hls.js"
import { cn } from "@/lib/utils"

interface VideoPlayerProps {
    playbackId: string
    thumnailurl: string
    autoplay?: boolean
}

export const VideoPlayer = ({
    playbackId,
    thumnailurl,
    autoplay = false
}: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const hls = new Hls({
            maxBufferLength: 30,
            maxMaxBufferLength: 600,
            manifestLoadingTimeOut: 20000,
            manifestLoadingMaxRetry: 1,
            levelLoadingTimeOut: 20000,
            levelLoadingMaxRetry: 4,
            fragLoadingTimeOut: 20000,
            fragLoadingMaxRetry: 6,
            startFragPrefetch: true,
            testBandwidth: true,
            progressive: true,
            lowLatencyMode: true,
            backBufferLength: 90
        })

        const muxUrl = `https://stream.mux.com/${playbackId}.m3u8`

        hls.loadSource(muxUrl)
        hls.attachMedia(video)

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (autoplay) {
                video.play()
            }
        })

        return () => {
            hls.destroy()
        }
    }, [playbackId, autoplay])

    return (
        <div className="relative aspect-video">
            <video
                ref={videoRef}
                poster={thumnailurl}
                className={cn(
                    "h-full w-full rounded-md object-cover",
                    "focus:outline-none focus:ring-2 focus:ring-primary"
                )}
                controls
                playsInline
                preload="metadata"
            />
        </div>
    )
}