"use client"
import { trpc } from "@/utils/trpc"
import { Suspense } from "react";
import PlaylistCard from "./PlaylistCard";
import { cn } from "@/lib/utils";

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
    const [data] = trpc.playlist.getUserPlaylistsWithFirstVideo.useSuspenseQuery();

    if (!data.length) {
        return (
            <div className="text-center text-muted-foreground py-4">
                No tienes playlists creadas
            </div>
        );
    }

    return(
        <div className={cn(
            "grid gap-4 transition-all duration-300",
            isExpanded ? "grid-cols-1" : "grid-cols-1 max-h-[200px] overflow-hidden"
        )}>
            {data.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
        </div>
    )
}
