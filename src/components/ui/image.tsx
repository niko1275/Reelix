import NextImage from "next/image"
import { cn } from "@/lib/utils"

interface ImageProps extends React.ComponentProps<typeof NextImage> {
    className?: string
}

export const Image = ({ className, ...props }: ImageProps) => {
    return (
        <NextImage
            className={cn(
                "object-cover",
                className
            )}
            {...props}
        />
    )
} 