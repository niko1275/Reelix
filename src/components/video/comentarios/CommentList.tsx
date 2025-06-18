import { CommentListProps } from "./types";
import Comment from "./Comment";
import { Separator } from "@/components/ui/separator";

export default function CommentList({
  comments,
  currentUser,
  onReply,
  onLike,
  onDislike,
  onEdit,
  onDelete,
}: CommentListProps) {
  // Find pinned comments, if any
  const pinnedComments = comments.filter((comment) => comment.isPinned);
  const regularComments = comments.filter((comment) => !comment.isPinned);

  return (
    <div className="space-y-1">
      {pinnedComments.length > 0 && (
        <>
          {pinnedComments.map((comment) => (
            <div key={comment.id}>
              <Comment
                comment={comment}
                currentUser={currentUser}
                onReply={onReply}
                onLike={onLike}
                onDislike={onDislike}
                onEdit={onEdit}
                onDelete={onDelete}
              />
              <Separator className="my-1" />
            </div>
          ))}
        </>
      )}

      {regularComments.map((comment, index) => (
        <div key={comment.id}>
          <Comment
            comment={comment}
            currentUser={currentUser}
            onReply={onReply}
            onLike={onLike}
            onDislike={onDislike}
            onEdit={onEdit}
            onDelete={onDelete}
          />
          {index < regularComments.length - 1 && <Separator className="my-1" />}
        </div>
      ))}

      {comments.length === 0 && (
        <div className="py-6 text-center">
          <p className="text-muted-foreground text-sm">
            No comments yet. Be the first to comment!
          </p>
        </div>
      )}
    </div>
  );
}