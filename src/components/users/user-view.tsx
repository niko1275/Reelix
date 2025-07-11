"use client"
import { trpc } from "@/utils/trpc"
import { Suspense } from "react"
import { ChannelBanner } from "./ChannelBanner"
import { ChannelInfo } from "./ChannelInfo"
import { ChanelNavigation } from "./ChanelNavigation"
import { VideoGrid } from "./VideoGrid"

interface UserViewQueryProps {
    clerkId: string
}

export default function UserView({clerkId}: UserViewQueryProps) {
    return(
        <Suspense fallback={<div>Loading...</div>}>
            <UserViewQuery clerkId={clerkId} />
        </Suspense>
    )
}



const  UserViewQuery =({clerkId}: UserViewQueryProps)=> {
    const data = trpc.user.getOneUser.useSuspenseQuery({clerkId})
    
 
return(
    <div className="min-h-screen flex flex-col">
     
      
      <main className="flex-1">
        <ChannelBanner bannerUrl="https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg" />
       
       
        <div className="max-w-screen-2xl mx-auto">
          <ChannelInfo
            name={data[0].user.name}
            subscribers={data[0].subscriberCount.toString()}
            avatarUrl={data[0].user.imageUrl}
            userId={data[0].user.clerkId}
            description=""
            joinDate={new Date(data[0].user.createdAt).toISOString()}
            totalViews="0"
          />
          
          <ChanelNavigation tabs={[{name: "Videos", isActive: true}]} />
          <VideoGrid videos={data[0].videosUser.map(video => ({
            ...video,
            publishedAt: video.createdAt
          }))} />
        </div>
      </main>
    </div>
)
}