"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Video {
  id: number;
  title: string;
  thumbnailUrl: string;
  duration: number;
  views: number;
  publishedAt: string;
  createdAt: string;
}

interface VideoCardProps {
  video: Video;
  className?: string;
}

export function VideoCard({
  video,
  className,
}: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={cn("group cursor-pointer", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-video overflow-hidden rounded-lg">
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          fill
          className={cn(
            "object-cover transition-transform duration-300",
            isHovered ? "scale-105" : "scale-100"
          )}
        />
        <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 text-xs text-white rounded">
          {video.duration} Segundos
        </div>
      </div>
      
      <div className="mt-2">
        <h3 className="font-medium line-clamp-2 text-sm">{video.title}</h3>
        <div className="mt-1 flex text-xs text-muted-foreground">
          <span>{video.views} views</span>
          <span className="mx-1">•</span>
          <span>{video.publishedAt}</span>
          <span>
                    {formatDistanceToNow(new Date(video.createdAt), {
                        addSuffix: true,
                        locale: es,
                    })}
                </span>
        </div>
      </div>
    </div>
  );
}