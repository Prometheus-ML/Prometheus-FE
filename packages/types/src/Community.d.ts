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

// Event 기본 타입 (Entity)
export interface Event {
  id: number;
  name: string;
  description?: string | null;
  visibility: string;
  is_active: boolean;
  recruitment_start_at?: string | null;
  recruitment_end_at?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// EventMember 기본 타입 (Entity)
export interface EventMember {
  id: number;
  event_id: number;
  member_id: string;
  role: string;
  status: string;
  joined_at?: string | null;
}

// EventNote 기본 타입 (Entity)
export interface EventNote {
  id: number;
  event_id: number;
  author_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}


