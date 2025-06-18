"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CommentInput from "./CommentInput";
import CommentList from "./CommentList";
import CommentSort from "./CommentSort";
import { CommentSectionProps, Comment } from "./types";

export default function CommentSection({
  videoId,
  comments: initialComments,
  currentUser,
  totalComments,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [sortOption, setSortOption] = useState<string>("top");

  const handleAddComment = (content: string) => {
    // In a real app, you would call an API to post the comment
    const newComment: Comment = {
      id: Date.now().toString(),
      user: currentUser!,
      content,
      createdAt: new Date(),
      likes: { count: 0, userReacted: false },
      dislikes: { count: 0, userReacted: false },
      replies: [],
    };

    setComments([newComment, ...comments]);
  };

  const handleReply = (commentId: string) => {
    // This function just triggers the reply UI in the Comment component
    console.log(`Reply to comment ${commentId}`);
  };

  const handleLike = (commentId: string) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          const wasLiked = comment.likes.userReacted;
          return {
            ...comment,
            likes: {
              count: wasLiked
                ? comment.likes.count - 1
                : comment.likes.count + 1,
              userReacted: !wasLiked,
            },
            dislikes: {
              ...comment.dislikes,
              count: comment.dislikes.userReacted
                ? comment.dislikes.count - 1
                : comment.dislikes.count,
              userReacted: false,
            },
          };
        }
        // Check in replies too
        if (comment.replies.length > 0) {
          return {
            ...comment,
            replies: comment.replies.map((reply: Comment) => {
              if (reply.id === commentId) {
                const wasLiked = reply.likes.userReacted;
                return {
                  ...reply,
                  likes: {
                    count: wasLiked
                      ? reply.likes.count - 1
                      : reply.likes.count + 1,
                    userReacted: !wasLiked,
                  },
                  dislikes: {
                    ...reply.dislikes,
                    count: reply.dislikes.userReacted
                      ? reply.dislikes.count - 1
                      : reply.dislikes.count,
                    userReacted: false,
                  },
                };
              }
              return reply;
            }),
          };
        }
        return comment;
      })
    );
  };

  const handleDislike = (commentId: string) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          const wasDisliked = comment.dislikes.userReacted;
          return {
            ...comment,
            dislikes: {
              count: wasDisliked
                ? comment.dislikes.count - 1
                : comment.dislikes.count + 1,
              userReacted: !wasDisliked,
            },
            likes: {
              ...comment.likes,
              count: comment.likes.userReacted
                ? comment.likes.count - 1
                : comment.likes.count,
              userReacted: false,
            },
          };
        }
        // Check in replies too
        if (comment.replies.length > 0) {
          return {
            ...comment,
            replies: comment.replies.map((reply: Comment) => {
              if (reply.id === commentId) {
                const wasDisliked = reply.dislikes.userReacted;
                return {
                  ...reply,
                  dislikes: {
                    count: wasDisliked
                      ? reply.dislikes.count - 1
                      : reply.dislikes.count + 1,
                    userReacted: !wasDisliked,
                  },
                  likes: {
                    ...reply.likes,
                    count: reply.likes.userReacted
                      ? reply.likes.count - 1
                      : reply.likes.count,
                    userReacted: false,
                  },
                };
              }
              return reply;
            }),
          };
        }
        return comment;
      })
    );
  };

  const handleEdit = (commentId: string, content: string) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            content,
            isEdited: true,
            updatedAt: new Date(),
          };
        }
        // Check in replies too
        if (comment.replies.length > 0) {
          return {
            ...comment,
            replies: comment.replies.map((reply: Comment) => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  content,
                  isEdited: true,
                  updatedAt: new Date(),
                };
              }
              return reply;
            }),
          };
        }
        return comment;
      })
    );
  };

  const handleDelete = (commentId: string) => {
    // First check if it's a top-level comment
    const updatedComments = comments.filter(
      (comment) => comment.id !== commentId
    );

    // If the length is the same, it means we need to look in replies
    if (updatedComments.length === comments.length) {
      setComments(
        comments.map((comment) => ({
          ...comment,
          replies: comment.replies.filter((reply: Comment) => reply.id !== commentId),
        }))
      );
    } else {
      setComments(updatedComments);
    }
  };

  const handleSortChange = (option: string) => {
    setSortOption(option);
    
    // Sort the comments
    let sortedComments = [...comments];
    if (option === "top") {
      sortedComments.sort((a, b) => b.likes.count - a.likes.count);
    } else if (option === "newest") {
      sortedComments.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    
    setComments(sortedComments);
  };

  return (
    <Card className="max-w-3xl mx-auto border-0 shadow-none">
      <CommentInput
        currentUser={currentUser}
        onSubmit={handleAddComment}
        placeholder="Add a comment..."
      />
      <Separator className="my-4" />
      <CommentSort
        sortOption={sortOption}
        onSortChange={handleSortChange}
        totalComments={totalComments}
      />
      <CommentList
        comments={comments}
        currentUser={currentUser}
        onReply={handleReply}
        onLike={handleLike}
        onDislike={handleDislike}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Card>
  );
}