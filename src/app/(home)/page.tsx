"use server"
import CategorySection from "@/components/CategoryCarousel";
import { HydrateClient, trpc } from "@/server/server";

export default async function Home() {
    await trpc.category.getAll.prefetch();
    
    return (  
        <main className="container mx-auto py-8">
           
            <HydrateClient>
                <CategorySection />
            </HydrateClient>
        </main>
    )}
