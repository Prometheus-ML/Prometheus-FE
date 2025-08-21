// Post 기본 타입 (Entity)
export interface Post {
  id: number;
  author_id: string;
  author_name: string;
  author_gen: number;
  category: string;
  title: string;
  content: string;
  images?: string[];  // 이미지 URL 리스트
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  like_count?: number;
  comment_count?: number;
  is_liked?: boolean;
}

// Comment 기본 타입 (Entity)
export interface Comment {
  id: number;
  post_id: number;
  author_id: string;
  author_name: string;
  author_gen: number;
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


