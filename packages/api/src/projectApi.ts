import { ApiClient } from './apiClient';
import {
  CreateProjectRequest,
  CreateProjectDto,
  GetprojectRequest,
  GetprojectDto,
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
  GetMemberProjectHistoryRequest,
  GetMemberProjectHistoryDto
} from './dto/project.dto';

export class ProjectApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async create(formData: any): Promise<CreateProjectDto> {
    try {
      // Helper function to ensure proper ISO date format
      const ensureISODate = (dateString: string | null): string | null => {
        if (!dateString) return null;
        
        try {
          // If it's already in ISO format, return as is
          if (dateString.includes('T') || dateString.includes('Z')) {
            return dateString;
          }
          
          // If it's YYYY-MM-DD format, convert to ISO
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return new Date(dateString + 'T00:00:00.000Z').toISOString();
          }
          
          // Try to parse and convert
          const date = new Date(dateString);
          if (isNaN(date.getTime())) {
            throw new Error(`Invalid date format: ${dateString}`);
          }
          return date.toISOString();
        } catch (error) {
          console.warn('Date conversion warning:', error);
          return dateString; // Return original if conversion fails
        }
      };

      // Transform form data to match API requirements
      const data: CreateProjectRequest = {
        title: formData.title.trim(),
        keywords: formData.keywords?.length > 0 ? formData.keywords : null,
        description: formData.description?.trim() || null,
        start_date: ensureISODate(formData.start_date) || formData.start_date,
        end_date: ensureISODate(formData.end_date),
        github_url: formData.github_url?.trim() || null,
        demo_url: formData.demo_url?.trim() || null,
        panel_url: formData.panel_url?.trim() || null,
        gen: formData.gen || 1 // Default to gen 1 if not provided
      };
      
      const response = await this.apiClient.post<CreateProjectDto>('/admin/projects/', data);
      return response;
    } catch (error: any) {
      console.error('Error creating project:', error);
      throw new Error(error.message || 'Failed to create project');
    }
  }

  async list(params?: GetprojectRequest): Promise<GetprojectDto> {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.size) sp.set('size', String(params.size));
      if (params?.gen) sp.set('gen', String(params.gen));
      if (params?.status) sp.set('status', params.status);
      if (params?.search) sp.set('search', params.search);
      if (params?.keywords) sp.set('keywords', params.keywords.join(','));
      if (params?.sort_by) sp.set('sort_by', params.sort_by);
      if (params?.sort_order) sp.set('sort_order', params.sort_order);
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const url = `/projects/${query}`.replace(/\/$/, query ? '/' : '');
      
      const response = await this.apiClient.get<GetprojectDto>(url);
      return response;
    } catch (error: any) {
      console.error('Error fetching project:', error);
      throw new Error(error.message || 'Failed to fetch project');
    }
  }

  async get(projectId: number | string): Promise<GetProjectDto> {
    try {
      const response = await this.apiClient.get<GetProjectDto>(`/projects/${projectId}`);
      return response;
    } catch (error: any) {
      console.error(`Error fetching project ${projectId}:`, error);
      throw new Error(error.message || 'Failed to fetch project');
    }
  }

  async update(projectId: number | string, data: UpdateProjectRequest): Promise<UpdateProjectDto> {
    try {
      const response = await this.apiClient.put<UpdateProjectDto>(`/projects/${projectId}`, data);
      return response;
    } catch (error: any) {
      console.error(`Error updating project ${projectId}:`, error);
      throw new Error(error.message || 'Failed to update project');
    }
  }

  async remove(projectId: number | string): Promise<DeleteProjectDto> {
    try {
      const response = await this.apiClient.delete<DeleteProjectDto>(`/projects/${projectId}`);
      return response;
    } catch (error: any) {
      console.error(`Error deleting project ${projectId}:`, error);
      throw new Error(error.message || 'Failed to delete project');
    }
  }

  async addMember(projectId: number | string, data: AddProjectMemberRequest): Promise<AddProjectMemberDto> {
    try {
      const response = await this.apiClient.post<AddProjectMemberDto>(`/projects/${projectId}/members`, data);
      return response;
    } catch (error: any) {
      console.error(`Error adding member to project ${projectId}:`, error);
      throw new Error(error.message || 'Failed to add project member');
    }
  }

  async listMembers(projectId: number | string, params?: GetProjectMembersRequest): Promise<GetProjectMembersDto> {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.size) sp.set('size', String(params.size));
      if (params?.role) sp.set('role', params.role);
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const url = `/projects/${projectId}/members${query}`;
      
      const response = await this.apiClient.get<GetProjectMembersDto>(url);
      return response;
    } catch (error: any) {
      console.error(`Error fetching members for project ${projectId}:`, error);
      throw new Error(error.message || 'Failed to fetch project members');
    }
  }

  async updateMember(projectId: number | string, memberId: string, data: UpdateProjectMemberRequest): Promise<UpdateProjectMemberDto> {
    try {
      const response = await this.apiClient.put<UpdateProjectMemberDto>(`/projects/${projectId}/members/${memberId}`, data);
      return response;
    } catch (error: any) {
      console.error(`Error updating member ${memberId} in project ${projectId}:`, error);
      throw new Error(error.message || 'Failed to update project member');
    }
  }

  async removeMember(projectId: number | string, memberId: string): Promise<RemoveProjectMemberDto> {
    try {
      const response = await this.apiClient.delete<RemoveProjectMemberDto>(`/projects/${projectId}/members/${memberId}`);
      return response;
    } catch (error: any) {
      console.error(`Error removing member ${memberId} from project ${projectId}:`, error);
      throw new Error(error.message || 'Failed to remove project member');
    }
  }

  async memberHistory(memberId: string, params?: GetMemberProjectHistoryRequest): Promise<GetMemberProjectHistoryDto> {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.size) sp.set('size', String(params.size));
      if (params?.status) sp.set('status', params.status);
      if (params?.gen) sp.set('gen', String(params.gen));
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const url = `/projects/member/${memberId}/history${query}`;
      
      const response = await this.apiClient.get<GetMemberProjectHistoryDto>(url);
      return response;
    } catch (error: any) {
      console.error(`Error fetching project history for member ${memberId}:`, error);
      throw new Error(error.message || 'Failed to fetch member project history');
    }
  }

  // Admin용: 모든 프로젝트 조회 (관리자 전용)
  async listForAdmin(params?: { size?: number }): Promise<GetprojectDto> {
    try {
      const sp = new URLSearchParams();
      if (params?.size) sp.set('size', String(params.size));
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const url = `/admin/projects/${query}`.replace(/\/$/, query ? '/' : '');
      
      const response = await this.apiClient.get<GetprojectDto>(url);
      return response;
    } catch (error: any) {
      console.error('Error fetching projects for admin:', error);
      throw new Error(error.message || 'Failed to fetch projects for admin');
    }
  }

  // getWithMembers 메소드는 백엔드에서 지원하지 않아 제거됨
  // 필요시 get() 메소드와 listMembers() 메소드를 따로 호출하여 조합 사용

  // getStats 메소드는 백엔드에서 지원하지 않아 제거됨

  // search 메소드는 백엔드에서 지원하지 않아 제거됨
  // 필요시 list() 메소드의 search 파라미터 사용 (단, 백엔드에서 실제 검색 기능 구현 필요)
}


