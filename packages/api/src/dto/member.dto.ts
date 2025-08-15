// 멤버 목록 조회 관련
export interface MemberListRequest {
  page?: number;
  size?: number;
  search?: string;
  grant_filter?: string;
  gen_filter?: number;
  status_filter?: string;
  active_gens_filter?: string;
}

export interface MemberSummaryResponse {
  id: string;
  name: string;
  email: string;
  gen: number;
  grant: string;
  status: string;
  school?: string;
  major?: string;
  gender?: string;
}

export interface MemberListResponse {
  members: MemberSummaryResponse[];
  total: number;
  page: number;
  size: number;
}

// 멤버 상세 정보
export interface MemberResponse {
  id: string;
  name: string;
  email: string;
  image?: string;
  gen: number;
  school?: string;
  major?: string;
  student_id?: string;
  birthdate?: string;
  phone?: string;
  gender?: string;
  history?: string[];
  github?: string;
  notion?: string;
  figma?: string;
  kakao_id?: string;
  instagram_id?: string;
  mbti?: string;
  self_introduction?: string;
  additional_career?: string;
  coffee_chat_enabled: boolean;
  active_gens?: number[];
  grant: string;
  status: string;
  profile_image_url?: string;
  activity_start_date?: string;
  meta?: Record<string, any>;
}

// 멤버 생성/업데이트
export interface MemberCreateRequest {
  name: string;
  email: string;
  gen?: number;
  school?: string;
  major?: string;
  student_id?: string;
  birthdate?: string;
  phone?: string;
  gender?: string;
  grant?: string;
  status?: string;
  profile_image_url?: string;
  activity_start_date?: string;
  github?: string;
  notion?: string;
  figma?: string;
  kakao_id?: string;
  instagram_id?: string;
  mbti?: string;
  self_introduction?: string;
  additional_career?: string;
  coffee_chat_enabled?: boolean;
  active_gens?: number[];
  history?: string[];
}

export interface MemberUpdateRequest {
  name?: string;
  email?: string;
  gen?: number;
  school?: string;
  major?: string;
  student_id?: string;
  birthdate?: string;
  phone?: string;
  gender?: string;
  grant?: string;
  status?: string;
  profile_image_url?: string;
  activity_start_date?: string;
  github?: string;
  notion?: string;
  figma?: string;
  kakao_id?: string;
  instagram_id?: string;
  mbti?: string;
  self_introduction?: string;
  additional_career?: string;
  coffee_chat_enabled?: boolean;
  active_gens?: number[];
  history?: string[];
}

// 멤버 삭제
export interface MemberDeleteResponse {
  message: string;
  deleted_member_id: string;
}

// 대량 작업
export interface BulkMemberCreateRequest {
  members: MemberCreateRequest[];
}

export interface BulkMemberCreateResponse {
  message: string;
  created_count: number;
  failed_count: number;
  created_members: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  errors: Array<{
    index: number;
    error: string;
  }>;
}

export interface BulkMemberUpdateRequest {
  member_ids: string[];
  updates: {
    gen?: number;
    status?: string;
    grant?: string;
    active_gens?: number[];
  };
}

export interface BulkMemberUpdateResponse {
  message: string;
  updated_count: number;
  failed_count: number;
  updated_members: Array<{
    id: string;
    name: string;
  }>;
  errors: Array<{
    member_id: string;
    error: string;
  }>;
}

// 멤버 통계
export interface MemberStatsResponse {
  total_members: number;
  members_by_grant: Record<string, number>;
  members_by_gen: Record<string, number>;
  members_by_status: Record<string, number>;
  active_members: number;
  recent_members: MemberResponse[];
}