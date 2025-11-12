// Admin Dashboard DTOs
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
  members_by_grant: Record<string, number>;
  members_by_gen: Record<string, number>;
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
  projects_by_gen: Record<string, number>;
  projects_by_status: Record<string, number>;
}

export interface AdminEventStats {
  total_events: number;
  events_by_gen: Record<string, number>;
}

export interface AdminGroupStats {
  total_groups: number;
  groups_by_category: Record<string, number>;
}

export interface AdminPostStats {
  total_posts: number;
  posts_by_category: Record<string, number>;
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
