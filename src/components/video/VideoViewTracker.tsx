"use client";

import { useEffect, useRef } from "react";
import { trpc } from "@/utils/trpc";
import { useAuth } from "@clerk/nextjs";

interface VideoViewTrackerProps {
  videoId: number;
}

export function VideoViewTracker({ videoId }: VideoViewTrackerProps) {
  const { userId } = useAuth();
  const updateInterval = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTime = useRef<number>(0);
  const lastProgress = useRef<number>(0);

  const { mutate: updateWatchHistory } = trpc.watchHistory.update.useMutation();

  useEffect(() => {
    if (!userId) return;

    const video = document.querySelector('video');
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentTime = Math.floor(video.currentTime);
      const duration = video.duration;
      const progress = Math.floor((currentTime / duration) * 100);

      // Solo actualizar si:
      // 1. Ha pasado al menos 5 segundos desde la última actualización
      // 2. El progreso ha cambiado al menos 5%
      const now = Date.now();
      if (now - lastUpdateTime.current >= 5000 && Math.abs(progress - lastProgress.current) >= 5) {
        updateWatchHistory({
          videoId: videoId.toString(),
          userId,
          progress: Math.min(progress, 100),
          watchDuration: currentTime,
          lastPosition: currentTime,
          completed: progress >= 90
        });
        lastUpdateTime.current = now;
        lastProgress.current = progress;
      }
    };

    const handlePlay = () => {
      // Actualizar cada 10 segundos en lugar de 5
      updateInterval.current = setInterval(handleTimeUpdate, 10000);
    };

    const handlePause = () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
        updateInterval.current = null;
      }
      // Actualizar una última vez al pausar
      handleTimeUpdate();
    };

    const handleEnded = () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
        updateInterval.current = null;
      }
      // Actualizar una última vez al terminar
      handleTimeUpdate();
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
    };
  }, [videoId, userId, updateWatchHistory]);

  return null;
} 