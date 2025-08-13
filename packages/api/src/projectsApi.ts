import { ApiClient } from './apiClient';
import type {
  CreateProjectRequest,
  CreateProjectDto,
  GetProjectsRequest,
  GetProjectsDto,
  GetProjectDto,
  UpdateProjectRequest,
  UpdateProjectDto,
  DeleteProjectDto,
  AddProjectMemberRequest,
  AddProjectMemberDto,
  GetProjectMembersRequest,
  GetProjectMembersDto,
  UpdateProjectMemberRequest,
  UpdateProjectMemberDto,
  RemoveProjectMemberDto,
  GetProjectWithMembersDto,
  GetMemberProjectHistoryRequest,
  GetMemberProjectHistoryDto,
  GetProjectStatsDto,
  SearchProjectsRequest,
  SearchProjectsDto
} from './dto/project.dto';

export class ProjectsApi {
  private readonly api: ApiClient;
  private readonly base = '/projects';

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
  }

  create(data: CreateProjectRequest) {
    return this.api.post<CreateProjectDto>(`${this.base}/`, data);
  }

  list(params?: GetProjectsRequest) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.size) sp.set('size', String(params.size));
    if (params?.gen) sp.set('gen', String(params.gen));
    if (params?.status) sp.set('status', params.status);
    if (params?.search) sp.set('search', params.search);
    if (params?.keywords) sp.set('keywords', params.keywords.join(','));
    if (params?.sort_by) sp.set('sort_by', params.sort_by);
    if (params?.sort_order) sp.set('sort_order', params.sort_order);
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return this.api.get<GetProjectsDto>(`${this.base}/${q ? q : ''}`.replace(/\/$/, q ? '/' : ''));
  }

  get(projectId: number | string) {
    return this.api.get<GetProjectDto>(`${this.base}/${projectId}`);
  }

  update(projectId: number | string, data: UpdateProjectRequest) {
    return this.api.put<UpdateProjectDto>(`${this.base}/${projectId}`, data);
  }

  remove(projectId: number | string) {
    return this.api.delete<DeleteProjectDto>(`${this.base}/${projectId}`);
  }

  addMember(projectId: number | string, data: AddProjectMemberRequest) {
    return this.api.post<AddProjectMemberDto>(`${this.base}/${projectId}/members`, data);
  }

  listMembers(projectId: number | string, params?: GetProjectMembersRequest) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.size) sp.set('size', String(params.size));
    if (params?.role) sp.set('role', params.role);
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return this.api.get<GetProjectMembersDto>(`${this.base}/${projectId}/members${q}`);
  }

  updateMember(projectId: number | string, memberId: string, data: UpdateProjectMemberRequest) {
    return this.api.put<UpdateProjectMemberDto>(`${this.base}/${projectId}/members/${memberId}`, data);
  }

  removeMember(projectId: number | string, memberId: string) {
    return this.api.delete<RemoveProjectMemberDto>(`${this.base}/${projectId}/members/${memberId}`);
  }

  memberHistory(memberId: string, params?: GetMemberProjectHistoryRequest) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.size) sp.set('size', String(params.size));
    if (params?.status) sp.set('status', params.status);
    if (params?.gen) sp.set('gen', String(params.gen));
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return this.api.get<GetMemberProjectHistoryDto>(`${this.base}/member/${memberId}/history${q}`);
  }

  // 프로젝트와 멤버 함께 조회
  getWithMembers(projectId: number | string) {
    return this.api.get<GetProjectWithMembersDto>(`${this.base}/${projectId}/with-members`);
  }

  // 프로젝트 통계
  getStats() {
    return this.api.get<GetProjectStatsDto>(`${this.base}/stats`);
  }

  // 프로젝트 검색
  search(params: SearchProjectsRequest) {
    const body = {
      query: params.query,
      page: params.page,
      size: params.size,
      filters: params.filters
    };
    return this.api.post<SearchProjectsDto>(`${this.base}/search`, body);
  }
}


