import { ApiClient } from './apiClient';
import type {
  ProjectCreateRequest,
  ProjectUpdateRequest,
  ProjectResponse,
  ProjectListResponse,
  ProjectMemberCreateRequest,
  ProjectMemberUpdateRequest,
  ProjectMemberResponse,
  ProjectMemberListResponse,
  MemberProjectHistoryResponse,
} from '@prometheus-fe/types';

export class ProjectsApi {
  private readonly api: ApiClient;
  private readonly base = '/v1/projects';

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
  }

  create(data: ProjectCreateRequest) {
    return this.api.post<ProjectResponse>(`${this.base}/`, data);
  }

  list(params?: Record<string, string | number | undefined>) {
    const sp = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => { if (v !== undefined && v !== null) sp.set(k, String(v)); });
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return this.api.get<ProjectListResponse>(`${this.base}/${q ? q : ''}`.replace(/\/$/, q ? '/' : ''));
  }

  get(projectId: number | string) {
    return this.api.get<ProjectResponse>(`${this.base}/${projectId}`);
  }

  update(projectId: number | string, data: ProjectUpdateRequest) {
    return this.api.put<ProjectResponse>(`${this.base}/${projectId}`, data);
  }

  remove(projectId: number | string) {
    return this.api.delete<void>(`${this.base}/${projectId}`);
  }

  addMember(projectId: number | string, data: ProjectMemberCreateRequest) {
    return this.api.post<ProjectMemberResponse>(`${this.base}/${projectId}/members`, data);
  }

  listMembers(projectId: number | string, params?: Record<string, string | number | undefined>) {
    const sp = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => { if (v !== undefined && v !== null) sp.set(k, String(v)); });
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return this.api.get<ProjectMemberListResponse>(`${this.base}/${projectId}/members${q}`);
  }

  updateMember(projectId: number | string, memberId: string, data: ProjectMemberUpdateRequest) {
    return this.api.put<ProjectMemberResponse>(`${this.base}/${projectId}/members/${memberId}`, data);
  }

  removeMember(projectId: number | string, memberId: string) {
    return this.api.delete<void>(`${this.base}/${projectId}/members/${memberId}`);
  }

  memberHistory(memberId: string) {
    return this.api.get<MemberProjectHistoryResponse>(`${this.base}/member/${memberId}/history`);
  }
}


