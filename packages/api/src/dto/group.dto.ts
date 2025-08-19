import type {
  Group,
  GroupMember,
  GroupJoinRequest,
  GroupNote,
  GroupLikeToggleResponse,
  GroupLikeInfo,
} from '@prometheus-fe/types';

// 공통 응답 인터페이스 (내부에서만 사용)
interface BaseResponse {
  success: boolean;
  message?: string;
}

// 그룹 생성
export interface GroupCreateRequest {
  name: string;
  description?: string;
  category: 'STUDY' | 'CASUAL';
  max_members?: number;
  thumbnail_url?: string;
}

export interface GroupCreateResponse extends BaseResponse {
  group: Group;
}

// 그룹 업데이트
export interface GroupUpdateRequest {
  name?: string;
  description?: string;
  category?: 'STUDY' | 'CASUAL';
  max_members?: number;
  thumbnail_url?: string;
}

export interface GroupUpdateResponse extends BaseResponse {
  group: Group;
}

// 그룹 목록 조회
export interface GetGroupsRequest {
  page?: number;
  size?: number;
}

export interface GetGroupsResponse {
  total: number;
  items: Group[];
}

// 그룹 노트 생성
export interface GroupNoteCreateRequest {
  title: string;
  content: string;
  category?: string;
  post_type?: string;
}

export interface GroupNoteCreateResponse extends BaseResponse {
  note: GroupNote;
}

// 그룹 좋아요 관련
export interface GroupLikeToggleRequest {
  group_id: number;
}

export type GroupLikeToggleResponseType = GroupLikeToggleResponse;

export interface GetGroupLikesResponse extends BaseResponse {
  likes: GroupLikeInfo;
}

export interface CheckUserLikedGroupResponse extends BaseResponse {
  liked: boolean;
}
