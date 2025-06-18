import { HydrateClient } from "@/server/server";
import { PlaylistContent } from "@/components/playlist/PlaylistContent";

export default function PlaylistPage() {
    return (
        <HydrateClient>
            <PlaylistContent />
        </HydrateClient>
    );
}