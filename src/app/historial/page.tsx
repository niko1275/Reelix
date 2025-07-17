"use client";

import { trpc } from "@/utils/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Play, Clock, Trash2, Calendar } from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SignInButton, useAuth, UserButton, useUser } from "@clerk/nextjs";

import ProtectedContent from "@/components/auth/ProtectedContent";

interface Video {
  id: number;
  title: string;
  thumbnailUrl: string;
  duration: number;
  userId: string;
  muxUploadId?: string;
  user?: {
    name: string;
  };
}

interface WatchHistoryItem {
  id: number;
  userId: string;
  videoId: number;
  watchedAt: string;
  watchDuration: number;
  progress: number;
  completed: boolean;
  lastPosition: number;
  video: Video;
}

export default function HistorialPage() {
  return <HistorialContent />;
}

const HistorialContent = () => {
 
  const [isClearing, setIsClearing] = useState(false);
  const { isSignedIn } = useUser();
  const { isLoaded } = useAuth();

  const { data, isLoading, refetch,error } = trpc.watchHistory.getAll.useQuery();
  const clearHistoryMutation = trpc.watchHistory.clearHistory.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleClearHistory = async () => {
    if (confirm("¿Estás seguro de que quieres limpiar todo el historial?")) {
      setIsClearing(true);
      try {
        await clearHistoryMutation.mutateAsync();
      } catch (error) {
        console.error("Error clearing history:", error);
      } finally {
        setIsClearing(false);
      }
    }
  };

  const videos = data || [];
  console.log('error '+JSON.stringify(error))

   if (error?.data?.code === 'NOT_FOUND') {
          return (
              <ProtectedContent 
                  title="Accede a tu Historial de videos"
                  description="Inicia sesión para ver y gestionar tu historial de videos."
                  buttonText="Iniciar Sesión"
              />
          )
      }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4 animate-spin" />
          <p className="text-muted-foreground">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Clock className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">No hay historial</h2>
            <p className="text-gray-500">Los videos que veas aparecerán aquí</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const VideoCard = ({ item }: { item: WatchHistoryItem }) => (
    <Link href={`/videos/${item.video.muxUploadId}`}>
      <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-0 bg-white/80 backdrop-blur-sm">
        <div className="relative overflow-hidden rounded-t-lg h-48">
          <Image
            src={item.video.thumbnailUrl || "https://via.placeholder.com/400x200?text=No+Thumbnail"}
            alt={item.video.title}
            width={400}
            height={200}
            className="object-cover rounded-t-lg w-full h-full"
            unoptimized
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/400x200?text=Error+Loading+Image";
            }}
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Play className="w-12 h-12 text-white" fill="white" />
          </div>
          <Badge className="absolute bottom-2 right-2 bg-black/80 text-white border-0">
            {formatDuration(item.video.duration)}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {item.video.title}
          </h3>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>
                {formatDistanceToNow(new Date(item.watchedAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {item.video.user?.name || "Usuario"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className=" ">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearHistory}
                disabled={isClearing}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isClearing ? "Limpiando..." : "Limpiar Historial"}
              </Button>
              {isLoaded && !isSignedIn && (
                <SignInButton mode="modal">
                  <Button variant="ghost">Sign In</Button>
                </SignInButton>
              )}
              {isSignedIn && (
                <UserButton afterSignOutUrl="/" />
              )}
            </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((item: WatchHistoryItem) => (
            <VideoCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};