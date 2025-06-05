"use client"

import { trpc } from "@/utils/trpc";
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { VideoRowCard } from "./VideoRowCard";

interface User {
  clerkId: string;
  name: string;
  imageUrl: string;
  subscribersCount: number;
}

interface Video {
  id: number;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
  visibility: string;
  muxUploadId: string;
  userId: string;
  user: User;
}

interface Page {
  items: Video[];
  nextCursor: string | null;
}

interface SuggestionsContentProps {
  id: string;
}

export const SuggestionsContent = ({ id }: SuggestionsContentProps) => {
  return (
    <Suspense fallback={<SuggestionsSkeleton />}>
      <SuggestionQuery id={id} />
    </Suspense>
  );
};

const SuggestionsSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-muted animate-pulse rounded" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 w-3/4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-24 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

interface SuggestionQueryProps {
  id: string;
}

const SuggestionQuery = ({ id }: SuggestionQueryProps) => {
  const result = trpc.video.getVideoSuggestions.useSuspenseInfiniteQuery(
    {
      id,
      limit: 6,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const videos = result[0].pages.flatMap((page) => page.items);
  console.log("🧪 videos:", videos);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Sugerencias</h2>
      <div className="">
        {videos.map((video) => (
          <VideoRowCard key={video.muxUploadId} data={video as Video}/>
        ))}
      </div>
      
      {result[1].hasNextPage && (
        <div className="flex justify-center">
          <Button
            onClick={() => result[1].fetchNextPage()}
            disabled={result[1].isFetchingNextPage}
            variant="outline"
          >
            {result[1].isFetchingNextPage ? (
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
};

export default SuggestionQuery;