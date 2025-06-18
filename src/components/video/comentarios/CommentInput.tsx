"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CommentInputProps } from "./types";
import { cn } from "@/lib/utils";

export default function CommentInput({
  currentUser,
  placeholder = "Add a comment...",
  onSubmit,
  onCancel,
  initialValue = "",
  isReply = false,
  autoFocus = false,
}: CommentInputProps) {
  const [content, setContent] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(autoFocus);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX_LENGTH = 1000;

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = () => {
    if (content.trim() && content.length <= MAX_LENGTH) {
      onSubmit(content);
      setContent("");
      setIsFocused(false);
    }
  };

  const handleCancel = () => {
    setContent("");
    setIsFocused(false);
    if (onCancel) onCancel();
  };

  const charactersLeft = MAX_LENGTH - content.length;
  const isOverLimit = charactersLeft < 0;

  if (!currentUser) {
    return (
      <div className="flex items-center p-4 bg-secondary/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Sign in to add a comment
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-3", isReply ? "pl-12 mt-3" : "")}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <img
          src={currentUser.image}
          alt={currentUser.name}
          className="h-full w-full object-cover rounded-full"
        />
      </Avatar>
      <div className="flex-1 space-y-2">
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className={cn(
            "min-h-[40px] resize-none transition-all border-b border-input rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0",
            isFocused ? "min-h-[80px]" : ""
          )}
        />
        {isFocused && (
          <div className="flex items-center justify-between">
            <p
              className={cn(
                "text-xs",
                isOverLimit
                  ? "text-destructive"
                  : charactersLeft < 100
                  ? "text-amber-500"
                  : "text-muted-foreground"
              )}
            >
              {charactersLeft} characters remaining
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-sm"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!content.trim() || isOverLimit}
                className="text-sm"
              >
                {isReply ? "Reply" : "Comment"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}