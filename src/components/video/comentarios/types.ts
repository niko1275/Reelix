export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface Reaction {
  count: number;
  userReacted: boolean;
}

export interface Comment {
  id: string;
  user: User;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  isEdited?: boolean;
  likes: Reaction;
  dislikes: Reaction;
  replies: Comment[];
}

export interface CommentSectionProps {
  videoId: string;
  comments: Comment[];
  currentUser: User | null;
  totalComments: number;
} 