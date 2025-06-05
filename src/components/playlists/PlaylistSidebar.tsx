"use client"

import { trpc } from "@/utils/trpc";
import { Suspense } from "react";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

interface PlaylistSidebarProps {
    currentVideoId: string;
}

export function PlaylistSidebar({ currentVideoId }: PlaylistSidebarProps) {
    return (
        <Suspense fallback={<PlaylistSidebarSkeleton />}>
            <PlaylistSidebarContent currentVideoId={currentVideoId} />
        </Suspense>
    );
}

function PlaylistSidebarSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-2">
                        <Skeleton className="h-20 w-36" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PlaylistSidebarContent({ currentVideoId }: PlaylistSidebarProps) {
    const { data: playlists } = trpc.playlist.getUserPlaylists.useQuery();

    if (!playlists?.length) {
        return (
            <div className="text-center text-muted-foreground py-4">
                No tienes playlists creadas
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Tus Playlists</h2>
            <div className="space-y-4">
                {playlists.map((playlist) => (
                    <Link 
                        key={playlist.id} 
                        href={`/playlists/${playlist.id}`}
                        className="block"
                    >
                        <Card className="hover:bg-accent transition-colors">
                            <CardContent className="p-4">
                                <div className="flex flex-col gap-2">
                                    <h3 className="font-medium line-clamp-1">
                                        {playlist.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {playlist.description || "Sin descripción"}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>
                                            {formatDistanceToNow(new Date(playlist.updatedAt), {
                                                addSuffix: true,
                                                locale: es,
                                            })}
                                        </span>
                                        <span>•</span>
                                        <span>
                                            {playlist.isPublic ? "Pública" : "Privada"}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
} 