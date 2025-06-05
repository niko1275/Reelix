import Image from "next/image";
import { cn } from "@/lib/utils";

interface videoThumbnailProps {
    imageUrl: string | null;
    className?: string;
}

export default function VideoThumbnail({ imageUrl, className }: videoThumbnailProps) {
    console.log("🧪 imageUrl:", imageUrl);
    if (!imageUrl) {
        return (
            <div className={cn("relative w-full overflow-hidden rounded-xl aspect-video bg-gray-200", className)}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-500">No thumbnail available</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("relative w-full overflow-hidden rounded-xl aspect-video", className)}>
            <Image 
                src={imageUrl} 
                alt="Video Thumbnail" 
                fill 
                className="object-cover"
                onError={(e) => {
                    // Si la imagen falla al cargar, mostramos un fallback
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement?.classList.add('bg-gray-200');
                }}
            />
        </div>
    );
}