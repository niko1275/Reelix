import { Card, CardContent, CardFooter, CardHeader } from "../ui/card"
import { Skeleton } from "../ui/skeleton"

export const PlaylistCardSkeleton = () => {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex-none p-0">
                <div className="aspect-video relative">
                    <Skeleton className="w-full h-full rounded-t-lg" />
                </div>
            </CardHeader>
            <CardContent className="flex-grow p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-3 w-1/4" />
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Skeleton className="h-3 w-1/3" />
            </CardFooter>
        </Card>
    )
} 