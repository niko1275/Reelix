"use client"

import { trpc } from "@/utils/trpc"
import { useAuth } from "@clerk/nextjs"
import { Suspense } from "react"

export default function LikeVideosSection() {
   
return (
    <Suspense fallback={<div>Loading...</div>}>
        <GetLikedVideos />
    </Suspense>
)
}

const GetLikedVideos = () =>{
    const { userId } = useAuth()
    const [data] =  trpc.videoReactions.getLikedVideos.useSuspenseQuery({
        userId: userId || ""
    })

    console.log("data", data.likedVideos)
    return (
        <div>
            <h1>Liked Videos</h1>
            {data.likedVideos.map((video) => (
                <div key={video.id}>
                    <h2>{video.videos.title}</h2>
                </div>
            ))}

            <div>
                Videos
            </div>
        </div>
    )
}
