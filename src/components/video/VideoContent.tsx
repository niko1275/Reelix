"use client";

import { VideoView } from "@/components/view/video-view";
import { VideoSidebar } from "@/components/video/VideoSidebar";

interface VideoContentProps {
    videoId: string;
}

export function VideoContent({ videoId }: VideoContentProps) {
    return (
        <div className="flex 2xl:flex-row  flex-col mx-auto h-full">
            <div className=" xl:mx-10 my-10">
                <VideoView videoId={videoId}/>
            </div>
            <div className="  my-10">
                <VideoSidebar currentVideoId={videoId} />
            </div>
        </div>
    );
} 