import Link from "next/link"
import VideoThumbnail from "../studio/VideoThumnail"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export interface User {
  id: number;
  clerkId: string;
  name: string;
  email: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  bannerUrl: string | null;
  bannerKey: string | null;
  subscribersCount: number;
}

export interface Video {
  id: number;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  views: number;
  isPublished: boolean;
  userId: string;
  muxAssetId: string;
  muxStatus: string;
  muxUploadId: string;
  categoryId: number | null;
  createdAt: string;
  updatedAt: string;
  playbackId: string | null;
  visibility: string;
  user: User | null;
}

interface VideoRowCardProps {
    video: Video & {
        user: User & {
            subscribersCount: number;
        };
    };
}

export function VideoRowCard({ video }: VideoRowCardProps) {
    return (
        <div className="w-full flex flex-row gap-x-3">
            <div className="w-2/4">
                <Link href={`/videos/${video.muxUploadId}`} className="">
                    <VideoThumbnail imageUrl={video.thumbnailUrl || ""} className=""/>
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