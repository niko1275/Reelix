"use server"

import { HydrateClient, trpc } from "@/server/server"
import { PlaylistVideoView, PlaylistVideoSidebar } from "@/components/playlist"

interface PlaylistPageProps {
    params: {
        playlistId: string
    }
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
    const { playlistId } = await params;
    await Promise.all([
        trpc.playlist.getPlaylist.prefetch({ id: playlistId }),
    ]);

    return (
        <div className="grid sm:grid-cols-4 gap-4 mx-auto h-full grid-cols-1">
            <div className="col-span-3 mx-10 my-10">
                <HydrateClient>
                    <PlaylistVideoView playlistId={parseInt(playlistId)} />
                </HydrateClient>
            </div>
            <div className="col-span-1 my-10">
                <HydrateClient>
                    <PlaylistVideoSidebar playlistId={parseInt(playlistId)} />
                </HydrateClient>
            </div>
        </div>
    )
} 