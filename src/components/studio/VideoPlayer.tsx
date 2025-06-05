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
    onPlay
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

        video.addEventListener('play', handlePlay)

        const videoUrl = `https://stream.mux.com/${playbackId}.m3u8`

        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
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
                    setError("Error al cargar el video")
                    setIsLoading(false)
                }
            })

            return () => {
                hls.destroy()
                video.removeEventListener('play', handlePlay)
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
    }, [playbackId, autoplay, onPlay, hasPlayed])

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