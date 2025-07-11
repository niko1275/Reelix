"use client"

import { trpc } from "@/utils/trpc";
import { Suspense } from "react";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

interface User {
  id: number;
  clerkId: string;
  name: string;
  email: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  bannerUrl: string | null;
  bannerKey: string | null;
  subscribersCount: number;
}

interface Video {
  id: number;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  views: number;
  isPublished: boolean;
  userId: string;
  muxAssetId: string;
  muxStatus: string;
  muxUploadId: string;
  categoryId: number | null;
  createdAt: string;
  updatedAt: string;
  playbackId: string | null;
  visibility: string;
  user: User | null;
}

interface Playlist {
  id: number;
  name: string;
  description: string | null;
  userId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

type PlaylistWithVideos = Playlist & {
  videos: { video: Video }[];
};

interface PlaylistVideoSidebarProps {
    playlistId: number;
}

export function PlaylistVideoSidebar({ playlistId }: PlaylistVideoSidebarProps) {
    return (
        <Suspense fallback={<PlaylistVideoSidebarSkeleton />}>
            <PlaylistVideoSidebarContent playlistId={playlistId} />
        </Suspense>
    );
}

function PlaylistVideoSidebarSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <div className="flex gap-4">
                                <Skeleton className="h-20 w-32" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
function PlaylistVideoSidebarContent({ playlistId }: PlaylistVideoSidebarProps) {
    const { data } = trpc.playlist.getPlaylist.useQuery({ id: playlistId.toString() });
    const playlist = data as unknown as PlaylistWithVideos | undefined;
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentVideoId = searchParams.get('video');

    if (!playlist?.videos?.length) {
        return (
            <div className="text-center text-muted-foreground py-4">
                No hay videos en esta playlist
            </div>
        );
    }

    const handleVideoClick = (videoId: number) => {
        router.push(`/playlists/${playlistId}?video=${videoId}`);
    };

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">{playlist.name}</h2>
            <div className="space-y-4">
                {playlist.videos.map((playlistVideo) => (
                    <Card 
                        key={playlistVideo.video.id}
                        className={cn(
                            "hover:bg-accent transition-colors cursor-pointer",
                            "border-2",
                            playlistVideo.video.id.toString() === currentVideoId ? "border-black" : "border-transparent"
                        )}
                        onClick={() => handleVideoClick(playlistVideo.video.id)}
                    >
                        <CardContent className="p-4">
                            <div className="flex gap-4">
                                <div className="relative w-32 h-20">
                                    <Image
                                        src={playlistVideo.video.thumbnailUrl}
                                        alt={playlistVideo.video.title}
                                        fill
                                        className="object-cover rounded-md"
                                    />
                                    <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 text-xs text-white rounded">
                                        {playlistVideo.video.duration} Segundos
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium line-clamp-2">
                                        {playlistVideo.video.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {playlistVideo.video.user?.name || "Usuario"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {playlistVideo.video.views} vistas
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
} 