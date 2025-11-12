// Admin Dashboard Types
export interface AdminDashboardResponse {
  member_stats: AdminMemberStats;
  project_stats: AdminProjectStats;
  event_stats: AdminEventStats;
  group_stats: AdminGroupStats;
  post_stats: AdminPostStats;
  system_stats: AdminSystemStats;
}

export interface AdminMemberStats {
  total_members: number;
  members_by_grant: Record<string, number>; // 권한별 회원 수
  members_by_gen: Record<string, number>; // 기수별 회원 수
  recent_registrations: AdminRecentRegistration[];
}

export interface AdminRecentRegistration {
  id: string;
  name: string;
  email: string;
  gen: number;
  grant: string;
  status: string;
}

export interface AdminProjectStats {
  total_projects: number;
  projects_by_gen: Record<string, number>; // 기수별 프로젝트 수
  projects_by_status: Record<string, number>; // 상태별 프로젝트 수
}

export interface AdminEventStats {
  total_events: number;
  events_by_gen: Record<string, number>; // 기수별 이벤트 수
}

export interface AdminGroupStats {
  total_groups: number;
  groups_by_category: Record<string, number>; // 카테고리별 모임 수
}

export interface AdminPostStats {
  total_posts: number;
  posts_by_category: Record<string, number>; // 카테고리별 게시글 수
  recent_posts: AdminRecentPost[];
}

export interface AdminRecentPost {
  id: number;
  title: string;
  category: string;
  author_id: string;
  created_at: string;
}

export interface AdminSystemStats {
  blacklisted_users: number;
  pending_approvals: number;
}
