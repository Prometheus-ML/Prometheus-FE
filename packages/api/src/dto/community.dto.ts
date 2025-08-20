import type {
  Post,
  Comment,
  LikeStatus,
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
  search?: string;
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

// 좋아요 관련
export interface LikeStatusResponse {
  post_id: number;
  is_liked: boolean;
  like_count: number;
}


