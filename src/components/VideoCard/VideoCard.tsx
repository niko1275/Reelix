"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { MoreVertical, Plus } from "lucide-react";
import Link from "next/link";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,

} from "@/components/ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Avatar } from "../ui/avatar";
import { UserAvatar } from "../user-avatar/user-avatar";


export interface VideoWithUserAndStats {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  views: number;
  isPublished: boolean;
  userId: string;
  muxAssetId: string;
  muxStatus: string;
  muxUploadId: string;
  categoryId: number;
  createdAt: string; // o Date si ya lo parseas
  updatedAt: string; // o Date
  playbackId: string;
  visibility: 'public' | 'private' | 'unlisted';

  user: {
    id: number;
    name: string;
    email: string;
    clerkId: string;
    imageUrl: string;
    createdAt: string;
    updatedAt: string;
    bannerUrl: string;
    bannerKey: string;
    subscribersCount: number;
    isSubscribed: boolean;
  };

  stats: {
    views: number;
    likes: number;
    dislikes: number;
    userReaction: 'like' | 'dislike' | null;
  };
}
export function VideoCard({video}: {video: VideoWithUserAndStats}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const utils = trpc.useUtils();
  const { data: playlists } = trpc.playlist.getUserPlaylists.useQuery();
  console.log("🧪 playlists:", JSON.stringify(playlists, null, 2))
  const resetCreatePlaylistForm = useCallback(() => {
      setNewPlaylistName("");
      setNewPlaylistDescription("");
      setIsPublic(true);
  }, []);

  const createPlaylist = trpc.playlist.createPlaylist.useMutation({
      onSuccess: () => {
          toast.success("Playlist creada exitosamente");
          utils.playlist.getUserPlaylists.invalidate();
          setIsCreatePlaylistOpen(false);
          resetCreatePlaylistForm();
      },
      onError: (error) => {
          toast.error(error.message);
      }
  });

  const addToPlaylist = trpc.playlist.addVideo.useMutation({
      onSuccess: () => {
          toast.success("Video agregado a la playlist");
          utils.playlist.getUserPlaylists.invalidate();
          setIsOpen(false);
      },
      onError: (error) => {
          toast.error(error.message);
      }
  });

  const handleCreatePlaylist = () => {
      if (!newPlaylistName.trim()) {
          toast.error("El nombre de la playlist es requerido");
          return;
      }

      createPlaylist.mutate({
          name: newPlaylistName,
          description: newPlaylistDescription,
          isPublic,
      });
  };

  const handleAddToPlaylist = (playlistId: number) => {
      addToPlaylist.mutate({
          playlistId,
          videoId: video.id
      });
  };

  const handleCreatePlaylistClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsCreatePlaylistOpen(true);
      setIsOpen(false);
  };

  const handleCloseCreatePlaylist = () => {
      setIsCreatePlaylistOpen(false);
      resetCreatePlaylistForm();
  };
  
  return (
    <div className="group cursor-pointer relative">
      {/* Todo el contenido clickeable está dentro del Link */}
      <Link href={`/videos/${video.muxUploadId}`}>
        <div>
          {/* Imagen del video */}
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
  
          {/* Título y stats */}
          <div className="mt-2 space-y-1">
            {/* Título + botón de opciones al lado */}
            <div className="flex items-start justify-between">
              <div className="flex gap-2">

               <UserAvatar imageUrl={video.user.imageUrl} name={video.user.name} />
              
               <h3 className="font-medium line-clamp-2 text-lg">{video.title}</h3>
              </div>
              
             
              {/* Botón fuera del Link pero dentro del layout visual */}
              <div onClick={(e) => e.preventDefault()}>
                <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="p-1 hover:bg-gray-100 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault(); // Evita navegación al presionar
                        setIsOpen(true);
                      }}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-40">
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Agregar a playlist</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {playlists?.map((playlist) => (
                          <DropdownMenuItem
                            key={playlist.id}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddToPlaylist(playlist.id);
                            }}
                          >
                            {playlist.name}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleCreatePlaylistClick}>
                          <Plus className="w-4 h-4 mr-2" />
                          Crear nueva playlist
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Dialog open={isCreatePlaylistOpen} onOpenChange={handleCloseCreatePlaylist}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crear nueva playlist</DialogTitle>
                        <DialogDescription>
                            Crea una nueva playlist para organizar tus videos favoritos.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input
                                id="name"
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                placeholder="Mi playlist"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción (opcional)</Label>
                            <Textarea
                                id="description"
                                value={newPlaylistDescription}
                                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                                placeholder="Describe tu playlist..."
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="public">Playlist pública</Label>
                            <Switch
                                id="public"
                                checked={isPublic}
                                onCheckedChange={setIsPublic}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleCloseCreatePlaylist}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreatePlaylist}
                            disabled={createPlaylist.isPending}
                        >
                            {createPlaylist.isPending ? "Creando..." : "Crear playlist"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
              </div>
            </div>

            
  
            {/* Stats */}
            <div className="flex text-xs text-muted-foreground ml-11">
              <span>{video.stats.views} views</span>
              <span className="mx-1">•</span>
              <span>
                {formatDistanceToNow(new Date(video.createdAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )}