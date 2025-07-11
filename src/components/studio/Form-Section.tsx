"use client"

import { trpc } from "@/utils/trpc"
import { Suspense, useEffect, useState } from "react"
import { Button } from "../ui/button"
import { DropdownMenu } from "@radix-ui/react-dropdown-menu"
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Copy, FolderLock, MoreVerticalIcon, TrashIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm } from "react-hook-form"
import { z } from "zod"
import { FormField, FormLabel, FormItem, FormControl, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { toast } from "sonner"
import { VideoPlayer } from "./VideoPlayer"
import { ThumbnailUpload } from "./ThumbnailUpload"


// Creamos un tipo para los campos que queremos actualizar
type VideoFormData = {
    title?: string
    description?: string | null
    thumbnailUrl?: string | null
    visibility?: string | null
    categoryId?: number | null
}

const formSchema = z.object({
    title: z.string().optional(),
    description: z.string().nullable().optional(),
    thumbnailUrl: z.string().nullable().optional(),
    visibility: z.string().nullable().optional(),
    categoryId: z.number().nullable().optional(),
})

interface FormSectionProps {
    videoId: string
}

export default function FormSectionVideo({ videoId }: FormSectionProps) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FormSection videoId={videoId} />
        </Suspense>
    )
}

const FormSection = ({ videoId }: FormSectionProps) => {
    const { data: video, isLoading } = trpc.video.getById.useQuery({
        id: videoId
    })
    const [copied, setCopied] = useState(false)
    const { data: categories } = trpc.category.getAll.useQuery()

    const utils = trpc.useUtils()

    const handleCopy = () => {
        navigator.clipboard.writeText(`http://localhost:3000/videos/${video?.muxUploadId}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const form = useForm<VideoFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: video ? {
            title: video.title,
            description: video.description,
            thumbnailUrl: video.thumbnailUrl,
            visibility: video.visibility,
            categoryId: video.categoryId,
        } : undefined
    });

    useEffect(() => {
        if (video) {
            form.reset({
                title: video.title,
                description: video.description,
                thumbnailUrl: video.thumbnailUrl,
                visibility: video.visibility,
                categoryId: video.categoryId,
            });
        }
    }, [video, form]);

    const { mutate: updateVideo, isPending } = trpc.video.update.useMutation({
        onSuccess: () => {
            toast.success("Video actualizado correctamente")
            utils.video.getById.invalidate({ id: videoId })
        },
        onError: (error) => {
            toast.error("Error al actualizar el video: " + error.message)
        }
    })

    const onSubmit = (data: VideoFormData) => {
        if (!video?.id) return
      
        updateVideo({
            id: Number(video.id),
            title: data.title ?? video.title,
            description: data.description ?? video.description,
            thumbnailUrl: data.thumbnailUrl ?? video.thumbnailUrl,
            visibility: data.visibility ?? video.visibility,
            categoryId: typeof data.categoryId === "number" ? data.categoryId : video.categoryId,
        })
    }

    const onThumbnailChange = async (url: string) => {
        if (!video?.id) return

        updateVideo({
            id: Number(video.id),
            thumbnailUrl: url
        })
    }

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (!video) {
        return <div>No video found</div>
    }

    return (
        <div>
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">Detalles del video</h1>
                        </div>
                        <div>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Guardando..." : "Guardar"}
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <MoreVerticalIcon />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>
                                        <TrashIcon className="w-4 h-4 mr-2"/>
                                        Eliminar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">
                        Maneja los detalles del video aqui
                    </p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="space-y-8 lg:col-span-3">
                            <FormField 
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Titulo</FormLabel>
                                        <FormControl> 
                                            <Input {...field} value={field.value ?? ""} placeholder="Añade un titulo para tu video"/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField 
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción</FormLabel>
                                        <FormControl> 
                                            <Textarea 
                                                {...field} 
                                                value={field.value ?? ""}
                                                placeholder="Añade una descripción para tu video"
                                                className="resize-none"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField 
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Categoría</FormLabel>
                                        <Select 
                                            
                                            onValueChange={(value) => field.onChange(value === "" ? null : Number(value))}
                                            value={field.value?.toString() ?? video.categoryId?.toString() ?? ""}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona una categoría" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent >
                                                {categories?.map((category) => (
                                                    <SelectItem 
                                                        key={category.id} 
                                                        value={category.id.toString()}
                                                    >
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            
                        <div className="flex flex-col gap-2">
                                <p className="text-sm text-gray-500 font-bold">
                                    Thumbnail
                                </p>
                                <FormField
                                    control={form.control}
                                    name="thumbnailUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <ThumbnailUpload
                                                    value={field.value ?? ""}
                                                    onChange={onThumbnailChange}
                                                    disabled={isPending}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="space-y-8 lg:col-span-2">
                            <div className="flex flex-col gap-4 bg-gray-200 p-4 rounded-md">
                                <div className="aspect-video rounded-md overflow-hidden">
                                    <VideoPlayer thumnailurl={video.thumbnailUrl}
                                     playbackId={video.playbackId || ""} autoplay={false}/>
                                </div>
                                <div className="flex flex-col gap-2 ">
                                <p className="text-sm text-blue-600 p-0 flex flex-wrap gap-2 break-all whitespace-normal">
                                    {`localhost:3000/videos/${video.muxUploadId}`}
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center gap-1 text-gray-500 hover:text-blue-600"
                                    >
                                        <Copy className="w-4 h-4" />
                                        {copied ? "Copiado" : "Copiar"}
                                    </button>
                                    </p>
                                    
                                    <p className="text-sm text-gray-500">
                                        Video status
                                    </p>
                                    <p className="font-bold">
                                        {video.muxStatus}
                                    </p>
                                </div>
                            </div>


                            <div className="flex flex-col gap-2">
                                <p className="text-sm text-gray-500 font-bold">
                                    Visibilidad
                                </p>
                                <FormField
                                    control={form.control}
                                    name="visibility"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value ?? video.visibility ?? ""}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona una visibilidad" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="public">
                                                        <div className="flex items-center gap-2">
                                                            <FolderLock className="w-4 h-4"/>
                                                            <span>Público</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="private">
                                                        <div className="flex items-center gap-2">
                                                            <FolderLock className="w-4 h-4"/>
                                                            <span>Privado</span>
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </FormProvider>
        </div>
    )
}