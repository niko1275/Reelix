"use client"

import { useEffect, useRef, useState } from "react"
import Hls from "hls.js"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "../ui/skeleton"

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
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [hasPlayed, setHasPlayed] = useState(false)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const handlePlay = () => {
            if (!hasPlayed) {
                setHasPlayed(true)
                onPlay?.()
            }
        }

        const handleEnded = () => {
            onEnded?.()
        }

        video.addEventListener('play', handlePlay)
        video.addEventListener('ended', handleEnded)

        const videoUrl = `https://stream.mux.com/${playbackId}.m3u8`

        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
                maxBufferSize: 60 * 1000 * 1000, // 60MB
                maxBufferHole: 0.5,
                highBufferWatchdogPeriod: 2,
                nudgeMaxRetry: 5,
                nudgeOffset: 0.1,
                startFragPrefetch: true,
                testBandwidth: true,
                progressive: true,
                backBufferLength: 90
            })

            hls.loadSource(videoUrl)
            hls.attachMedia(video)

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setIsLoading(false)
                if (autoplay) {
                    video.play().catch(() => {
                        // Autoplay was prevented
                        console.log("Autoplay prevented")
                    })
                }
            })

            hls.on(Hls.Events.ERROR, (_, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            // try to recover network error
                            console.log('fatal network error encountered, trying to recover');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.log('fatal media error encountered, trying to recover');
                            hls.recoverMediaError();
                            break;
                        default:
                            // cannot recover
                            setError("Error al cargar el video")
                            setIsLoading(false)
                            hls.destroy();
                            break;
                    }
                }
            })

            return () => {
                hls.destroy()
                video.removeEventListener('play', handlePlay)
                video.removeEventListener('ended', handleEnded)
            }
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            // Para Safari
            video.src = videoUrl
            video.addEventListener("loadedmetadata", () => {
                setIsLoading(false)
                if (autoplay) {
                    video.play().catch(() => {
                        console.log("Autoplay prevented")
                    })
                }
            })
        } else {
            setError("Tu navegador no soporta la reproducción de video")
            setIsLoading(false)
        }
    }, [playbackId, autoplay, onPlay, onEnded, hasPlayed])

    if (error) {
        return (
            <div className="aspect-video bg-black flex items-center justify-center">
                <p className="text-white">{error}</p>
            </div>
        )
    }

    return (
        <div className="relative aspect-video">
            {isLoading && (
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
            )}
            <video
                ref={videoRef}
                className={cn(
                    "h-full w-full rounded-md object-cover",
                    "focus:outline-none focus:ring-2 focus:ring-primary"
                )}
                controls
                playsInline
                poster={thumnailurl ?? undefined}
            />
        </div>
    )
}