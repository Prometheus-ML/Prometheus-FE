import { ApiClient } from './apiClient';

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

  getPendingApprovals(params?: { page?: number; size?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.size) searchParams.set('size', String(params.size));
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.api.get<PendingApprovalsResponse>(`${this.base}/pending-approvals${query}`);
  }

  getMembers(params?: {
    page?: number;
    size?: number;
    search?: string;
    grant_filter?: string;
    gen_filter?: number;
    status_filter?: string;
    active_gens_filter?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.size) searchParams.set('size', String(params.size));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.grant_filter) searchParams.set('grant_filter', params.grant_filter);
    if (params?.gen_filter !== undefined) searchParams.set('gen_filter', String(params.gen_filter));
    if (params?.status_filter) searchParams.set('status_filter', params.status_filter);
    if (params?.active_gens_filter) searchParams.set('active_gens_filter', params.active_gens_filter);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.api.get<{ members: any[]; total: number; page: number; size: number }>(`${this.base}/members${query}`);
  }
}


