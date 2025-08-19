// Post 기본 타입 (Entity)
export interface Post {
  id: number;
  author_id: string;
  category: string;
  title: string;
  content: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  like_count?: number;
  is_liked?: boolean;
}

// Comment 기본 타입 (Entity)
export interface Comment {
  id: number;
  post_id: number;
  author_id: string;
  content: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

// Like 관련 타입
export interface LikeStatus {
  post_id: number;
  is_liked: boolean;
  like_count: number;
}


