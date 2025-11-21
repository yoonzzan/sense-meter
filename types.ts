export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  deleted_yn?: string;
}

export interface Comment {
  id: number;
  created_at: string;
  text: string;
  author: Profile;
  deleted_yn?: string;
}

export interface ReactionTag {
  tag: string;
  count: number;
}

export interface Post {
  id: number;
  created_at: string;
  category: string;
  type: 'best' | 'worst';
  situation: string;
  sensation: string;
  emotion_tag: string;
  author: Profile; // Joined from profiles table
  likes: number;
  comments_count: number;
  comments: Comment[]; // Joined from comments table
  agree_count: number;
  disagree_count: number;
  reaction_tags: ReactionTag[]; // Joined from reaction_tags table
  deleted_yn?: string;
}
