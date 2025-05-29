"use server"
import VideoSection from "@/components/studioVideo/Video-Section";
import { HydrateClient, trpc } from "@/server/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export default async function StudioPage() {
    await trpc.video.getMany.prefetchInfinite({
        limit: 10,
    });
    
    return (
       <HydrateClient>
     
        <Suspense fallback={<div>Loading videos...</div>}>

            <ErrorBoundary fallback={<div>Something went wrong loading your videos</div>}>
                <VideoSection />
            </ErrorBoundary>
        </Suspense>
       
       </HydrateClient>
    )
}