"use client"
import Image from "next/image";
import { CheckCircle, ThumbsUp, ShareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

interface ChannelInfoProps {
  name: string;
  subscribers: string;
  avatarUrl: string;
  description: string;
  joinDate: string;
  totalViews: string;
  className?: string;
  userId: string;
}

export function ChannelInfo({
  name,
  userId,
  subscribers,
  avatarUrl,
  description,
  joinDate,
  totalViews,
  className,
}: ChannelInfoProps) {

  const { user } = useUser();
  const isOwner = user?.id === userId;
  return (
    <div className={cn("flex flex-col md:flex-row gap-6 p-6", className)}>
      <div className="relative flex-shrink-0">
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden relative">
          <Image
            src={avatarUrl}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
      </div>
      
      <div className="flex-1">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{name}</h1>
          
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
         
            <span className="hidden sm:block">•</span>
            <span>{subscribers} subscribers</span>
            <span className="hidden sm:block">•</span>
            <span>{totalViews} views</span>
          </div>
          
          <p className="mt-2 text-sm text-muted-foreground line-clamp-1">{description}</p>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-muted-foreground mt-1">
            <span>{joinDate}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-start gap-2 mt-2 md:mt-0">
       
    
      {isOwner ? (
        <Link href="/studio">
        <Button className="bg-red-600 hover:bg-red-700 text-white">
          Edit Channel
        </Button>
        </Link>
        
      ) : (
        <Button className="bg-red-600 hover:bg-red-700 text-white">
          Subscribe
        </Button>
      )}
        
       
        
        <Button variant="outline" size="icon">
          <ThumbsUp className="h-4 w-4" />
        </Button>
        
        <Button variant="outline" size="icon">
          <ShareIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}