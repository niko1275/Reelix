"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Image } from "../ui/image";
import { Skeleton } from "../ui/skeleton";

import { playlists } from "@/lib/db/schema";
import type { InferModel } from "drizzle-orm";

type Playlist = InferModel<typeof playlists>;

interface PlaylistCardProps {
    playlist: Playlist & {
        user: {
            username: string
        }
        videos: {
            video: {
                id: number
                title: string
                thumbnailUrl: string | null
            }
        }[]
    }
}

export const PlaylistCard = ({
    playlist
}: PlaylistCardProps) => {
    const router = useRouter()

    const handleClick = () => {
        router.push(`/playlists/${playlist.id}`)
    }

    return (
        <Card 
            className="h-full flex flex-col cursor-pointer hover:opacity-75 transition"
            onClick={handleClick}
        >
            <CardHeader className="flex-none p-0">
                <div className="aspect-video relative">
                    {playlist.videos[0]?.video.thumbnailUrl ? (
                        <Image
                            src={playlist.videos[0].video.thumbnailUrl}
                            alt={playlist.videos[0].video.title}
                            fill
                            className="object-cover rounded-t-lg"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 rounded-t-lg" />
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-grow p-4">
                <h3 className="font-semibold line-clamp-2">
                    {playlist.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                    {playlist.user.username}
                </p>
                <p className="text-sm text-muted-foreground">
                    {playlist.videos.length} videos
                </p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(playlist.createdAt, {
                        addSuffix: true,
                        locale: es
                    })}
                </p>
            </CardFooter>
        </Card>
    )
}