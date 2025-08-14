import { ApiClient } from './apiClient';
import type {
  AdminMemberListRequest,
  AdminMemberListDto,
  BulkUploadMembersRequest,
  BulkUploadMembersDto,
  BulkUpdateMembersRequest,
  BulkUpdateMembersDto,
  BulkDeleteMembersRequest,
  BulkDeleteMembersDto,
  DeleteMemberDto,
  GetSystemStatsDto,
  GetActivityLogsRequest,
  GetActivityLogsDto,
  GetSystemSettingsDto,
  UpdateSystemSettingsRequest,
  UpdateSystemSettingsDto,
  CreateBackupRequest,
  CreateBackupDto,
  GetBackupsDto,
  RestoreBackupRequest,
  RestoreBackupDto,
  SendNotificationRequest,
  SendNotificationDto
} from './dto/admin.dto';

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

  getMembers(params?: AdminMemberListRequest) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.size) searchParams.set('size', String(params.size));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.grant) searchParams.set('grant_filter', params.grant);
    if (params?.gen !== undefined) searchParams.set('gen_filter', String(params.gen));
    if (params?.status) searchParams.set('status_filter', params.status);
    if (params?.school) searchParams.set('school_filter', params.school);
    if (params?.major) searchParams.set('major_filter', params.major);
    if (params?.sort_by) searchParams.set('sort_by', params.sort_by);
    if (params?.sort_order) searchParams.set('sort_order', params.sort_order);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.api.get<AdminMemberListDto>(`${this.base}/members${query}`);
  }

  // 멤버 일괄 업로드
  bulkUploadMembers(data: BulkUploadMembersRequest) {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.overwrite_existing !== undefined) {
      formData.append('overwrite_existing', String(data.overwrite_existing));
    }
    if (data.dry_run !== undefined) {
      formData.append('dry_run', String(data.dry_run));
    }
    return this.api.post<BulkUploadMembersDto>(`${this.base}/members/bulk-upload`, formData);
  }

  // 멤버 일괄 업데이트
  bulkUpdateMembers(data: BulkUpdateMembersRequest) {
    return this.api.put<BulkUpdateMembersDto>(`${this.base}/members/bulk-update`, data);
  }

  // 멤버 삭제
  deleteMember(memberId: string) {
    return this.api.delete<DeleteMemberDto>(`${this.base}/members/${memberId}`);
  }

  // 멤버 일괄 삭제
  bulkDeleteMembers(data: BulkDeleteMembersRequest) {
    return this.api.post<BulkDeleteMembersDto>(`${this.base}/members/bulk-delete`, data);
  }

  // 시스템 통계
  getSystemStats() {
    return this.api.get<GetSystemStatsDto>(`${this.base}/stats`);
  }

  // 활동 로그
  getActivityLogs(params?: GetActivityLogsRequest) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.size) searchParams.set('size', String(params.size));
    if (params?.user_id) searchParams.set('user_id', params.user_id);
    if (params?.action) searchParams.set('action', params.action);
    if (params?.resource_type) searchParams.set('resource_type', params.resource_type);
    if (params?.start_date) searchParams.set('start_date', params.start_date);
    if (params?.end_date) searchParams.set('end_date', params.end_date);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.api.get<GetActivityLogsDto>(`${this.base}/activity-logs${query}`);
  }

  // 시스템 설정
  getSystemSettings() {
    return this.api.get<GetSystemSettingsDto>(`${this.base}/settings`);
  }

  updateSystemSettings(data: UpdateSystemSettingsRequest) {
    return this.api.put<UpdateSystemSettingsDto>(`${this.base}/settings`, data);
  }

  // 백업 관리
  createBackup(data: CreateBackupRequest) {
    return this.api.post<CreateBackupDto>(`${this.base}/backup`, data);
  }

  getBackups() {
    return this.api.get<GetBackupsDto>(`${this.base}/backup`);
  }

  restoreBackup(data: RestoreBackupRequest) {
    return this.api.post<RestoreBackupDto>(`${this.base}/backup/restore`, data);
  }

  // 알림 발송
  sendNotification(data: SendNotificationRequest) {
    return this.api.post<SendNotificationDto>(`${this.base}/notifications`, data);
  }
}


