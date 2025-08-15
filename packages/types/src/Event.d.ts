// Event 관련 타입 정의

export interface Event {
  id: number;
  title: string;
  description: string;
  event_type: string;
  gen: number;
  is_attendance_required: boolean;
  start_date: string;
  end_date: string;
  location: string;
  max_participants: number;
  current_participants: number;
  created_at: string;
  updated_at: string;
}

export interface EventSummary {
  id: number;
  title: string;
  event_type: string;
  gen: number;
  is_attendance_required: boolean;
  start_date: string;
  end_date: string;
  location: string;
  max_participants: number;
  current_participants: number;
}

export interface EventFilters {
  gen?: number;
  event_type?: string;
  is_attendance_required?: boolean;
  start_date?: string;
  end_date?: string;
}

export interface EventListParams {
  page?: number;
  size?: number;
  gen?: number;
  event_type?: string;
  is_attendance_required?: boolean;
  start_date?: string;
  end_date?: string;
}

export interface EventListResponse {
  events: EventSummary[];
  total: number;
}

// Attendance 관련 타입
export interface Attendance {
  id: number;
  event_id: number;
  member_id: number;
  member_name: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
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
