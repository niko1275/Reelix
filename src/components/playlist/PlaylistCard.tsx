"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Image } from "../ui/image";

interface PlaylistCardProps {
    playlist: {
        id: number;
        name: string;
        description: string | null;
        createdAt: string;
        updatedAt: string;
        userId: string;
        isPublic: boolean;
        user: {
            id: number;
            name: string;
            email: string;
            clerkId: string;
            imageUrl: string;
            createdAt: string;
            updatedAt: string;
            bannerUrl: string | null;
            bannerKey: string | null;
        };
        firstVideo?: {
            id: number;
            title: string;
            thumbnailUrl: string | null;
            description: string | null;
            videoUrl: string | null;
            isPublished: boolean;
            createdAt: string;
            updatedAt: string;
            userId: string;
            categoryId: number | null;
            visibility: string;
            duration: number | null;
            playbackId: string | null;
            muxAssetId: string | null;
            muxUploadId: string | null;
            muxStatus: string | null;
        } | null;
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
                    {playlist.firstVideo?.thumbnailUrl ? (
                        <Image
                            src={playlist.firstVideo.thumbnailUrl}
                            alt={playlist.firstVideo.title}
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
                    {playlist.user.name}
                </p>
                <p className="text-sm text-muted-foreground">
                    {playlist.firstVideo ? "1 video" : "0 videos"}
                </p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(playlist.createdAt), {
                        addSuffix: true,
                        locale: es
                    })}
                </p>
            </CardFooter>
        </Card>
    )
}