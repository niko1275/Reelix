import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { trpc } from "@/utils/trpc"
import { useAuth } from "@clerk/nextjs"
import { Pencil, UserPlus, UserMinus } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { videoGetByOne } from "@/modules/videos/types"
import { useState } from "react"

interface VideoTopRowProps {
    video: videoGetByOne
}

export default function VideoOwner({ video }: VideoTopRowProps) {
    const { userId } = useAuth()
    const utils = trpc.useUtils()
    const [isSubscribed, setIsSubscribed] = useState(video.user?.isSubscribed ?? false)
    const [subscribersCount, setSubscribersCount] = useState(video.user?.subscribersCount ?? 0)

    const { mutate: toggleSubscription, isPending } = trpc.subscriptions.toggleSubscription.useMutation({
        onMutate: async () => {
            // Cancelar cualquier refetch pendiente
            await utils.subscriptions.getSubscriptionStatus.cancel({ subscribedToId: video.user?.clerkId ?? '' });
            
            // Guardar el estado anterior
            const previousSubscribed = isSubscribed;
            const previousCount = subscribersCount;
            
            // Actualizar optimistamente
            setIsSubscribed(!isSubscribed);
            setSubscribersCount((prev: number) => isSubscribed ? prev - 1 : prev + 1);
            
            return { previousSubscribed, previousCount };
        },
        onSuccess: (data) => {
            // Actualizar el estado con la respuesta del servidor
            setIsSubscribed(data.isSubscribed);
            // Solo invalidar la caché de suscripciones
            utils.subscriptions.getSubscriptionStatus.invalidate({ subscribedToId: video.user?.clerkId ?? '' });
            toast.success(data.isSubscribed ? "¡Te has suscrito!" : "Te has desuscrito");
        },
        onError: (error, _, context) => {
            // Revertir el estado optimista en caso de error
            setIsSubscribed(context?.previousSubscribed ?? false);
            setSubscribersCount(context?.previousCount ?? 0);
            toast.error(error.message || "Error al actualizar la suscripción");
        }
    });

    const handleToggleSubscription = () => {
        if (!userId || !video.user?.clerkId) {
            toast.error("Debes iniciar sesión para suscribirte");
            return;
        }

        if (video.user.clerkId === userId) {
            toast.error("No puedes suscribirte a ti mismo");
            return;
        }

        toggleSubscription({ subscribedToId: video.user.clerkId });
    };

    if (!video?.user) return null;

    const isOwner = video.user.clerkId === userId;

    return (
        <div className="flex items-center sm:items-start justify-between sm:justify-start gap-3">
            <Link href={`/users/${video.user.clerkId}`} className="flex items-center gap-2 flex-col">
                <div className="flex items-center gap-2">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={video.user.imageUrl} />
                        <AvatarFallback>
                            {video.user.name}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-bold">
                            {video.user.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {subscribersCount} Suscriptores
                        </p>
                    </div>

                    {isOwner ? (
                        <button className="bg-gray-200 text-black px-4 py-2 rounded-md flex items-center gap-2">
                            <Pencil className="w-4 h-4" />
                            Editar video
                        </button>
                    ) : (
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                handleToggleSubscription();
                            }}
                            disabled={isPending}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors",
                                isSubscribed
                                    ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                                    : "bg-black text-white hover:bg-gray-800"
                            )}
                        >
                            {isSubscribed ? (
                                <>
                                    <UserMinus className="w-4 h-4" />
                                    Desuscribirse
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    Suscribirse
                                </>
                            )}
                        </button>
                    )}
                </div>
            </Link>
        </div>
    );
}
