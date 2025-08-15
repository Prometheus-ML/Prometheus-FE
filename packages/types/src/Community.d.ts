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


