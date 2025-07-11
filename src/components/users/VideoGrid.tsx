import { VideoCard } from "./VideoCard";
import { cn } from "@/lib/utils";

interface Video {
  id: number;
  title: string;
  thumbnailUrl: string;
  duration: number;
  views: number;
  publishedAt: string;
  createdAt: string;
}

interface VideoGridProps {
  videos: Video[];
  className?: string;
}

export function VideoGrid({ videos, className }: VideoGridProps) {
  return (
    <div className={cn("p-6", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map((video: Video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}