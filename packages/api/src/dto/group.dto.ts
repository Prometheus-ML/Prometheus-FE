import type {
  Group,
  GroupMember,
  GroupJoinRequest,
  GroupLikeToggleResponse,
  GroupLikeInfo,
} from '@prometheus-fe/types';

// 공통 응답 인터페이스 (내부에서만 사용)
interface BaseResponse {
  success: boolean;
  message?: string;
}

// === 일반 사용자용 DTO ===

// 그룹 목록 조회 (일반 사용자)
export interface GetGroupsRequest {
  page?: number;
  size?: number;
}

// 그룹 가입 요청
export interface GroupJoinRequestDto {
  group_id: number;
}

// 그룹 좋아요 토글
export interface GroupLikeToggleRequest {
  group_id: number;
}

export type GroupLikeToggleResponseType = GroupLikeToggleResponse;

// 내가 속한 그룹 목록 조회
export interface GetMyGroupsRequest {
  page?: number;
  size?: number;
}

// 내 가입 신청 목록 조회
export interface GetMyRequestsRequest {
  page?: number;
  size?: number;
}

// === 관리자용 DTO ===

// 관리자용 그룹 생성
export interface AdminGroupCreateRequest {
  name: string;
  description?: string;
  category: 'STUDY' | 'CASUAL';
  max_members?: number;
  thumbnail_url?: string;
  deadline?: string;
}

export interface AdminGroupCreateResponse {
  id: number;
}

// 관리자용 그룹 수정
export interface AdminGroupUpdateRequest {
  name?: string;
  description?: string;
  category?: 'STUDY' | 'CASUAL';
  max_members?: number;
  thumbnail_url?: string;
  deadline?: string;
}

// 관리자용 그룹 목록 조회
export interface AdminGetGroupsRequest {
  page?: number;
  size?: number;
  gen?: number;
  status?: string;
}

// 관리자용 멤버 관리
export interface AdminMemberApproveRequest {
  member_id: string;
}

export interface AdminMemberRejectRequest {
  member_id: string;
}

export interface AdminMemberRemoveRequest {
  member_id: string;
}

// 관리자용 응답
export interface AdminGroupDeleteResponse {
  message: string;
}

export interface AdminMemberRemoveResponse {
  message: string;
}
