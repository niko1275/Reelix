import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { useState } from "react"

interface VideoDescriptionProps {
    description: string | null
    compactView?: string
    compactdate?: string
    expandeddate: string
    expandedView?: string
}

export default function VideoDescription({ description, compactView, compactdate, expandeddate, expandedView }: VideoDescriptionProps) {
    const [expanded, setExpanded] = useState(false);
    
    return (
        <div 
            onClick={() => setExpanded(!expanded)} 
            className="p-4 bg-secondary/50 rounded-xl cursor-pointer hover:bg-secondary w-full mx-auto"
        >
            <div className="flex text-sm mb-2 gap-2">
                <span className="font-medium">
                    {expanded ? expandedView : compactView} views
                </span>
                <span className="font-medium">
                    {expanded ? expandeddate : compactdate}
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
