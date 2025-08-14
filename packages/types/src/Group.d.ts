// Group Types based on backend API schemas
export interface GroupCreateRequest {
  name: string;
  description?: string;
  category: 'STUDY' | 'CASUAL';
  max_members?: number;
  thumbnail_url?: string;
}

export interface GroupUpdateRequest {
  name?: string;
  description?: string;
  category?: 'STUDY' | 'CASUAL';
  max_members?: number;
  thumbnail_url?: string;
}

export interface GroupResponse {
  id: number;
  name: string;
  description?: string;
  category: string;
  max_members?: number;
  thumbnail_url?: string;
  owner_id: string;
}

export interface GroupListResponse {
  total: number;
  items: GroupResponse[];
}

export interface GroupCreateResponse {
  id: number;
}

export interface GroupMemberResponse {
  member_id: string;
  role: string;
}

export interface GroupJoinRequestResponse {
  member_id: string;
  id: number;
}

export interface GroupNoteCreateRequest {
  title: string;
  content: string;
  category?: string;
  post_type?: string;
}

export interface GroupNoteCreateResponse {
  id: number;
  post_id: number;
}
