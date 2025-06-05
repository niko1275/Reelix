"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface VideoCardProps {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration: string;
  views: string;
  publishedAt: string;
  className?: string;
  createdAt: Date;
}

export function VideoCard({
  id,
  title,
  thumbnailUrl,
  duration,
  views,
  publishedAt,
  createdAt,  
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
          src={thumbnailUrl}
          alt={title}
          fill
          className={cn(
            "object-cover transition-transform duration-300",
            isHovered ? "scale-105" : "scale-100"
          )}
        />
        <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 text-xs text-white rounded">
          {duration} Segundos
        </div>
      </div>
      
      <div className="mt-2">
        <h3 className="font-medium line-clamp-2 text-sm">{title}</h3>
        <div className="mt-1 flex text-xs text-muted-foreground">
          <span>{views} views</span>
          <span className="mx-1">•</span>
          <span>{publishedAt}</span>
          <span>
                    {formatDistanceToNow(new Date(createdAt), {
                        addSuffix: true,
                        locale: es,
                    })}
                </span>
        </div>
      </div>
    </div>
  );
}