import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { useState } from "react"

interface VideoDescriptionProps {
    description: string;
    publishedAt: string;
    viewCount: number;
    likeCount: number;
    dislikeCount: number;
}

export default function VideoDescription({ description, publishedAt, viewCount }: VideoDescriptionProps) {
    const [expanded, setExpanded] = useState(false);
    
    return (
        <div 
            onClick={() => setExpanded(!expanded)} 
            className="p-4 bg-secondary/50 rounded-xl cursor-pointer hover:bg-secondary w-full mx-auto"
        >
            <div className="flex text-sm mb-2 gap-2">
                <span className="font-medium">
                    {viewCount} views
                </span>
                <span className="font-medium">
                    {publishedAt}
                </span>
            </div>
            <div className="relative w-full">
                <p className={`text-sm text-muted-foreground whitespace-pre-wrap break-words ${!expanded && 'line-clamp-2'}`}>
                    {description}
                </p>
           
            </div>
            <div className="flex items-center gap-1 mt-4 text-sm font-medium">
                {expanded ? (
                    <p className="flex items-center gap-1">
                        Mostrar menos <ChevronUpIcon className="w-4 h-4"/>
                    </p>
                ) : (
                    <p className="flex items-center gap-1">
                        Leer más <ChevronDownIcon className="w-4 h-4"/>
                    </p>
                )}
            </div>
        </div>
    )
}
