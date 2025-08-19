export interface Group {
  id: number;
  name: string;
  description?: string;
  category: string;
  max_members?: number;
  thumbnail_url?: string;
  owner_id: string;
  owner_name: string;
  owner_gen: number;
  like_count?: number;
}

export interface GroupMember {
  member_id: string;
  role: string;
  name: string;
  gen: number;
}

export interface GroupJoinRequest {
  member_id: string;
  id: number;
  name: string;
  gen: number;
}

export interface GroupNote {
  id: number;
  post_id: number;
  title: string;
  content: string;
  category?: string;
  post_type?: string;
}

export interface GroupLike {
  id: number;
  group_id: number;
  member_id: string;
  created_at: string;
}

export interface GroupLikeToggleResponse {
  liked: boolean;
  like_count: number;
  message: string;
}

export interface GroupLikeInfo {
  like_count: number;
  recent_likers: Array<{
    member_id: string;
    name: string;
    gen: number;
    liked_at: string;
  }>;
}
