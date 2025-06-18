"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Flag,
  Pencil,
  Trash2,
} from "lucide-react";
import { CommentActionsProps } from "./types";
import { cn } from "@/lib/utils";

export default function CommentActions({
  comment,
  currentUser,
  onReply,
  onLike,
  onDislike,
  onEdit,
  onDelete,
}: CommentActionsProps) {
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isDislikeAnimating, setIsDislikeAnimating] = useState(false);

  const canModify = currentUser && currentUser.id === comment.user.id;

  const handleLike = () => {
    setIsLikeAnimating(true);
    onLike(comment.id);
    setTimeout(() => setIsLikeAnimating(false), 300);
  };

  const handleDislike = () => {
    setIsDislikeAnimating(true);
    onDislike(comment.id);
    setTimeout(() => setIsDislikeAnimating(false), 300);
  };

  return (
    <div className="flex items-center gap-1 pt-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-full",
              comment.likes.userReacted && "text-primary"
            )}
            onClick={handleLike}
          >
            <ThumbsUp
              className={cn(
                "h-4 w-4",
                isLikeAnimating && "animate-pulse scale-110"
              )}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Like</TooltipContent>
      </Tooltip>
      
      {comment.likes.count > 0 && (
        <span className="text-xs text-muted-foreground mr-2">
          {comment.likes.count}
        </span>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-full",
              comment.dislikes.userReacted && "text-primary"
            )}
            onClick={handleDislike}
          >
            <ThumbsDown
              className={cn(
                "h-4 w-4",
                isDislikeAnimating && "animate-pulse scale-110"
              )}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Dislike</TooltipContent>
      </Tooltip>

      <Button
        variant="ghost"
        size="sm"
        className="text-xs h-8 px-3 ml-1"
        onClick={() => onReply(comment.id)}
      >
        Reply
      </Button>

      {canModify && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full ml-auto"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => onEdit(comment.id, comment.content)}
            >
              <Pencil className="h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
              onClick={() => onDelete(comment.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {!canModify && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full ml-auto"
            >
              <Flag className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Report</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}