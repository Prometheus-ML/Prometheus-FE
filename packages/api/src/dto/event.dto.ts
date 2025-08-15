// Event API DTO 정의

export interface EventCreateRequest {
  title: string;
  description: string;
  event_type: string;
  current_gen: number;  // gen → current_gen으로 수정
  start_time: string;   // start_date → start_time으로 수정
  end_time: string;     // end_date → end_time으로 수정
  location: string;
  is_attendance_required: boolean;  // 출석 필수 여부 필드 추가
  meta?: any;           // meta 필드 추가
}

export interface EventUpdateRequest {
  title?: string;
  description?: string;
  event_type?: string;
  current_gen?: number;  // gen → current_gen으로 수정
  start_time?: string;   // start_date → start_time으로 수정
  end_time?: string;     // end_date → end_time으로 수정
  location?: string;
  is_attendance_required?: boolean;  // 출석 필수 여부 필드 추가
  meta?: any;            // meta 필드 추가
}

export interface EventResponse {
  id: number;
  title: string;
  description: string;
  event_type: string;
  current_gen: number;  // gen → current_gen으로 수정
  start_time: string;   // start_date → start_time으로 수정
  end_time: string;     // end_date → end_time으로 수정
  location: string;
  is_attendance_required: boolean;  // 출석 필수 여부 필드 추가
  meta?: any;           // meta 필드 추가
  created_at: string;
  updated_at: string;
}

export interface EventListRequest {
  page?: number;
  size?: number;
  current_gen?: number;  // gen → current_gen으로 수정
  event_type?: string;
  is_attendance_required?: boolean | string;  // 출석 필수 여부 필터 추가 (string도 허용하여 폼 상태와 호환)
  start_date?: string;   // 필터용으로 유지 (YYYY-MM-DD 형식)
  end_date?: string;     // 필터용으로 유지 (YYYY-MM-DD 형식)
}

export interface EventListResponse {
  events: EventResponse[];
  total: number;
}

// Attendance 관련 DTO
export interface AttendanceCreateRequest {
  member_id: string;     // number → string으로 수정
  status: 'present' | 'absent' | 'late' | 'excused';
  reason?: string;        // notes → reason으로 수정
}

export interface AttendanceUpdateRequest {
  status?: 'present' | 'absent' | 'late' | 'excused';
  reason?: string;        // notes → reason으로 수정
}

export interface BulkAttendanceCreateRequest {
  attendances: {
    member_id: string;    // number → string으로 수정
    status: 'present' | 'absent' | 'late' | 'excused';
    reason?: string;      // notes → reason으로 수정
  }[];
}

export interface AttendanceResponse {
  id: number;
  event_id: number;
  member_id: string;     // number → string으로 수정
  member_name: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  reason?: string;        // notes → reason으로 수정
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
