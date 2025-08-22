/**
 * 이벤트 API 요청/응답 DTO 타입 정의
 * 
 * 백엔드 schemas/event.py와 대응되는 프론트엔드 DTO 타입
 */

/**
 * 이벤트 생성 요청 DTO
 */
export interface CreateEventRequest {
  title: string;
  description?: string;
  start_time: string; // ISO 8601 형식
  end_time: string;   // ISO 8601 형식
  location?: string;
  event_type: string;
  is_attendance_required: boolean;
  current_gen: number;
  attendance_start_time?: string; // ISO 8601 형식
  attendance_end_time?: string;   // ISO 8601 형식
  late_threshold_minutes: number;
  is_attendance_code_required: boolean;
  meta?: Record<string, any>;
}

/**
 * 이벤트 수정 요청 DTO
 */
export interface UpdateEventRequest {
  title?: string;
  description?: string;
  start_time?: string; // ISO 8601 형식
  end_time?: string;   // ISO 8601 형식
  location?: string;
  event_type?: string;
  is_attendance_required?: boolean;
  current_gen?: number;
  attendance_start_time?: string; // ISO 8601 형식
  attendance_end_time?: string;   // ISO 8601 형식
  late_threshold_minutes?: number;
  is_attendance_code_required?: boolean;
  meta?: Record<string, any>;
}

/**
 * 이벤트 응답 DTO
 */
export interface EventResponseDto {
  id: number;
  title: string;
  description?: string;
  start_time: string; // ISO 8601 형식
  end_time: string;   // ISO 8601 형식
  location?: string;
  event_type: string;
  is_attendance_required: boolean;
  current_gen: number;
  attendance_start_time?: string; // ISO 8601 형식
  attendance_end_time?: string;   // ISO 8601 형식
  late_threshold_minutes: number;
  is_attendance_code_required: boolean;
  has_attendance_code: boolean;
  meta?: Record<string, any>;
}

/**
 * 이벤트 목록 응답 DTO
 */
export interface EventListResponseDto {
  events: EventResponseDto[];
  total: number;
  page: number;
  size: number;
}

/**
 * 출석 체크 요청 DTO
 */
export interface CheckInAttendanceRequest {
  attendance_code?: string;
}

/**
 * 출석 생성 요청 DTO
 */
export interface CreateAttendanceRequest {
  member_id: string;
  status: string; // 'present' | 'absent' | 'late' | 'excused' | 'unknown'
  reason?: string;
}

/**
 * 출석 수정 요청 DTO
 */
export interface UpdateAttendanceRequest {
  status?: string;
  reason?: string;
}

/**
 * 출석 응답 DTO
 */
export interface AttendanceResponseDto {
  id: number;
  event_id: number;
  member_id: string;
  member_name?: string;
  status: string;
  reason?: string;
  checked_in_at?: string; // ISO 8601 형식
}

/**
 * 출석 목록 응답 DTO
 */
export interface AttendanceListResponseDto {
  attendances: AttendanceResponseDto[];
  total: number;
}

/**
 * 대량 출석 생성 요청 DTO
 */
export interface BulkAttendanceCreateRequest {
  attendances: CreateAttendanceRequest[];
}

/**
 * 대량 출석 생성 응답 DTO
 */
export interface BulkAttendanceResponseDto {
  message: string;
  created: number;
  updated: number;
  errors: string[];
}

/**
 * 출석 통계 응답 DTO
 */
export interface AttendanceStatsResponseDto {
  total_members: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendance_rate: number;
}

/**
 * 출석 코드 생성 요청 DTO
 */
export interface GenerateAttendanceCodeRequest {
  // 빈 객체 (API 명세서에 따름)
}

/**
 * 출석 코드 응답 DTO
 */
export interface AttendanceCodeResponseDto {
  event_id: number;
  attendance_code: string;
  is_attendance_code_required: boolean;
  created_at: string; // ISO 8601 형식
}

/**
 * 출석 코드 확인 요청 DTO
 */
export interface CheckAttendanceCodeRequest {
  attendance_code: string;
}

/**
 * 출석 코드 확인 응답 DTO
 */
export interface CheckAttendanceCodeResponseDto {
  is_valid: boolean;
  message: string;
}

/**
 * 참여자 추가 요청 DTO
 */
export interface AddParticipantsRequestDto {
  member_ids: string[];
}

/**
 * 참여자 제거 요청 DTO
 */
export interface RemoveParticipantsRequestDto {
  member_ids: string[];
}

/**
 * 참여자 추가/제거 응답 DTO
 */
export interface ParticipantResultDto {
  message: string;
  added?: number;
  removed?: number;
  already_exists?: number;
  not_found?: number;
  errors: string[];
}

/**
 * 참여자 정보 DTO
 */
export interface ParticipantDto {
  event_id: number;
  member_id: string;
  member_name?: string;
  member_gen?: number;
  status: string;
  added_at: string; // ISO 8601 형식
}

/**
 * 참여자 목록 응답 DTO
 */
export interface ParticipantListResponseDto {
  participants: ParticipantDto[];
  total: number;
}

/**
 * API 에러 응답 DTO
 */
export interface ApiErrorDto {
  detail: string;
  status_code?: number;
}

/**
 * 일반 성공 응답 DTO
 */
export interface SuccessResponseDto {
  message: string;
}

/**
 * 이벤트 쿼리 파라미터 DTO
 */
export interface EventQueryParams {
  page?: number;
  size?: number;
  gen?: number;
  event_type?: string;
  not_event_type?: string;
  is_attendance_required?: boolean;
  start_date?: string; // YYYY-MM-DD 형식
  end_date?: string;   // YYYY-MM-DD 형식
}

/**
 * 출석 가능한 이벤트 쿼리 파라미터 DTO
 */
export interface AttendableEventQueryParams {
  page?: number;
  size?: number;
  gen?: number;
  event_type?: string;
}

/**
 * 출석 쿼리 파라미터 DTO
 */
export interface AttendanceQueryParams {
  status_filter?: string;
  member_id_filter?: string;
  event_id?: number;
}

/**
 * 사유결석 설정 요청 DTO
 */
export interface ExcusedAbsenceRequestDto {
  member_id: string;
  reason: string;
}

/**
 * 사유결석 사유 수정 요청 DTO
 */
export interface UpdateExcusedAbsenceRequestDto {
  reason: string;
}

/**
 * 내 출석 목록 항목 DTO
 */
export interface MyAttendanceDto {
  id: number;
  event_id: number;
  event_title: string;
  event_gen: number;
  event_type?: string;
  event_location?: string;
  event_start_time?: string; // ISO 8601 형식
  event_end_time?: string; // ISO 8601 형식
  member_id: string;
  member_name: string;
  status: string;
  reason?: string;
  checked_in_at?: string; // ISO 8601 형식
}

/**
 * 내 출석 목록 응답 DTO
 */
export interface MyAttendanceListResponseDto {
  attendances: MyAttendanceDto[];
  total: number;
}
