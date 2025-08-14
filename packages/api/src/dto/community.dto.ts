import type {
  Post,
  Comment,
  Event,
  EventMember,
  EventNote,
} from '@prometheus-fe/types';

// 공통 응답 인터페이스 (내부에서만 사용)
interface BaseResponse {
  success: boolean;
  message?: string;
}

// 포스트 생성
export interface CreatePostRequest {
  category: 'free' | 'activity' | 'career' | 'promotion' | 'study_group' | 'casual_group' | 'announcement';
  title: string;
  content: string;
}

export interface CreatePostResponse extends BaseResponse {
  post: Post;
}

// 포스트 목록 조회
export interface GetPostsRequest {
  page?: number;
  size?: number;
  category?: string;
}

export interface GetPostsResponse {
  total: number;
  items: Post[];
}

// 댓글 생성
export interface CreateCommentRequest {
  content: string;
}

export interface CreateCommentResponse extends BaseResponse {
  comment: Comment;
}

// Legacy Event Types (keeping for backward compatibility)
export interface CreateEventRequest {
  name: string;
  description?: string | null;
  visibility?: 'public' | 'private';
  recruitment_start_at?: string | null; // ISO
  recruitment_end_at?: string | null; // ISO
}

export interface CreateEventResponse extends BaseResponse {
  event: Event;
}

export interface GetEventsRequest {
  page?: number;
  size?: number;
  [key: string]: string | number | undefined;
}

export interface GetEventsResponse {
  total: number;
  items: Event[];
}

export interface CreateEventNoteRequest {
  title: string;
  content: string;
}

export interface CreateEventNoteResponse extends BaseResponse {
  note: EventNote;
}
