"use client";

import { trpc } from "@/utils/trpc";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Play, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Image } from "@/components/ui/image";

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
  const router = useRouter();

  const { data, isLoading } = trpc.watchHistory.getAll.useQuery();

  const handleVideoClick = (video: Video) => {
    if (video.muxUploadId) {
      router.push(`/videos/${video.muxUploadId}`);
    }
  };

  const videos = data || [];

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!videos.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">No hay historial</h2>
          <p className="text-muted-foreground">
            Los videos que veas aparecerán aquí
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Historial</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((item: WatchHistoryItem) => (
          <Card
            key={item.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleVideoClick(item.video)}
          >
            <CardHeader className="p-0">
              <div className="aspect-video relative">
                <Image
                  src={item.video.thumbnailUrl || ""}
                  alt={item.video.title || ""}
                  fill
                  className="object-cover rounded-t-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <Play className="h-12 w-12 text-white opacity-0 hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <h3 className="font-semibold line-clamp-2 mb-2">{item.video.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {item.video.user?.name || "Usuario"}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {item.watchedAt && formatDistanceToNow(new Date(item.watchedAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {item.video.duration ? `${Math.floor(item.video.duration / 60)}:${(item.video.duration % 60).toString().padStart(2, '0')}` : "0:00"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};