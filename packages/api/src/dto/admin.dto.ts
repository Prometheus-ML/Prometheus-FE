// 공통 응답 인터페이스
export interface BaseResponse {
  success: boolean;
  message?: string;
}

// 멤버 관리
export interface AdminMemberListRequest {
  page?: number;
  size?: number;
  search?: string;
  gen?: number;
  status?: string;
  grant?: string;
  school?: string;
  major?: string;
  sort_by?: 'name' | 'email' | 'gen' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}

export interface AdminMemberResponse {
  id: string;
  name: string;
  email: string;
  grant: string;
  status: string;
  gen?: number;
  school?: string;
  major?: string;
  student_id?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  profile_image_url?: string;
}

export interface AdminMemberListDto {
  members: AdminMemberResponse[];
  total: number;
  page: number;
  size: number;
}

// 멤버 일괄 업로드
export interface BulkUploadMembersRequest {
  file: File;
  overwrite_existing?: boolean;
  dry_run?: boolean; // 미리보기 모드
}

export interface BulkUploadResult {
  total_rows: number;
  successful_imports: number;
  failed_imports: number;
  errors: Array<{
    row: number;
    email?: string;
    name?: string;
    error: string;
  }>;
  imported_members?: AdminMemberResponse[];
}

export interface BulkUploadMembersDto extends BaseResponse {
  result: BulkUploadResult;
}

// 멤버 일괄 작업
export interface BulkUpdateMembersRequest {
  member_ids: string[];
  updates: {
    status?: string;
    grant?: string;
    gen?: number;
  };
}

export interface BulkUpdateMembersDto extends BaseResponse {
  updated_count: number;
  failed_updates?: Array<{
    member_id: string;
    error: string;
  }>;
}

// 멤버 삭제
export interface DeleteMemberDto extends BaseResponse {}

export interface BulkDeleteMembersRequest {
  member_ids: string[];
}

export interface BulkDeleteMembersDto extends BaseResponse {
  deleted_count: number;
  failed_deletions?: Array<{
    member_id: string;
    error: string;
  }>;
}

// 시스템 통계
export interface SystemStatsResponse {
  total_members: number;
  active_members: number;
  total_project: number;
  active_project: number;
  total_schedules: number;
  upcoming_schedules: number;
  total_coffee_chat_requests: number;
  pending_coffee_chat_requests: number;
  total_events: number;
  active_events: number;
  storage_usage: {
    total_images: number;
    total_size_bytes: number;
    available_space_bytes: number;
  };
  recent_activity: {
    new_members_last_30_days: number;
    new_project_last_30_days: number;
    coffee_chats_last_30_days: number;
  };
}

export interface GetSystemStatsDto extends SystemStatsResponse {}

// 활동 로그
export interface ActivityLogResponse {
  id: number;
  user_id?: string;
  user_name?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface GetActivityLogsRequest {
  page?: number;
  size?: number;
  user_id?: string;
  action?: string;
  resource_type?: string;
  start_date?: string;
  end_date?: string;
}

export interface GetActivityLogsDto {
  logs: ActivityLogResponse[];
  total: number;
  page: number;
  size: number;
}

// 시스템 설정
export interface SystemSettingsResponse {
  maintenance_mode: boolean;
  registration_enabled: boolean;
  coffee_chat_enabled: boolean;
  max_upload_size_mb: number;
  allowed_file_types: string[];
  notification_settings: {
    email_enabled: boolean;
    push_enabled: boolean;
    slack_webhook_url?: string;
  };
  feature_flags: Record<string, boolean>;
}

export interface UpdateSystemSettingsRequest {
  maintenance_mode?: boolean;
  registration_enabled?: boolean;
  coffee_chat_enabled?: boolean;
  max_upload_size_mb?: number;
  allowed_file_types?: string[];
  notification_settings?: {
    email_enabled?: boolean;
    push_enabled?: boolean;
    slack_webhook_url?: string;
  };
  feature_flags?: Record<string, boolean>;
}

export interface GetSystemSettingsDto extends SystemSettingsResponse {}

export interface UpdateSystemSettingsDto extends BaseResponse {
  settings: SystemSettingsResponse;
}

// 백업 및 복원
export interface CreateBackupRequest {
  include_images?: boolean;
  include_logs?: boolean;
  password?: string; // 백업 암호화용
}

export interface BackupResponse {
  id: string;
  filename: string;
  size_bytes: number;
  created_at: string;
  expires_at?: string;
  download_url?: string;
  includes_images: boolean;
  includes_logs: boolean;
}

export interface CreateBackupDto extends BaseResponse {
  backup: BackupResponse;
}

export interface GetBackupsDto {
  backups: BackupResponse[];
  total: number;
}

export interface RestoreBackupRequest {
  backup_id: string;
  password?: string;
  restore_options: {
    restore_members: boolean;
    restore_project: boolean;
    restore_schedules: boolean;
    restore_images: boolean;
    restore_settings: boolean;
  };
}

export interface RestoreBackupDto extends BaseResponse {
  restore_id: string;
  status: 'started' | 'in_progress' | 'completed' | 'failed';
}

// 알림 관리
export interface SendNotificationRequest {
  recipient_type: 'all' | 'gen' | 'status' | 'specific';
  recipients?: string[]; // specific일 때 사용
  gen?: number; // gen일 때 사용
  status?: string; // status일 때 사용
  title: string;
  message: string;
  notification_type: 'push' | 'email' | 'both';
  scheduled_at?: string; // ISO, 예약 발송용
}

export interface SendNotificationDto extends BaseResponse {
  notification_id: string;
  recipient_count: number;
  scheduled: boolean;
}
