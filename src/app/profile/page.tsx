"use server"


import UserProfile from "@/components/userProfile";
import { HydrateClient, trpc } from "@/server/server";
import { auth } from "@clerk/nextjs/server";

export default async function Profile() {       
    const {userId} = await auth()
   void trpc.user.getProfile.prefetch({ clerkId: userId || "" })

    return (
        <div>           
            <HydrateClient  >
                 <UserProfile />
            </HydrateClient>
        </div>
    )
}