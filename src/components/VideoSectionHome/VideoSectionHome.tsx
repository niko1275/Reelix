"use client"
import { trpc } from "@/utils/trpc"
import { JSX, Suspense } from "react";
import { VideoCard } from "@/components/users/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const VideoSkeleton = () => {
    return (
        <div className="flex flex-col space-y-3">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <div className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        </div>
    );
};

export const VideoSectionHome = () => {
    return (
        <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <VideoSkeleton key={i} />
                ))}
            </div>
        }>
            <VideoSectionQuery />
        </Suspense>
    )}

const VideoSectionQuery = (): JSX.Element => {
    const searchParams = useSearchParams();
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = trpc.video.getHomeVideos.useInfiniteQuery(
        {
            limit: 12,
            search,
            category,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    );

    const videos = data?.pages.flatMap((page) => page.items) || [];

    return (
        <div className="space-y-4 mt-10 mx-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((video) => (
                    <Link href={`/videos/${video.muxUploadId}`} key={video.id}>
                        <VideoCard 
                            id={video.id}
                            title={video.title}
                            thumbnailUrl={video.thumbnailUrl}
                            createdAt={video.createdAt}
                        
                            duration={video.duration}
                            views={video.views}
                            publishedAt={video.publishedAt}
                        
                        />
                    </Link>
                ))}
            </div>
            {hasNextPage && (
                <div className="flex justify-center">
                    <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="px-4 py-2 text-sm text-muted-foreground hover:text-primary disabled:opacity-50"
                    >
                        {isFetchingNextPage ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                Cargando más videos...
                            </div>
                        ) : (
                            "Cargar más videos"
                        )}
                    </button>
                </div>
            )}
        </div>
    )}