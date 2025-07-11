"use client";

import { VideoView } from "@/components/view/video-view";
import { VideoSidebar } from "@/components/video/VideoSidebar";

interface VideoContentProps {
    videoId: string;
}

export function VideoContent({ videoId }: VideoContentProps) {
    return (
        <div className="grid sm:grid-cols-4 gap-4 mx-auto h-full grid-cols-1">
            <div className="col-span-3 mx-10 my-10">
                <VideoView videoId={videoId}/>
            </div>
            <div className="col-span-1 my-10">
                <VideoSidebar currentVideoId={videoId} />
            </div>
        </div>
    );
} 