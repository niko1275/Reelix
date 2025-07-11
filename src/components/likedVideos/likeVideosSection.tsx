"use client";

import { useState } from 'react';
import { Search, Heart, Play, Eye, Calendar, Grid, List, VideoIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from "@/utils/trpc"
import { SignInButton, useAuth, UserButton, useUser } from "@clerk/nextjs"
import { SidebarTrigger } from '../ui/sidebar';
import Link from 'next/link';
import Image from 'next/image';

interface Video {
  id: string;
  title: string;
  channel: string;
  thumbnailUrl: string;
  duration: string;
  views: string;
  likes: string;
  likedDate: string;
  category: string;
  uploadDate: string;
  muxUploadId:string;
}


export default function LikeVideosSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { userId } = useAuth();
  const { isSignedIn } = useUser()
  const { isLoaded } = useAuth()

  const { data } = trpc.videoReactions.getLikedVideos.useQuery({
    userId: userId || ""
  });
  console.log('Data videos es '+JSON.stringify(data))

  // Mapear la data real a la estructura de Video
  const realVideos: Video[] = (data?.likedVideos ?? []).map((item) => {
    console.log('Thumbnail URL:', item.videos.thumbnailUrl);
    return {
      id: item.videos.id.toString(),
      title: item.videos.title,
      channel: item.videos.userId ?? "", // Si tienes el nombre del canal, cámbialo aquí
      thumbnailUrl: item.videos.thumbnailUrl || "https://via.placeholder.com/400x200?text=No+Thumbnail",
      duration: item.videos.duration ? item.videos.duration.toString() : "",
      views: item.videos.views?.toString() ?? "0",
      likes: "", // Si tienes likes, cámbialo aquí
      likedDate: item.video_reactions.createdAt,
      category: item.videos.categoryId?.toString() ?? "",
      uploadDate: item.videos.createdAt,
      muxUploadId:item.videos.muxUploadId,
    };
  });

  // Filtros y ordenamiento sobre la data real
  const filteredVideos = realVideos.filter(video => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.channel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      true || video.category === "All"; // Assuming "All" is the default or handled by search
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (true) { // Simplified sort logic
      case new Date(b.likedDate).getTime() - new Date(a.likedDate).getTime() > 0:
        return -1;
      case new Date(b.likedDate).getTime() - new Date(a.likedDate).getTime() < 0:
        return 1;
      default:
        return 0;
    }
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const VideoCard = ({ video }: { video: Video }) => (
    <Link href={`/videos/${video.muxUploadId}`}>
 
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-0 bg-white/80 backdrop-blur-sm">
      <div className="relative overflow-hidden rounded-t-lg h-48">
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          width={400}
          height={200}
          className="object-cover rounded-t-lg w-full h-full"
          unoptimized
          onError={(e) => {
            console.error('Error loading image:', video.thumbnailUrl);
            e.currentTarget.src = "https://via.placeholder.com/400x200?text=Error+Loading+Image";
          }}
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Play className="w-12 h-12 text-white" fill="white" />
        </div>
        <Badge className="absolute bottom-2 right-2 bg-black/80 text-white border-0">
          {video.duration}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {video.title}
        </h3>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{video.views} views</span>
          </div>
          <div className="flex items-center gap-1">
           
            <span>{video.likes}</span>
          </div>
        </div>
      
      </CardContent>
    </Card>
    </Link>
  );

  const VideoListItem = ({ video }: { video: Video }) => (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-md border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative flex-shrink-0 w-32 h-20">
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              width={128}
              height={80}
              className="object-cover rounded-lg w-full h-full"
              unoptimized
              onError={(e) => {
                console.error('Error loading image:', video.thumbnailUrl);
                e.currentTarget.src = "https://via.placeholder.com/128x80?text=Error";
              }}
            />
            <Badge className="absolute bottom-1 right-1 bg-black/80 text-white border-0 text-xs">
              {video.duration}
            </Badge>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {video.title}
            </h3>
          
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{video.views} views</span>
              </div>
              <div className="flex items-center gap-1">

                <span>{video.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Liked {formatDate(video.likedDate)}</span>
              </div>
         
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Nuevo header responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            {/* Logo y sidebar */}
            <div className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto">
              <SidebarTrigger />
              <Image 
                src={'/images/Reelix.png'} 
                alt="Reelix logo"
                width={120}
                height={40}
                className="mx-auto sm:mx-0"
              />
            </div>
            {/* Título y contador */}
            <div className="flex flex-col items-center flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 text-center">Videos Que me gustaron</h1>
                <Badge variant="secondary" className="ml-2">
                  {filteredVideos.length} videos
                </Badge>
              </div>
            </div>
            {/* Botones de usuario */}
            <div className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              {isLoaded && !isSignedIn && (
                <SignInButton mode="modal">
                  <Button variant="ghost">Sign In</Button>
                </SignInButton>
              )}
              {isSignedIn && (
                <UserButton afterSignOutUrl="/">
                  <UserButton.MenuItems>
                    <UserButton.Link
                      href="/studio"
                      label="Studio"
                      labelIcon={<VideoIcon className="h-4 w-4" />}
                    />
                    <UserButton.Link
                      href={`/users/${userId}`}
                      label="Ver tu canal"
                      labelIcon={<VideoIcon className="h-4 w-4" />}
                    />
                  </UserButton.MenuItems>
                </UserButton>
              )}
            </div>
          </div>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No videos found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "space-y-4"
          }>
            {filteredVideos.map(video => (
              viewMode === 'grid' 
                ? <VideoCard key={video.id} video={video} />
                : <VideoListItem key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>


     
    </div>
  );
}