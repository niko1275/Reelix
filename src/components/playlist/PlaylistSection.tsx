"use client"
import { trpc } from "@/utils/trpc"
import { Suspense } from "react";
import { PlaylistCard } from "./PlaylistCard"
import { cn } from "@/lib/utils";

export default function PlaylistSection() {
    return(
        <Suspense fallback={<div>Loading...</div>}>
            <PlaylistSectionQuery />
        </Suspense>
    )
}

const PlaylistSectionQuery = () =>  {
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
                    playlist={playlist}
                />
            ))}
        </div>
    )
}
