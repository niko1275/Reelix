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
           <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3 w-[70%]">
              <Skeleton className="h-5 w-4/5 md:w-2/6"/>
              <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-3/5 md:w-1/5"/>
              <Skeleton className="h-5 w-3/5 md:w-1/5"/>
              </div>
              </div>
              <Skeleton className="h-5 w-2/6 md:1/6 rounded-full"/>
           </div>
           <div className="h-[120px] w-full">

           </div>
         </div>
    )
}

export const VideoTopRow = ({video}: VideoTopRowProps) => {

 console.log("Videone top row",video)

return (
    <div className="flex flex-col gap-4 mt-4">
       <h1 className="text-2xl font-bold">
        {video?.title || "Untitled Video"}
       </h1>
       <div className="flex flex-col  sm:flex-row sm:items-start sm:justify-between ">
        <VideoOwner    video={video}/>
        <VideoReactions video={video}/>
       </div>
    </div>
)
}

