import UserView from "@/components/users/user-view"
import { HydrateClient, trpc } from "@/server/server"

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