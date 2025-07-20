"use server"

import ProtectedContent from "@/components/auth/ProtectedContent"
import LikeVideosSection from "@/components/likedVideos/likeVideosSection"
import { HydrateClient, trpc } from "@/server/server"
import { currentUser} from "@clerk/nextjs/server"

export default async function LikedVideos() {
    const user = await currentUser()
    const id = user?.id

    if(!user) {
         return (
            <ProtectedContent
                title="Accede a la sección de Videos que te gustaron"
                description="Inicia sesión para Acceder a la sección de Videos que te gustaron"
                buttonText="Iniciar Sesión"
            />
        )
    }

    void trpc.videoReactions.getLikedVideos.prefetch({
        userId: id || ""
    })

    return (
        <HydrateClient>
            <LikeVideosSection />
        </HydrateClient>
    )
} 