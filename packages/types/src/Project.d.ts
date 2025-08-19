
export type Project = {
  id: number;
  title: string;
  keywords?: string[] | null;
  description?: string | null;
  status: string;
  github_url?: string | null;
  demo_url?: string | null;
  panel_url?: string | null;
  thumbnail_url?: string | null;
  gen: number;
  meta?: Record<string, any> | null;
  like_count?: number;
  is_liked?: boolean;
};

export type ProjectMember = {
  id: string;
  project_id: number;
  member_id: string;
  role?: string | null;
  contribution?: string | null;
  member_name?: string | null;
  member_gen?: number | null;
};

export type ProjectWithMembers = {
  project: Project;
  members: ProjectMember[];
};

export type MemberProjectHistory = {
  member_id: string;
  total_project: number;
  active_project: number;
  completed_project: number;
  items: ProjectWithMembers[];
};

export type ProjectLike = {
  id: number;
  project_id: number;
  member_id: string;
  created_at: string;
};
