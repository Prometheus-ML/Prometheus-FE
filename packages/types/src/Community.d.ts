// Post Types
export interface PostCreateRequest {
  category: 'free' | 'activity' | 'career' | 'promotion' | 'study_group' | 'casual_group' | 'announcement';
  title: string;
  content: string;
}

export interface PostResponse {
  id: number;
  author_id: string;
  category: string;
  title: string;
  content: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostListResponse {
  total: number;
  items: PostResponse[];
}

// Comment Types
export interface CommentCreateRequest {
  content: string;
}

export interface CommentResponse {
  id: number;
  post_id: number;
  author_id: string;
  content: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

// Legacy Event Types (keeping for backward compatibility)
export interface EventCreateRequest {
  name: string;
  description?: string | null;
  visibility?: 'public' | 'private';
  recruitment_start_at?: string | null; // ISO
  recruitment_end_at?: string | null; // ISO
}

export interface EventResponse {
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

export interface EventListResponse {
  total: number;
  items: EventResponse[];
}

export interface EventMemberResponse {
  id: number;
  event_id: number;
  member_id: string;
  role: string;
  status: string;
  joined_at?: string | null;
}

export interface EventNoteCreateRequest {
  title: string;
  content: string;
}

export interface EventNoteResponse {
  id: number;
  event_id: number;
  author_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}


