// Admin Member Management Types

export interface AdminMemberResponse {
  id: string;
  name: string;
  email: string;
  gen: number;
  grant: string;
  status: 'active' | 'alumni' | 'blacklist';
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
  coffee_chat_enabled?: boolean;
  active_gens?: number[];
  profile_image_url?: string;
  activity_start_date?: string;
  meta?: Record<string, any>;
}

export interface AdminMemberListResponse {
  members: AdminMemberResponse[];
  total: number;
  page: number;
  size: number;
}

export interface AdminMemberCreateRequest {
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
  status?: 'active' | 'alumni' | 'blacklist';
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

export interface AdminMemberUpdateRequest {
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
  status?: 'active' | 'alumni' | 'blacklist';
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

export interface AdminBulkMemberCreateRequest {
  members: AdminMemberCreateRequest[];
}

export interface AdminBulkMemberUpdateRequest {
  member_ids: string[];
  updates: AdminMemberUpdateRequest;
}

export interface AdminMemberStatsResponse {
  total_members: number;
  members_by_grant: Record<string, number>;
  members_by_gen: Record<string, number>;
  members_by_status: Record<string, number>;
  active_members: number;
  recent_members: AdminMemberResponse[];
}

export interface AdminMemberSearchParams {
  page?: number;
  size?: number;
  search?: string;
  grant_filter?: string;
  gen_filter?: number;
  status_filter?: string;
  active_gens_filter?: string;
}

export interface AdminApiError {
  detail: string;
}

// // Project Management Types (placeholder for future)
// export interface ProjectResponse {
//   id: string;
//   name: string;
//   description?: string;
//   status: 'active' | 'completed' | 'on_hold';
//   created_at: string;
//   updated_at: string;
// }

// // Post Management Types (placeholder for future)
// export interface PostResponse {
//   id: string;
//   title: string;
//   content: string;
//   author_id: string;
//   status: 'published' | 'draft' | 'archived';
//   created_at: string;
//   updated_at: string;
// }

// // Blacklist Management Types (placeholder for future)
// export interface BlacklistResponse {
//   id: string;
//   member_id: string;
//   reason: string;
//   created_at: string;
//   created_by: string;
// }
