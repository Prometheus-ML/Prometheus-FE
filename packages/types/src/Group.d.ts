export interface Group {
  id: number;
  name: string;
  description?: string;
  category: string;
  max_members?: number;
  thumbnail_url?: string;
  owner_id: string;
}

export interface GroupMember {
  member_id: string;
  role: string;
}

export interface GroupJoinRequest {
  member_id: string;
  id: number;
}

export interface GroupNote {
  id: number;
  post_id: number;
  title: string;
  content: string;
  category?: string;
  post_type?: string;
}
