// 공개 사용자 정보 (검색용)
export interface UserPublic {
  id: string;
  name: string;
  email: string;
  profile_image_url?: string | null;
  gen?: number | null;
  school?: string | null;
  major?: string | null;
  student_id?: string | null;
  history?: string[] | null;
}

// 공개 사용자 목록 응답
export interface UserPublicListResponse {
  users: UserPublicListItem[];
  total: number;
  page: number;
  size: number;
}

// 공개 목록용 사용자 정보
export interface UserPublicListItem {
  name: string;
  profile_image_url?: string | null;
  gen?: number | null;
  school?: string | null;
  major?: string | null;
  history?: string[] | null;
}

// 인증된 사용자용 목록 응답
export interface UserPrivateListResponse {
  users: UserPrivateListItem[];
  total: number;
  page: number;
  size: number;
}

// 인증된 사용자용 목록 정보
export interface UserPrivateListItem {
  id: string;
  name: string;
  profile_image_url?: string | null;
  gen?: number | null;
  school?: string | null;
  major?: string | null;
  history?: string[] | null;
  coffee_chat_enabled?: boolean | null;
  status?: string | null;
}

// 사용자 상세 정보
export interface UserDetailResponse {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  grant: string;
  gen?: number | null;
  school?: string | null;
  major?: string | null;
  student_id?: string | null;
  birthdate?: string | null;
  phone?: string | null;
  gender?: string | null;
  github?: string | null;
  notion?: string | null;
  figma?: string | null;
  kakao_id?: string | null;
  instagram_id?: string | null;
  mbti?: string | null;
  self_introduction?: string | null;
  additional_career?: string | null;
  coffee_chat_enabled?: boolean | null;
  active_gens?: number[] | null;
  history?: string[] | null;
  status: string;
  profile_image_url?: string | null;
  activity_start_date?: string | null;
  meta?: Record<string, any> | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// 내 프로필 수정 요청
export interface MyProfileUpdateRequest {
  github?: string | null;
  notion?: string | null;
  figma?: string | null;
  kakao_id?: string | null;
  instagram_id?: string | null;
  mbti?: string | null;
  gender?: string | null;
  coffee_chat_enabled?: boolean | null;
  self_introduction?: string | null;
  additional_career?: string | null;
  profile_image_url?: string | null;
}

// 내 프로필 응답
export interface MyProfileResponse {
  id: string;
  name: string;
  email: string;
  grant: string;
  status: string;
  gen?: number | null;
  school?: string | null;
  major?: string | null;
  student_id?: string | null;
  birthdate?: string | null;
  phone?: string | null;
  gender?: string | null;
  github?: string | null;
  notion?: string | null;
  figma?: string | null;
  kakao_id?: string | null;
  instagram_id?: string | null;
  mbti?: string | null;
  coffee_chat_enabled?: boolean | null;
  self_introduction?: string | null;
  additional_career?: string | null;
  profile_image_url?: string | null;
  activity_start_date?: string | null;
  active_gens?: number[] | null;
  history?: string[] | null;
  meta?: Record<string, any> | null;
}

// Manager가 사용자 정보 수정할 때 사용
export interface UserUpdateByManagerRequest {
  name?: string | null;
  email?: string | null;
  gen?: number | null;
  school?: string | null;
  major?: string | null;
  student_id?: string | null;
  birthdate?: string | null;
  phone?: string | null;
  gender?: string | null;
  history?: string[] | null;
  grant?: string | null;
  status?: string | null;
  profile_image_url?: string | null;
  activity_start_date?: string | null;
}

// 역할 변경 요청
export interface GrantUpdateRequest { 
  grant: string; 
}

// 상태 변경 요청
export interface StatusUpdateRequest { 
  status: string; 
}


