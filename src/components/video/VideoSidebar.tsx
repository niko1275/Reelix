"use client"

import { Suggestions } from "@/components/suggestions/Suggestions"
import PlaylistSection from "@/components/playlist/PlaylistSection"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@clerk/nextjs"

interface VideoSidebarProps {
    videoId: string;
}

export function VideoSidebar({ videoId }: VideoSidebarProps) {
    const [isPlaylistExpanded, setIsPlaylistExpanded] = useState(true);
    const { isSignedIn } = useAuth();

    if (!isSignedIn) {
        return (
            <div className="space-y-6">
                <div className="text-center text-muted-foreground py-4">
                    Inicia sesión para ver tus playlists y sugerencias
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Tus Playlists</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsPlaylistExpanded(!isPlaylistExpanded)}
                        className="h-8 w-8 p-0"
                    >
                        {isPlaylistExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                <div className="transition-all duration-300">
                    <PlaylistSection isExpanded={isPlaylistExpanded} />
                </div>
            </div>
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Sugerencias</h2>
                <Suggestions id={videoId}/>
            </div>
        </div>
    );
} 