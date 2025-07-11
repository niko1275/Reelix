"use client";

import { Suggestions } from "@/components/suggestions/Suggestions";

interface VideoSidebarProps {
  currentVideoId: string;
}

export function VideoSidebar({ currentVideoId }: VideoSidebarProps) {
  return (
    <div className="w-full lg:w-80 space-y-4">
      <Suggestions id={currentVideoId} />
    </div>
  );
} 