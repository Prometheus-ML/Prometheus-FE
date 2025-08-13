// 기본 프로젝트 엔티티 (DTO에서 확장하여 사용)
export interface Project {
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

// 기본 프로젝트 멤버 엔티티 (DTO에서 확장하여 사용)
export interface ProjectMember {
  id: string;
  project_id: number;
  member_id: string;
  role?: string | null;
  contribution?: string | null;
}

// 프로젝트와 멤버 조합 타입
export interface ProjectWithMembers {
  project: Project;
  members: ProjectMember[];
}

// 멤버의 프로젝트 히스토리
export interface MemberProjectHistory {
  member_id: string;
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  items: ProjectWithMembers[];
}


