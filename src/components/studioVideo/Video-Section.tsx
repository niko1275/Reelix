"use client"

import { trpc } from "@/utils/trpc"
import type { inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "@/server/routers/_app"
import { Button } from "@/components/ui/button"
import { Loader2, Eye, Clock, Calendar } from "lucide-react"
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "../ui/table"
import { StudioCargarModal } from "../studio/Studio-Cargar-Modal"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import VideoThumbnail from "../studio/VideoThumnail"
import Link from "next/link"

type Video = inferRouterOutputs<AppRouter>["video"]["getMany"]["items"][0]

export default function VideoSection() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = trpc.video.getMany.useInfiniteQuery({
        limit: 10,
    }, {
        getNextPageParam: (lastPage) => {
            if (!lastPage.nextCursor) return undefined;
            return {
                id: lastPage.nextCursor.id,
                createdAt: new Date(lastPage.nextCursor.createdAt)
            };
        },
    });

    if (!data) return null;

    const videos = data.pages.flatMap(page => page.items);

    return (
        <div className="w-full space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Tus Videos</h2>
                <StudioCargarModal />
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Thumbnail</TableHead>
                        <TableHead className="w-[300px]">Título</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Vistas</TableHead>
                        <TableHead>Duración</TableHead>
                        <TableHead>Fecha</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {videos.map((video) => (
                        <Link href={`/studio/videos/${video.muxUploadId}`} key={video.id}>
                        <TableRow key={video.id}>
                            <TableCell>
                                <VideoThumbnail imageUrl={video.thumbnailUrl} />
                            </TableCell>

                            <TableCell className="font-medium">
                                {video.title}
                            </TableCell>
                            <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                    video.isPublished 
                                        ? "bg-green-100 text-green-800" 
                                        : "bg-yellow-100 text-yellow-800"
                                }`}>
                                    {video.isPublished ? "Publicado" : "Borrador"}
                                </span>
                            </TableCell>
                            <TableCell className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {video.views}
                            </TableCell>
                            <TableCell className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                            </TableCell>
                            <TableCell className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDistanceToNow(new Date(video.createdAt), { 
                                    addSuffix: true,
                                    locale: es 
                                })}
                            </TableCell>
                        </TableRow>
                        </Link>
                    ))}
                </TableBody>
            </Table>

            {hasNextPage && (
                <div className="flex justify-center mt-4">
                    <Button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        variant="outline"
                    >
                        {isFetchingNextPage ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Cargando...
                            </>
                        ) : (
                            "Cargar más"
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}