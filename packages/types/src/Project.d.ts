
export type Project = {
  id: number;
  title: string;
  keywords?: string[] | null;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status: string;
  github_url?: string | null;
  demo_url?: string | null;
  panel_url?: string | null;
  thumbnail_url?: string | null;
  gen: number;
  meta?: Record<string, any> | null;
};

export type ProjectMember = {
  id: string;
  project_id: number;
  member_id: string;
  role?: string | null;
  contribution?: string | null;
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
