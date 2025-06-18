"use client";

import { trpc } from "@/utils/trpc";
import { Suspense, useEffect, useState } from "react";
import { VideoPlayer } from "../studio/VideoPlayer";
import { VideoTopRow } from "../view/video-top-row";
import VideoDescription from "../view/video-description";
import { VideoComments } from "../view/video-comments";
import { useRouter, useSearchParams } from "next/navigation";
import { playlists, playlistVideos, videos } from "@/lib/db/schema";
import type { InferModel } from "drizzle-orm";

type Playlist = InferModel<typeof playlists>;
type PlaylistVideo = InferModel<typeof playlistVideos>;
type Video = InferModel<typeof videos>;

type PlaylistWithVideos = Playlist & {
  videos: { video: Video }[];
};

interface PlaylistVideoViewProps {
    playlistId: number;
}

export function PlaylistVideoView({ playlistId }: PlaylistVideoViewProps) {
    return (
        <Suspense fallback={<PlaylistVideoViewSkeleton />}>
            <PlaylistVideoViewContent playlistId={playlistId} />
        </Suspense>
    );
}

export const PlaylistVideoViewSkeleton = () => {
    return (
        <div className="flex flex-col gap-4">
            <div className="aspect-video bg-muted animate-pulse rounded-md" />
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="h-8 bg-muted animate-pulse rounded-md w-3/4" />
                    <div className="h-4 bg-muted animate-pulse rounded-md w-1/2" />
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
                    <div className="space-y-2">
                        <div className="h-4 bg-muted animate-pulse rounded-md w-32" />
                        <div className="h-3 bg-muted animate-pulse rounded-md w-24" />
                    </div>
                </div>
                <div className="h-24 bg-muted animate-pulse rounded-md" />
            </div>
        </div>
    );
};

function PlaylistVideoViewContent({ playlistId }: PlaylistVideoViewProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const videoId = searchParams.get('video');
    const { data, isLoading } = trpc.playlist.getPlaylist.useQuery({ id: playlistId.toString() });
    const playlist = data as unknown as PlaylistWithVideos | undefined;
    const addView = trpc.video.addView.useMutation();
    const utils = trpc.useUtils();

    // Redirigir al primer video si no hay video seleccionado
    useEffect(() => {
        if (playlist?.videos?.length && !videoId) {
            const firstVideo = playlist.videos[0].video;
            router.push(`/playlists/${playlistId}?video=${firstVideo.id}`);
        }
    }, [playlist, videoId, playlistId, router]);

    // Encontrar el índice del video actual
    const currentVideoIndex = playlist?.videos.findIndex(
        (pv) => pv.video.id.toString() === videoId
    ) ?? 0;

    const currentVideo = playlist?.videos?.[currentVideoIndex]?.video;

    console.log("🧪 currentVideo:", playlist);

    const handleVideoEnd = () => {
        if (currentVideoIndex < (playlist?.videos?.length || 0) - 1) {
            const nextVideo = playlist?.videos[currentVideoIndex + 1]?.video;
            if (nextVideo) {
                router.push(`/playlists/${playlistId}?video=${nextVideo.id}`);
            }
        }
    };

    const handleVideoStart = () => {
        if (currentVideo) {
            addView.mutate(
                { videoId: currentVideo.id },
                {
                    onSuccess: () => {
                        utils.video.getone.invalidate({ id: currentVideo.id.toString() });
                    }
                }
            );
        }
    };

    if (isLoading) {
        return <PlaylistVideoViewSkeleton />;
    }

    if (!playlist || !currentVideo) {
        return <div>No se encontró la playlist o no tiene videos</div>;
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="aspect-video relative rounded-md">
                <VideoPlayer
                    thumnailurl={currentVideo.thumbnailUrl}
                    playbackId={currentVideo.playbackId}
                    autoplay={false}
                    onPlay={handleVideoStart}
                    onEnded={handleVideoEnd}
                />
            </div>

            <VideoTopRow video={currentVideo} />
            <VideoDescription
                description={currentVideo.description}
                compactView={currentVideo.views?.toLocaleString?.() ?? "0"}
                compactdate={currentVideo.createdAt?.toLocaleString?.() ?? ""}
                expandeddate={currentVideo.createdAt?.toLocaleString?.() ?? ""}
                expandedView={currentVideo.views?.toLocaleString?.() ?? "0"}
            />
            <VideoComments videoId={currentVideo.id} />
        </div>
    );
} 