"use client"
import { trpc } from "@/utils/trpc"
import { useUser } from "@clerk/nextjs"
import { Suspense } from "react"

function ProfileContent() {
    const { user } = useUser()
    const [data] = trpc.user.getProfile.useSuspenseQuery({clerkId: user?.id || ""})
    
    return (
        <div>
            <h1>User Profile</h1>
            <p>{data?.name}</p>
        </div>
    )
}

export default function UserProfile() {
    return (
        <Suspense fallback={<div>Loading profile...</div>}>
            <ProfileContent />
        </Suspense>
    )
}

