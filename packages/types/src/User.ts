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

export interface UserPublicListResponse {
  users: UserPublic[];
  total: number;
  page: number;
  size: number;
}

export interface UserPrivate {
  id: string;
  name: string;
  profile_image_url?: string | null;
  gen?: number | null;
  school?: string | null;
  major?: string | null;
  student_id?: string | null;
  github?: string | null;
  notion?: string | null;
  figma?: string | null;
  mbti?: string | null;
  self_introduction?: string | null;
  additional_career?: string | null;
  coffee_chat_enabled?: boolean | null;
  active_gens?: number[] | null;
  history?: string[] | null;
  status?: string | null;
  meta?: Record<string, any> | null;
}

export interface UserPrivateListResponse {
  users: UserPrivate[];
  total: number;
  page: number;
  size: number;
}

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

export interface MyProfileUpdateRequest {
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
}

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

export interface GrantUpdateRequest { grant: string; }
export interface StatusUpdateRequest { status: string; }


