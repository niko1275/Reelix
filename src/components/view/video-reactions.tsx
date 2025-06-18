import { useState } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { trpc } from "@/utils/trpc"
import { toast } from "sonner"
import { videoGetByOne } from "@/modules/videos/types"

interface VideoTopRowProps {
  video: videoGetByOne
}

export const VideoReactions = ({ video }: VideoTopRowProps) => {
  const utils = trpc.useUtils();
  const [optimisticReaction, setOptimisticReaction] = useState<string | null>(video.stats?.userReaction ?? null);
  const [optimisticStats, setOptimisticStats] = useState({
    likes: video.stats?.likes ?? 0,
    dislikes: video.stats?.dislikes ?? 0
  });

  const { mutate: toggleReaction, isPending } = trpc.videoReactions.toggleReaction.useMutation({
    onMutate: async ({ type }) => {
      // Cancelar cualquier refetch pendiente
      await utils.videoReactions.getReactions.cancel({ videoId: video.id });
      
      // Guardar el estado anterior
      const previousReaction = optimisticReaction;
      const previousStats = { ...optimisticStats };
      
      // Actualizar optimistamente
      setOptimisticReaction(type === optimisticReaction ? null : type);
      
      // Actualizar estadísticas optimistamente
      if (type === 'like') {
        if (optimisticReaction === 'like') {
          setOptimisticStats(prev => ({ ...prev, likes: prev.likes - 1 }));
        } else if (optimisticReaction === 'dislike') {
          setOptimisticStats(prev => ({ 
            ...prev, 
            likes: prev.likes + 1,
            dislikes: prev.dislikes - 1 
          }));
        } else {
          setOptimisticStats(prev => ({ ...prev, likes: prev.likes + 1 }));
        }
      } else if (type === 'dislike') {
        if (optimisticReaction === 'dislike') {
          setOptimisticStats(prev => ({ ...prev, dislikes: prev.dislikes - 1 }));
        } else if (optimisticReaction === 'like') {
          setOptimisticStats(prev => ({ 
            ...prev, 
            likes: prev.likes - 1,
            dislikes: prev.dislikes + 1 
          }));
        } else {
          setOptimisticStats(prev => ({ ...prev, dislikes: prev.dislikes + 1 }));
        }
      }
      
      return { previousReaction, previousStats };
    },
    onError: (error, _, context) => {
      // Revertir al estado anterior en caso de error
      setOptimisticReaction(context?.previousReaction ?? null);
      setOptimisticStats(context?.previousStats ?? { likes: 0, dislikes: 0 });
      toast.error("Error al actualizar la reacción: " + error.message);
    },
    onSettled: () => {
      // Solo invalidar las reacciones, no el video completo
      utils.videoReactions.getReactions.invalidate({ videoId: video.id });
    }
  });

  const handleLike = () => {
    toggleReaction({ videoId: video.id, type: 'like' });
  };

  const handleDislike = () => {
    toggleReaction({ videoId: video.id, type: 'dislike' });
  };

  return (
    <div className="inline-flex border border-gray-300 rounded-full overflow-hidden text-sm font-medium">
      <button
        onClick={handleLike}
        disabled={isPending}
        className={cn(
          "flex items-center gap-1 px-4 py-1 transition hover:bg-gray-100",
          optimisticReaction === 'like' ? "bg-blue-100 text-blue-600" : "text-gray-600"
        )}
      >
        <ThumbsUp
          className={cn(
            "w-4 h-4",
            optimisticReaction === 'like' && "fill-blue-600 stroke-blue-600"
          )}
        />
        {optimisticStats.likes}
      </button>
      <div className="w-px bg-gray-300" />
      <button
        onClick={handleDislike}
        disabled={isPending}
        className={cn(
          "flex items-center gap-1 px-4 py-1 transition hover:bg-gray-100",
          optimisticReaction === 'dislike' ? "bg-red-100 text-red-600" : "text-gray-600"
        )}
      >
        <ThumbsDown
          className={cn(
            "w-4 h-4",
            optimisticReaction === 'dislike' && "fill-red-600 stroke-red-600"
          )}
        />
        {optimisticStats.dislikes}
      </button>
    </div>
  )
}
