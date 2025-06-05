import { VideoCard } from "@/components/users/VideoCard";
import { cn } from "@/lib/utils";
import { userGetOneUserOutput } from "@/modules/videos/types";
import Link from "next/link";

interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration: string;
  views: string;
  publishedAt: string;
}

interface VideoGridProps {
  videos: userGetOneUserOutput;
  className?: string;
}


export function VideoGrid({ videos, className }: VideoGridProps) {
  return (
    <div className={cn("p-6", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map((video) => (
            <Link href={`/videos/${video.muxUploadId}`}>
          <VideoCard
            key={video.id}
            id={video.id}
            title={video.title}
            thumbnailUrl={video.thumbnailUrl}
            duration={video.duration}
            views={video.views}
            publishedAt={video.publishedAt}
            createdAt={video.createdAt}
          />
          </Link>
        ))}
      </div>
    </div>
  );
}