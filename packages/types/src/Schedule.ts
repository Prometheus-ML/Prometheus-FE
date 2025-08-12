export interface ScheduleCreateRequest {
  title: string;
  description?: string | null;
  start_time: string; // ISO
  end_time: string; // ISO
  location?: string | null;
  event_type: string;
  is_attendance_required: boolean;
  current_gen: number;
  meta?: Record<string, any> | null;
}

export interface ScheduleUpdateRequest {
  title?: string | null;
  description?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  event_type?: string | null;
  is_attendance_required?: boolean | null;
  current_gen?: number | null;
  meta?: Record<string, any> | null;
}

export interface ScheduleResponse {
  id: number;
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  location?: string | null;
  event_type: string;
  is_attendance_required: boolean;
  current_gen: number;
  meta?: Record<string, any> | null;
}

export interface ScheduleListResponse {
  schedules: ScheduleResponse[];
  total: number;
  page: number;
  size: number;
}

export interface AttendanceCreateRequest {
  member_id: string;
  status: string; // present, absent, late, excused, unknown
  reason?: string | null;
}

export interface AttendanceUpdateRequest {
  status?: string | null;
  reason?: string | null;
}

export interface AttendanceResponse {
  id: number;
  schedule_id: number;
  member_id: string;
  member_name?: string | null;
  status: string;
  reason?: string | null;
  checked_in_at?: string | null;
}

export interface AttendanceListResponse {
  attendances: AttendanceResponse[];
  total: number;
}

export interface AttendanceStatsResponse {
  total_members: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendance_rate: number;
}


