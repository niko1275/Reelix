import UserView from "@/components/users/user-view"
import { HydrateClient, trpc } from "@/server/server"
import { auth } from "@clerk/nextjs/server";

interface UserPageProps {
    params: {
      clerkId: string
    }
  }
export default async  function  UserPage({
    params,
  }: {
    params: Promise<{ userId: string }>
  }) {
    const clerkid = (await params).userId
    void trpc.user.getOneUser.prefetch({ clerkId: clerkid ?? "" })
   
    return (
        <HydrateClient>
            <UserView clerkId={clerkid ?? ""} />
        </HydrateClient>
    )
}