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
    const [imageError, setImageError] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    console.log("Thumbnail: en upload "+value)
    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validar tamaño del archivo (máximo 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            toast.error("El archivo es demasiado grande. Máximo 5MB permitido.")
            return
        }

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            toast.error("Solo se permiten archivos de imagen.")
            return
        }

        try {
            setIsLoading(true)
            console.log("Iniciando subida de thumbnail:", file.name, file.type, "Tamaño:", file.size)

            // Primero obtenemos la URL firmada para subir
            console.log("Haciendo fetch a /api/upload...")
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

            console.log("Respuesta recibida:", response.status, response.statusText)
            console.log("Headers de respuesta:", Object.fromEntries(response.headers.entries()))

            if (!response.ok) {
                const errorText = await response.text()
                console.error("Error en respuesta de API:", response.status, errorText)
                throw new Error(`Error al obtener la URL firmada: ${response.status} - ${errorText}`)
            }

            const responseData = await response.json()
            console.log("Datos de respuesta:", responseData)
            
            const { uploadUrl, url, readUrl } = responseData
            console.log("URLs obtenidas:", { uploadUrl, url, readUrl })

            // Subimos el archivo a S3
            const uploadResponse = await fetch(uploadUrl, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type,
                },
            })

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text()
                console.error("Error en subida a S3:", uploadResponse.status, errorText)
                throw new Error(`Error al subir el archivo: ${uploadResponse.status} - ${errorText}`)
            }

            console.log("Archivo subido exitosamente a S3")

            // Usamos directamente la URL pública ya que el dominio está configurado en next.config.ts
            // Si hay problemas, podemos usar la URL firmada como respaldo
            const finalUrl = url
            
            // Verificamos si la URL pública es accesible después de un breve delay
            setTimeout(async () => {
                try {
                    const testResponse = await fetch(url, { method: "HEAD" })
                    if (!testResponse.ok) {
                        console.log("URL pública no accesible, usando URL firmada")
                        onChange(readUrl)
                    }
                } catch (error) {
                    console.log("Error al verificar URL pública, usando URL firmada:", error)
                    onChange(readUrl)
                }
            }, 1000)
            
            // Actualizamos el valor del thumbnail
            onChange(finalUrl)
            setImageError(false) // Resetear error de imagen
            toast.success("Thumbnail actualizado correctamente")
        } catch (error) {
            console.error("Error al subir el thumbnail:", error)
            toast.error(error instanceof Error ? error.message : "Error al subir el thumbnail")
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
                        onError={() => setImageError(true)}
                        onLoad={() => setImageError(false)}
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-200">
                        <ImageIcon className="h-10 w-10 text-gray-400" />
                    </div>
                )}
                {imageError && value && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                        <div className="text-center">
                            <ImageIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Error al cargar imagen</p>
                        </div>
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