import Link from "next/link"
import VideoThumbnail from "../studio/VideoThumnail"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface VideoRowCardProps {
    video: {
        id: string;
        title: string;
        thumbnailUrl: string;
        createdAt: string;
        user: {
            name: string;
            imageUrl: string;
        };
    };
}

export function VideoRowCard({ video }: VideoRowCardProps) {
    return (
        <div className="w-full flex flex-row gap-x-3">
            <div className="w-2/4">
                <Link href={`/videos/${video.id}`} className="">
                    <VideoThumbnail imageUrl={video.thumbnailUrl} className=""/>
                </Link>
            </div>
            <div className="w-2/4 flex flex-col gap-y-1">
                <Link href={`/videos/${video.id}`} className="line-clamp-2 text-sm font-medium">
                    {video.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                    {video.user.name}
                </p>
                <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(video.createdAt), {
                        addSuffix: true,
                        locale: es,
                    })}
                </p>
            </div>
        </div>
    )
}