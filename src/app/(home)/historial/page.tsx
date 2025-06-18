"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type HistoryItem = {
  id: number;
  userId: string;
  videoId: number;
  watchedAt: Date;
  progress: number;
  watchDuration: number;
  lastPosition: number;
  completed: boolean;
  video: {
    id: number;
    title: string;
    thumbnailUrl: string;
    duration: number;
    userId: string;
    user: {
      username: string;
      imageUrl: string;
    };
  };
};

export default function HistoryPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  const { data: history, isLoading } = trpc.watchHistory.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 segundos
  });

  const { mutate: deleteHistory } = trpc.watchHistory.delete.useMutation({
    onSuccess: () => {
      setSelectedItems([]);
    },
  });

  const filteredHistory = selectedDate
    ? history?.filter(
        (item) =>
          format(new Date(item.watchedAt), "yyyy-MM-dd") ===
          format(selectedDate, "yyyy-MM-dd")
      )
    : history;

  const handleSelectAll = () => {
    if (selectedItems.length === (filteredHistory?.length ?? 0)) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredHistory?.map((item) => item.id) ?? []);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length > 0) {
      deleteHistory({ ids: selectedItems.map(id => id.toString()) });
    }
  };

  const handleDeleteAll = () => {
    if (filteredHistory) {
      deleteHistory({ ids: filteredHistory.map((item) => item.id.toString()) });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Historial de reproducción</h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-card rounded-lg border animate-pulse">
              <div className="w-48 h-27 bg-muted rounded-md" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Historial de reproducción</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay videos en tu historial de reproducción</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Historial de reproducción</h1>
        <div className="flex gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "PPP", { locale: es })
                ) : (
                  <span>Filtrar por fecha</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="destructive"
            onClick={handleDeleteAll}
            disabled={!filteredHistory?.length}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar todo
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <Checkbox
            checked={
              (filteredHistory?.length ?? 0) > 0 &&
              selectedItems.length === (filteredHistory?.length ?? 0)
            }
            onCheckedChange={handleSelectAll}
          />
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
            disabled={selectedItems.length === 0}
          >
            Eliminar seleccionados
          </Button>
        </div>

        <div className="grid gap-4">
          {filteredHistory?.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 bg-card rounded-lg border"
            >
              <Checkbox
                checked={selectedItems.includes(item.id)}
                onCheckedChange={(checked: boolean) => {
                  if (checked) {
                    setSelectedItems([...selectedItems, item.id]);
                  } else {
                    setSelectedItems(selectedItems.filter((id) => id !== item.id));
                  }
                }}
              />
              <Link
                href={`/videos/${item.videoId}`}
                className="flex-1 flex items-center gap-4"
              >
                <div className="relative w-48 h-27">
                  <Image
                    src={item.video.thumbnailUrl}
                    alt={item.video.title}
                    fill
                    className="object-cover rounded-md"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${(item.progress / item.video.duration) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.video.title}</h3>
                  <p className="text-sm text-muted-foreground">
                 
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Visto el {format(new Date(item.watchedAt), "PPP", { locale: es })}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 