// Event 관련 타입 정의

export interface Event {
  id: number;
  title: string;
  description: string;
  event_type: string;
  current_gen: number;  // gen → current_gen으로 수정
  start_time: string;   // start_date → start_time으로 수정
  end_time: string;     // end_date → end_time으로 수정
  location: string;
  is_attendance_required: boolean;  // 출석 필수 여부 필드 추가
  meta?: any;           // 백엔드에 있는 meta 필드 추가
  created_at: string;
  updated_at: string;
}

export interface EventSummary {
  id: number;
  title: string;
  event_type: string;
  current_gen: number;  // gen → current_gen으로 수정
  start_time: string;   // start_date → start_time으로 수정
  end_time: string;     // end_date → end_time으로 수정
  location: string;
  is_attendance_required: boolean;  // 출석 필수 여부 필드 추가
  meta?: any;           // meta 필드 추가
}

export interface EventFilters {
  current_gen?: number;  // gen → current_gen으로 수정
  event_type?: string;
  is_attendance_required?: boolean;  // 출석 필수 여부 필터 추가
  start_date?: string;   // 필터용으로 유지 (YYYY-MM-DD 형식)
  end_date?: string;     // 필터용으로 유지 (YYYY-MM-DD 형식)
}

export interface EventListParams {
  page?: number;
  size?: number;
  current_gen?: number;  // gen → current_gen으로 수정
  event_type?: string;
  is_attendance_required?: boolean | string;  // 출석 필수 여부 필터 추가 (string도 허용하여 폼 상태와 호환)
  start_date?: string;   // 필터용으로 유지
  end_date?: string;     // 필터용으로 유지
}

export interface EventListResponse {
  events: EventSummary[];
  total: number;
}

// Attendance 관련 타입
export interface Attendance {
  id: number;
  event_id: number;
  member_id: string;     // number → string으로 수정 (백엔드와 일치)
  member_name: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  checked_in_at?: string;  // check_in_time → checked_in_at으로 수정
  reason?: string;          // notes → reason으로 수정
  created_at: string;
  updated_at: string;
}

export interface AttendanceFilters {
  status_filter?: string;
  member_id_filter?: string;
}

export interface AttendanceListResponse {
  attendances: Attendance[];
  total: number;
}

// Event 타입 옵션
export const EVENT_TYPES = [
  'meeting',
  'study',
  'project',
  'workshop',
  'seminar',
  'conference',
  'social',
  'other'
] as const;

export type EventType = typeof EVENT_TYPES[number];

// Attendance 상태 옵션
export const ATTENDANCE_STATUSES = [
  'present',
  'absent',
  'late',
  'excused'
] as const;

export type AttendanceStatus = typeof ATTENDANCE_STATUSES[number];
