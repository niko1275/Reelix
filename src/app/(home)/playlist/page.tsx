import { HydrateClient, trpc } from "@/server/server"
import PlaylistSection from "@/components/playlist/PlaylistSection"
export default function PlaylistPage() {
    void trpc.playlist.getUserPlaylistsWithFirstVideo.prefetch();
    return (
        <HydrateClient>
            < PlaylistSection/>
        </HydrateClient>
    )}