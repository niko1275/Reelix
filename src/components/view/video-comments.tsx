import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { trpc } from "@/utils/trpc"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { MessageCircle, Reply, Edit, Trash2, ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoCommentsProps {
  videoId: number
}

interface User {
  clerkId: string;
  name: string;
  email: string;
  id: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  bannerUrl: string | null;
  bannerKey: string | null;
}

// Interfaz que coincide exactamente con la estructura del backend
interface BackendComment {
  id: number;
  content: string;
  videoId: number;
  userId: string;
  parentId: number | null;
  replyingTo: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
  replies: BackendComment[];
  replyingToUser?: User | null;
}

// Interfaz para comentarios aplanados
interface FlattenedComment {
  id: number;
  content: string;
  videoId: number;
  userId: string;
  parentId: number | null;
  replyingTo: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
  replies: BackendComment[];
  replyingToUser?: User | null;
  isReply: boolean;
  isNestedReply: boolean;
}

export const VideoComments = ({ videoId }: VideoCommentsProps) => {
  const { userId } = useAuth()
  const utils = trpc.useUtils()
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [editingComment, setEditingComment] = useState<number | null>(null)
  const [editContent, setEditContent] = useState("")
  console.log("🧪 videoId: en comentarios", videoId);
  const { data: comments, isLoading } = trpc.comments.getVideoComments.useQuery(
    { videoId },
    { enabled: !!videoId }
  )
 
  const { mutate: createComment} = trpc.comments.createComment.useMutation({
    onSuccess: () => {
      setReplyingTo(null)
      utils.comments.getVideoComments.invalidate({ videoId })
      toast.success("Comentario publicado")
    },
    onError: (error) => {
      toast.error(error.message || "Error al publicar el comentario")
    }
  })

  const { mutate: updateComment} = trpc.comments.updateComment.useMutation({
    onSuccess: () => {
      setEditingComment(null)
      setEditContent("")
      utils.comments.getVideoComments.invalidate({ videoId })
      toast.success("Comentario actualizado")
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar el comentario")
    }
  })

  const { mutate: deleteComment} = trpc.comments.deleteComment.useMutation({
    onSuccess: () => {
      utils.comments.getVideoComments.invalidate({ videoId })
      toast.success("Comentario eliminado")
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar el comentario")
    }
  })

  const handleUpdate = (commentId: number) => {
    if (!editContent.trim()) return
    updateComment({
      commentId,
      content: editContent
    })
  }

  const handleDelete = (commentId: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este comentario?")) {
      deleteComment({ commentId })
    }
  }

  const CommentForm = ({ onSubmit, initialValue = "", buttonText = "Comentar" }: { 
    onSubmit: (content: string) => void, 
    initialValue?: string,
    buttonText?: string 
  }) => {
    const [content, setContent] = useState(initialValue)

    return (
      <form onSubmit={(e) => {
        e.preventDefault()
        onSubmit(content)
      }} className="flex flex-col gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe un comentario..."
          className="min-h-[100px]"
        />
        <div className="flex justify-end gap-2">
          {replyingTo && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setReplyingTo(null)}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={!content.trim()}>
            {buttonText}
          </Button>
        </div>
      </form>
    )
  }

  const CommentItem = ({ comment, isReply = false, isNestedReply = false }: { 
    comment: BackendComment, 
    isReply?: boolean,
    isNestedReply?: boolean 
  }) => {
    const isEditing = editingComment === comment.id
    const { data: reactions } = trpc.comments.getCommentReactions.useQuery(
      { commentId: comment.id },
      { enabled: !!comment.id }
    )

    const { mutate: toggleReaction } = trpc.comments.toggleReaction.useMutation({
      onSuccess: () => {
        utils.comments.getCommentReactions.invalidate({ commentId: comment.id })
      },
      onError: (error) => {
        toast.error(error.message || "Error al actualizar la reacción")
      }
    })

    const handleReaction = (type: 'like' | 'dislike') => {
      if (!userId) {
        toast.error("Debes iniciar sesión para reaccionar")
        return
      }
      toggleReaction({ commentId: comment.id, type })
    }

    return (
      <div className={cn("flex gap-4 py-4", isReply && "ml-8 border-l-2 pl-4")}>
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.user.imageUrl} />
          <AvatarFallback>{comment.user.name}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{comment.user.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { 
                addSuffix: true,
                locale: es 
              })}
            </p>
          </div>
          
          {isEditing ? (
            <CommentForm
              onSubmit={() => handleUpdate(comment.id)}
              initialValue={editContent}
              buttonText="Actualizar"
            />
          ) : (
            <>
              {isNestedReply && comment.replyingTo && (
                <p className="text-sm text-muted-foreground">
                  Respondiendo a <span className="font-medium">@{comment.replyingToUser?.name}</span>
                </p>
              )}
              <p className="mt-1">{comment.content}</p>
              <div className="flex items-center gap-4 mt-2 ">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReaction('like')}
                    className={cn(
                      "flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground",
                      reactions?.userReaction === 'like' && "text-blue-500"
                    )}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {reactions?.likes || 0}
                  </button>
                  <button
                    onClick={() => handleReaction('dislike')}
                    className={cn(
                      "flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground",
                      reactions?.userReaction === 'dislike' && "text-red-500"
                    )}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    {reactions?.dislikes || 0}
                  </button>
                </div>
                <button
                  onClick={() => {
                    setReplyingTo(comment.id)
                  }}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Reply className="w-4 h-4" />
                  Responder
                </button>
                {userId === comment.user.clerkId && (
                  <>
                  <div className="flex sm:flex-row flex-col">

                  
                    <button
                      onClick={() => {
                        setEditingComment(comment.id)
                        setEditContent(comment.content)
                      }}
                      className="flex items-center mr-2 gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* Formulario de respuesta */}
          {replyingTo === comment.id && (
            <div className="mt-4">
              <CommentForm
                onSubmit={(content) => {
                  createComment({
                    content,
                    videoId,
                    parentId: comment.id,
                    replyingTo: comment.user.clerkId
                  })
                }}
                buttonText="Responder"
                initialValue={isReply ? `@${comment.user.name} ` : ""}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <div>Cargando comentarios...</div>
  }

  // Combinar comentarios principales y respuestas en una sola lista
  const flattenComments = (comment: BackendComment, parentName?: string, isNestedReply = false): FlattenedComment[] => {
    const result: FlattenedComment[] = [{
      ...comment,
      isReply: !!parentName,
      isNestedReply,
    }];

    if (comment.replies && comment.replies.length > 0) {
      comment.replies.forEach((reply: BackendComment) => {
        result.push(...flattenComments(reply, comment.user.name, true));
      });
    }

    return result;
  };

  const allComments: FlattenedComment[] = [];
  if (comments) {
    comments.forEach((comment) => {
      allComments.push(...flattenComments(comment as unknown as BackendComment));
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-6 h-6" />
        <h2 className="text-xl font-semibold">Comentarios</h2>
      </div>

      {/* Formulario principal de comentarios */}
      <CommentForm onSubmit={(content) => {
        createComment({
          content,
          videoId
        })
      }} />

      {/* Lista de comentarios y respuestas */}
      <div className="space-y-4">
        {allComments.map((comment: FlattenedComment, index: number) => (
          <CommentItem 
            key={index} 
            comment={comment} 
            isReply={comment.isReply}
            isNestedReply={comment.isNestedReply}
          />
        ))}
      </div>
    </div>
  )
} 