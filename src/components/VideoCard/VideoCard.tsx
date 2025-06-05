import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { MoreVertical, MoreVerticalIcon, Plus } from "lucide-react";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "../ui/dropdown-menu";
import { trpc } from "@/utils/trpc";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface VideoCardProps {
    video: {
        id: number;
        title: string;
        thumbnailUrl: string;
        createdAt: string;
        muxUploadId: string;
        user: {
            name: string;
            imageUrl: string;
            clerkId: string;
            subscribersCount: number;
            isSubscribed: boolean;
        } | null;
        stats: {
            views: number;
            likes: number;
            dislikes: number;
            userReaction: string | null;
        };
    };
}

export const VideoCard = ({ video }: VideoCardProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
    const [isPublic, setIsPublic] = useState(true);

    const utils = trpc.useUtils();
    const { data: playlists } = trpc.playlist.getUserPlaylists.useQuery();

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
        <>
         <Card className="h-full flex flex-col">
    <CardContent className="p-0">
        <Link href={`/videos/${video.muxUploadId}`} className="relative aspect-video block">
            <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="object-cover w-full h-full rounded-t-lg"
            />
        </Link>
    </CardContent>
    <CardFooter className="p-4 flex gap-3 items-start">
        <Avatar>
            <AvatarImage src={video.user?.imageUrl} />
            <AvatarFallback>{video.user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1 flex-1">
            <Link href={`/videos/${video.muxUploadId}`}>
                <h3 className="font-semibold line-clamp-2 hover:underline">
                    {video.title}
                </h3>
            </Link>
            <p className="text-sm text-muted-foreground">
                {video.user?.name}
            </p>
            <div className="flex gap-2 text-sm text-muted-foreground">
                <span>{video.stats.views} views</span>
                <span>•</span>
                <span>
                    {formatDistanceToNow(new Date(video.createdAt), {
                        addSuffix: true,
                        locale: es,
                    })}
                </span>
            </div>
        </div>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button 
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={(e) => {
                        e.stopPropagation(); // importante
                        e.preventDefault(); // previene navegación en caso de estar dentro de Link
                        setIsOpen(true);
                    }}
                >
                    <MoreVertical className="w-5 h-5" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        Agregar a playlist
                    </DropdownMenuSubTrigger>
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
                        <DropdownMenuItem
                            onClick={handleCreatePlaylistClick}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Crear nueva playlist
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
              
              
            </DropdownMenuContent>
        </DropdownMenu>
    </CardFooter>
</Card>
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
        </>
    );
}; 