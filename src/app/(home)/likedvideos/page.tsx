"use server"

import LikeVideosSection from "@/components/likedVideos/likeVideosSection"
import { HydrateClient, trpc } from "@/server/server"
import { currentUser} from "@clerk/nextjs/server"

export default async function LikedVideos() {
    const user = await currentUser()
    const id = user?.id
    void trpc.videoReactions.getLikedVideos.prefetch({
        userId: id || ""
    })

    return (
        <HydrateClient>
            <LikeVideosSection />
        </HydrateClient>
    )
}
