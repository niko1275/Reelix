"use client";

import PlaylistSection from "@/components/playlist/PlaylistSection"
import ProtectedContent from "@/components/auth/ProtectedContent"
import { trpc } from "@/utils/trpc";

export function PlaylistContent() {
    const { data: playlists, isLoading, error } = trpc.playlist.getUserPlaylistsWithFirstVideo.useQuery();
    console.log("error", error?.data?.code)
    if (error?.data?.code === 'UNAUTHORIZED') {
        return (
            <ProtectedContent 
                title="Accede a tus Playlistss"
                description="Inicia sesión para ver y gestionar tus playlists personalizadas"
                buttonText="Iniciar Sesión"
            />
        )
    }

    if (isLoading) {
        return <div>Cargando...</div>
    }

    return <PlaylistSection/>;
} 