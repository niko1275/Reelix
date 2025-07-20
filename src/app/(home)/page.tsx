"use server"
import CategorySection from "@/components/CategoryCarousel";
import { VideoSectionHome } from "@/components/VideoSectionHome/VideoSectionHome";
import { HydrateClient, trpc } from "@/server/server";

export default async function Home() {


    await Promise.all([
         trpc.category.getAll.prefetch(),
        trpc.video.getHomeVideos.prefetchInfinite({
            limit: 10,
            cursor: null,
        })
    ]);
    return (  
        <main className="w-[100%] h-screen ">
           
            <HydrateClient>
                <CategorySection />
                <VideoSectionHome />
            </HydrateClient>
        </main>
    )}
