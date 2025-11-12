import { ApiClient } from './apiClient';
import type { AdminDashboardResponse } from '@prometheus-fe/types';

export class DashboardApi {
  private readonly api: ApiClient;
  private readonly base = '/admin/dashboard';

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
  }

  // 관리자 대시보드 통계 조회
  getDashboardStats() {
    return this.api.get<AdminDashboardResponse>(`${this.base}`);
  }
}
