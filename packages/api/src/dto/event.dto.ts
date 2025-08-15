// Event API DTO 정의

export interface EventCreateRequest {
  title: string;
  description: string;
  event_type: string;
  gen: number;
  is_attendance_required: boolean;
  start_date: string;
  end_date: string;
  location: string;
  max_participants: number;
}

export interface EventUpdateRequest {
  title?: string;
  description?: string;
  event_type?: string;
  gen?: number;
  is_attendance_required?: boolean;
  start_date?: string;
  end_date?: string;
  location?: string;
  max_participants?: number;
}

export interface EventResponse {
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

export interface EventListRequest {
  page?: number;
  size?: number;
  gen?: number;
  event_type?: string;
  is_attendance_required?: boolean;
  start_date?: string;
  end_date?: string;
}

export interface EventListResponse {
  events: EventResponse[];
  total: number;
}

// Attendance 관련 DTO
export interface AttendanceCreateRequest {
  member_id: number;
  status: 'present' | 'absent' | 'late' | 'excused';
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
}

export interface AttendanceUpdateRequest {
  status?: 'present' | 'absent' | 'late' | 'excused';
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
}

export interface BulkAttendanceCreateRequest {
  attendances: {
    member_id: number;
    status: 'present' | 'absent' | 'late' | 'excused';
    check_in_time?: string;
    check_out_time?: string;
    notes?: string;
  }[];
}

export interface AttendanceResponse {
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

export interface AttendanceListRequest {
  status_filter?: string;
  member_id_filter?: string;
}

export interface AttendanceListResponse {
  attendances: AttendanceResponse[];
  total: number;
}
