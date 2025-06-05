"use client"

import { trpc } from "@/utils/trpc"
import { Suspense } from "react"
import { VideoRowCard } from "./VideoRowCard"
import { Skeleton } from "../ui/skeleton"
import { useAuth } from "@clerk/nextjs"

interface SuggestionsProps {
    id: string;
}

export function Suggestions({ id }: SuggestionsProps) {
    const { isSignedIn } = useAuth();

    if (!isSignedIn) {
        return (
            <div className="text-center text-muted-foreground py-4">
                Inicia sesión para ver las sugerencias
            </div>
        )
    }

    return (
        <Suspense fallback={<SuggestionsSkeleton />}>
            <SuggestionsContent id={id} />
        </Suspense>
    )
}

function SuggestionsSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-2">
                    <Skeleton className="h-20 w-36" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    )
}

function SuggestionsContent({ id }: SuggestionsProps) {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = trpc.video.getVideoSuggestions.useInfiniteQuery(
        {
            id,
            limit: 10,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    )

    if (!data?.pages[0]?.items.length) {
        return (
            <div className="text-center text-muted-foreground py-4">
                No hay sugerencias disponibles
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {data.pages.map((page) =>
                page.items.map((video) => (
                    <VideoRowCard key={video.id} video={video} />
                ))
            )}
            {hasNextPage && (
                <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    {isFetchingNextPage ? "Cargando..." : "Ver más"}
                </button>
            )}
        </div>
    )
}