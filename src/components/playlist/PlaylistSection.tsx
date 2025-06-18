"use client"
import { trpc } from "@/utils/trpc"
import { Suspense } from "react";
import { PlaylistCard } from "./PlaylistCard"
import { cn } from "@/lib/utils";
import { playlists } from "@/lib/db/schema";
import type { InferModel } from "drizzle-orm";

type Playlist = InferModel<typeof playlists>;

interface PlaylistSectionProps {
    isExpanded?: boolean;
}

export default function PlaylistSection({ isExpanded = true }: PlaylistSectionProps) {
    return(
        <Suspense fallback={<div>Loading...</div>}>
            <PlaylistSectionQuery isExpanded={isExpanded} />
        </Suspense>
    )
}

const PlaylistSectionQuery = ({ isExpanded }: PlaylistSectionProps) =>  {
    const [playlistsData] = trpc.playlist.getUserPlaylistsWithFirstVideo.useSuspenseQuery();
    
    if (!playlistsData?.length) {
        return (
            <div className="text-center text-muted-foreground py-4">
                No tienes playlists creadas
            </div>
        );
    }

    console.log("playlistsData example:", playlistsData[0]);

    return(
        <div className={cn(
            "grid gap-4 transition-all duration-300 sm:grid-cols-3  grid-cols-1"
        )}>
            {playlistsData.map((playlist) => (
                <PlaylistCard
                    key={playlist.id}
                    playlist={{
                        ...playlist,
                        createdAt: new Date(playlist.createdAt),
                        updatedAt: new Date(playlist.updatedAt),
                        user: { username: playlist.user.name },
                        videos: playlist.firstVideo
                            ? [{
                                video: {
                                    id: playlist.firstVideo.id,
                                    title: playlist.firstVideo.title,
                                    thumbnailUrl: playlist.firstVideo.thumbnailUrl
                                }
                            }]
                            : []
                    }}
                />
            ))}
        </div>
    )
}
