"use client"

import { trpc } from "@/utils/trpc"
import { Suspense } from "react"
import { Button } from "../ui/button"
import { DropdownMenu } from "@radix-ui/react-dropdown-menu"
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { MoreHorizontalIcon, MoreVerticalIcon, TrashIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm } from "react-hook-form"
import { z } from "zod"
import type { InferModel } from "drizzle-orm"
import { videos } from "@/lib/db/schema"
import { FormField, FormLabel, FormItem, FormControl, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { toast } from "sonner"
import { VideoPlayer } from "./VideoPlayer"

type Video = InferModel<typeof videos>

const formSchema = z.object({
    id: z.number().optional(),
    title: z.string().optional(),
    description: z.string().nullable().optional(),
    videoUrl: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    duration: z.number().optional(),
    views: z.number().optional(),
    isPublished: z.boolean().optional(),
    userId: z.string().optional(),
    muxAssetId: z.string().optional(),
    muxStatus: z.string().optional(),
    muxUploadId: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    categoryId: z.number().nullable().optional()
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

    const { data: categories } = trpc.category.getAll.useQuery()

    const utils = trpc.useUtils()

    const form = useForm<Partial<Video>>({
        resolver: zodResolver(formSchema),
        defaultValues: video && video.length > 0 ? {
            ...video[0],
            createdAt: new Date(video[0].createdAt),
            updatedAt: new Date(video[0].updatedAt)
        } : undefined
    });

    const { mutate: updateVideo, isPending } = trpc.video.update.useMutation({
        onSuccess: () => {
            toast.success("Video actualizado correctamente")
            utils.video.getById.invalidate({ id: videoId })
        },
        onError: (error) => {
            toast.error("Error al actualizar el video: " + error.message)
        }
    })

    const onSubmit = (data: Partial<Video>) => {
        if (!video?.[0]?.id) return

        updateVideo({
            id: video[0].id,
            ...data
        })
    }

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (!video || video.length === 0) {
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
                                            <Input {...field} placeholder="Añade un titulo para tu video"/>
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
                                                value={field.value ?? ''}
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
                                            onValueChange={(value) => field.onChange(Number(value))}
                                            defaultValue={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona una categoría" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
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
                        </div>
                        <div className="space-y-8 lg:col-span-2">
                            <div className="flex flex-col gap-4 bg-gray-200 p-4 rounded-md">
                                <div className="aspect-video rounded-md overflow-hidden">
                                    
                                    <VideoPlayer thumnailurl={video[0].thumbnailUrl}
                                     playbackId={video[0].playbackId} autoplay={false}/>
                                </div>
                                <div className="flex flex-col gap-2 ">
                                    <p className="text-sm text-gray-500">
                                        Video status
                                    </p>
                                    <p className="font-bold">
                                        {video[0].muxStatus}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </FormProvider>
        </div>
    )
}