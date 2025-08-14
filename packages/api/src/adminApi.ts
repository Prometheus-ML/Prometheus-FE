import { ApiClient } from './apiClient';
import type {
  AdminMemberListResponse,
  AdminMemberResponse,
  AdminMemberCreateRequest,
  AdminMemberUpdateRequest,
  AdminBulkMemberCreateRequest,
  AdminBulkMemberUpdateRequest,
  AdminMemberStatsResponse,
  AdminMemberSearchParams
} from '@prometheus-fe/types';

export interface PendingApprovalsResponse {
  users: Array<{
    id: string;
    name?: string | null;
    email?: string | null;
    student_id?: string | null;
    phone?: string | null;
    grant?: string | null;
    gen?: number | null;
    status?: string | null;
    created_at?: string | null;
  }>;
  total: number;
  page: number;
  size: number;
}

export class AdminApi {
  private readonly api: ApiClient;
  private readonly base = '/admin';

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
  }

  // 기존 메서드 유지
  getPendingApprovals(params?: { page?: number; size?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.size) searchParams.set('size', String(params.size));
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.api.get<PendingApprovalsResponse>(`${this.base}/pending-approvals${query}`);
  }

  // 멤버 관리 API
  getMembers(params?: AdminMemberSearchParams) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.size) searchParams.set('size', String(params.size));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.grant_filter) searchParams.set('grant_filter', params.grant_filter);
    if (params?.gen_filter !== undefined) searchParams.set('gen_filter', String(params.gen_filter));
    if (params?.status_filter) searchParams.set('status_filter', params.status_filter);
    if (params?.active_gens_filter) searchParams.set('active_gens_filter', params.active_gens_filter);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.api.get<AdminMemberListResponse>(`${this.base}/member-list${query}`);
  }

  getMember(memberId: string) {
    return this.api.get<AdminMemberResponse>(`${this.base}/${memberId}`);
  }

  createMember(data: AdminMemberCreateRequest) {
    return this.api.post<AdminMemberResponse>(`${this.base}/members/create`, data);
  }

  updateMember(memberId: string, data: AdminMemberUpdateRequest) {
    return this.api.put<AdminMemberResponse>(`${this.base}/members/update/${memberId}`, data);
  }

  deleteMember(memberId: string) {
    return this.api.delete<{ message: string }>(`${this.base}/members/delete/${memberId}`);
  }

  bulkCreateMembers(data: AdminBulkMemberCreateRequest) {
    return this.api.post<{
      message: string;
      created_count: number;
      failed_creations: Array<{ email: string; error: string }>;
    }>(`${this.base}/members/bulk-create`, data);
  }

  bulkUpdateMembers(data: AdminBulkMemberUpdateRequest) {
    return this.api.post<{
      message: string;
      updated_count: number;
      failed_updates: Array<{ member_id: string; error: string }>;
    }>(`${this.base}/members/bulk-update`, data);
  }

  getMemberStats() {
    return this.api.get<AdminMemberStatsResponse>(`${this.base}/members/stats`);
  }
}


