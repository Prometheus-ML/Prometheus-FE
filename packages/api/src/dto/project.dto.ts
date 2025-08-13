import {
  Project,
  ProjectMember,
  ProjectWithMembers,
  MemberProjectHistory
} from '@prometheus-fe/types';

// 공통 응답 인터페이스
export interface BaseResponse {
  success: boolean;
  message?: string;
}

// 프로젝트 생성
export interface CreateProjectRequest {
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

export interface CreateProjectDto extends BaseResponse {
  project: Project;
}

// 프로젝트 목록 조회
export interface GetProjectsRequest {
  page?: number;
  size?: number;
  gen?: number;
  status?: string;
  search?: string;
  keywords?: string[];
  sort_by?: 'created_at' | 'start_date' | 'end_date' | 'title';
  sort_order?: 'asc' | 'desc';
}

export interface GetProjectsDto {
  projects: Project[];
  total: number;
  page: number;
  size: number;
}

// 프로젝트 상세 조회
export interface GetProjectDto extends Project {}

// 프로젝트 업데이트
export interface UpdateProjectRequest {
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

export interface UpdateProjectDto extends BaseResponse {
  project: Project;
}

// 프로젝트 삭제
export interface DeleteProjectDto extends BaseResponse {}

// 프로젝트 멤버 추가
export interface AddProjectMemberRequest {
  member_id: string;
  role?: string | null;
  contribution?: string | null;
}

export interface AddProjectMemberDto extends BaseResponse {
  member: ProjectMember;
}

// 프로젝트 멤버 목록 조회
export interface GetProjectMembersRequest {
  page?: number;
  size?: number;
  role?: string;
}

export interface GetProjectMembersDto {
  members: ProjectMember[];
  total: number;
  page: number;
  size: number;
}

// 프로젝트 멤버 정보 업데이트
export interface UpdateProjectMemberRequest {
  role?: string | null;
  contribution?: string | null;
}

export interface UpdateProjectMemberDto extends BaseResponse {
  member: ProjectMember;
}

// 프로젝트 멤버 제거
export interface RemoveProjectMemberDto extends BaseResponse {}

// 프로젝트와 멤버 함께 조회
export interface GetProjectWithMembersDto extends ProjectWithMembers {}

// 멤버의 프로젝트 히스토리
export interface GetMemberProjectHistoryRequest {
  page?: number;
  size?: number;
  status?: string;
  gen?: number;
}

export interface GetMemberProjectHistoryDto extends MemberProjectHistory {}

// 프로젝트 통계
export interface ProjectStatsResponse {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  projects_by_gen: Record<number, number>;
  projects_by_status: Record<string, number>;
  popular_keywords: Array<{ keyword: string; count: number }>;
  completion_rate: number;
}

export interface GetProjectStatsDto extends ProjectStatsResponse {}

// 프로젝트 검색
export interface SearchProjectsRequest {
  query: string;
  page?: number;
  size?: number;
  filters?: {
    gen?: number[];
    status?: string[];
    keywords?: string[];
    date_range?: {
      start?: string;
      end?: string;
    };
  };
}

export interface SearchProjectsDto {
  projects: Project[];
  total: number;
  page: number;
  size: number;
}
