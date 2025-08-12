export interface ProjectCreateRequest {
  title: string;
  keywords?: string[] | null;
  description?: string | null;
  start_date: string; // ISO
  end_date?: string | null; // ISO
  github_url?: string | null;
  demo_url?: string | null;
  panel_url?: string | null;
  gen: number;
}

export interface ProjectUpdateRequest {
  title?: string | null;
  keywords?: string[] | null;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
  github_url?: string | null;
  demo_url?: string | null;
  panel_url?: string | null;
  gen?: number | null;
}

export interface ProjectResponse {
  id: number;
  title: string;
  keywords?: string[] | null;
  description?: string | null;
  start_date: string;
  end_date?: string | null;
  status: string;
  github_url?: string | null;
  demo_url?: string | null;
  panel_url?: string | null;
  gen: number;
  meta?: Record<string, any> | null;
}

export interface ProjectListResponse {
  projects: ProjectResponse[];
  total: number;
  page: number;
  size: number;
}

export interface ProjectMemberCreateRequest {
  member_id: string;
  role?: string | null;
  contribution?: string | null;
}

export interface ProjectMemberUpdateRequest {
  role?: string | null;
  contribution?: string | null;
}

export interface ProjectMemberResponse {
  id: string;
  project_id: number;
  member_id: string;
  role?: string | null;
  contribution?: string | null;
}

export interface ProjectMemberListResponse {
  members: ProjectMemberResponse[];
  total: number;
  page: number;
  size: number;
}

export interface ProjectWithMembersResponse {
  project: ProjectResponse;
  members: ProjectMemberResponse[];
}

export interface MemberProjectHistoryResponse {
  member_id: string;
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  items: ProjectWithMembersResponse[];
}


