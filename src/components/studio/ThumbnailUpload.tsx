"use client"

import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { ImageIcon, MoreVerticalIcon, UploadIcon, X } from "lucide-react"
import Image from "next/image"
import { useState, useRef } from "react"
import { toast } from "sonner"

interface ThumbnailUploadProps {
    onChange: (value: string) => void
    value: string
    disabled?: boolean
}

export const ThumbnailUpload = ({
    onChange,
    value,
    disabled
}: ThumbnailUploadProps) => {
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    console.log("Thumbnail: en upload "+value)
    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setIsLoading(true)

            // Primero obtenemos la URL firmada para subir
            const response = await fetch("/api/upload", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fileName: file.name,
                    fileType: file.type,
                }),
            })

            if (!response.ok) {
                throw new Error("Error al obtener la URL firmada")
            }

            const { uploadUrl, url } = await response.json()

            // Subimos el archivo a S3
            const uploadResponse = await fetch(uploadUrl, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type,
                },
            })

            if (!uploadResponse.ok) {
                throw new Error("Error al subir el archivo")
            }

            // Actualizamos el valor del thumbnail
            onChange(url)
            toast.success("Thumbnail actualizado correctamente")
        } catch (error) {
            console.error("Error al subir el thumbnail:", error)
            toast.error("Error al subir el thumbnail")
        } finally {
            setIsLoading(false)
            // Limpiamos el input para permitir subir el mismo archivo de nuevo
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const onRemove = () => {
        onChange("")
    }

    const handleUploadClick = () => {
        fileInputRef.current?.click()
    }

    return (
        <div className="flex items-center gap-x-4">
            <div className="relative h-[200px] w-[200px] rounded-md overflow-hidden">
                {value ? (
                    <div className="absolute top-2 right-2 z-10">
                        <Button
                            onClick={onRemove}
                            variant="destructive"
                            size="icon"
                            type="button"
                            disabled={disabled || isLoading}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : null}
                {value ? (
                    <Image
                        fill
                        className="object-cover"
                        alt="Thumbnail"
                        src={value}
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-200">
                        <ImageIcon className="h-10 w-10 text-gray-400" />
                    </div>
                )}
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        size="icon"
                        variant="ghost"
                        disabled={disabled || isLoading}
                    >
                        <MoreVerticalIcon className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleUploadClick}>
                        <div className="flex items-center gap-x-2 cursor-pointer">
                            <UploadIcon className="h-4 w-4" />
                            Subir thumbnail
                        </div>
                    </DropdownMenuItem>
                    {value && (
                        <DropdownMenuItem onClick={onRemove}>
                            <X className="h-4 w-4 mr-2" />
                            Eliminar thumbnail
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onUpload}
                disabled={disabled || isLoading}
            />
        </div>
    )
} 