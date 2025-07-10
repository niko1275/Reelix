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

 

    return (
        <div className="space-y-6">
            <div className="space-y-4">
              
              
            </div>
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Sugerencias</h2>
                <Suggestions id={videoId}/>
            </div>
        </div>
    );
} 