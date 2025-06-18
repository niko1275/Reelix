import { videoGetByOne, videoGetOneOutput } from "@/modules/videos/types"
import VideoOwner from "./video-owner"
import { VideoReactions } from "./video-reactions"
import { Skeleton } from "../ui/skeleton"

interface VideoTopRowProps {
    video: videoGetByOne
}


export const VideoTopRowSkeleton = () => {
    return (
        <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-4">
                <Skeleton className="h-6 w-4/5 md:w-2/5"/>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Skeleton className="h-10 w-10 rounded-full"/>
                    <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-32"/>
                        <Skeleton className="h-3 w-24"/>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-24 rounded-full"/>
                    <Skeleton className="h-8 w-24 rounded-full"/>
                </div>
            </div>
        </div>
    )
}

export const VideoTopRow = ({video}: VideoTopRowProps) => {
    return (
        <div className="flex flex-col gap-4 mt-4">
            <h1 className="text-xl md:text-2xl font-bold line-clamp-2">
                {video?.title || "Untitled Video"}
            </h1>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <VideoOwner video={video}/>
                <div className="flex-shrink-0">
                    <VideoReactions video={video}/>
                </div>
            </div>
        </div>
    )
}

