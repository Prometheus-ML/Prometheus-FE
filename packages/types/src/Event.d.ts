/**
 * 이벤트 도메인 타입 정의
 * 
 * 백엔드 Event 모델과 대응되는 프론트엔드 도메인 타입
 */

/**
 * 이벤트 타입 열거형
 */
export type EventType = 
  | '회의'
  | '데모데이'
  | '홈커밍데이'
  | '스터디'
  | '워크샵'
  | '세미나'
  | '네트워킹'
  | '기타';

/**
 * 출석 상태 열거형
 */
export type AttendanceStatus = 
  | 'present'    // 출석
  | 'absent'     // 결석
  | 'late'       // 지각
  | 'excused'    // 사유 있는 결석
  | 'unknown';   // 미확인

/**
 * 이벤트 도메인 타입
 */
export interface Event {
  /** 이벤트 ID */
  id: number;
  
  /** 이벤트 제목 */
  title: string;
  
  /** 이벤트 설명 */
  description?: string;
  
  /** 시작 시간 */
  startTime: Date;
  
  /** 종료 시간 */
  endTime: Date;
  
  /** 장소 */
  location?: string;
  
  /** 이벤트 타입 */
  eventType: EventType;
  
  /** 출석 필수 여부 */
  isAttendanceRequired: boolean;
  
  /** 현재 기수 */
  currentGen: number;
  
  /** 출석 인정 시작 시간 */
  attendanceStartTime?: Date;
  
  /** 출석 인정 종료 시간 */
  attendanceEndTime?: Date;
  
  /** 지각 허용 시간(분) */
  lateThresholdMinutes: number;
  
  /** 출석 코드 필수 여부 */
  isAttendanceCodeRequired: boolean;
  
  /** 출석 코드 존재 여부 */
  hasAttendanceCode: boolean;
  
  /** 추가 메타데이터 */
  meta?: Record<string, any>;
}

/**
 * 출석 정보 도메인 타입
 */
export interface Attendance {
  /** 출석 ID */
  id: number;
  
  /** 이벤트 ID */
  eventId: number;
  
  /** 멤버 ID */
  memberId: string;
  
  /** 멤버 이름 */
  memberName?: string;
  
  /** 출석 상태 */
  status: AttendanceStatus;
  
  /** 결석 사유 */
  reason?: string;
  
  /** 출석 체크 시간 */
  checkedInAt?: Date;
}

/**
 * 출석 통계 도메인 타입
 */
export interface AttendanceStats {
  /** 전체 멤버 수 */
  totalMembers: number;
  
  /** 출석자 수 */
  present: number;
  
  /** 결석자 수 */
  absent: number;
  
  /** 지각자 수 */
  late: number;
  
  /** 사유 있는 결석자 수 */
  excused: number;
  
  /** 출석률 (0-1) */
  attendanceRate: number;
}

/**
 * 출석 코드 도메인 타입
 */
export interface AttendanceCode {
  /** 이벤트 ID */
  eventId: number;
  
  /** 출석 코드 (6자리 숫자) */
  attendanceCode: string;
  
  /** 출석 코드 필수 여부 */
  isAttendanceCodeRequired: boolean;
  
  /** 생성 시간 */
  createdAt: Date;
}

/**
 * 이벤트 필터 조건 타입
 */
export interface EventFilter {
  /** 기수 필터 */
  gen?: number;
  
  /** 이벤트 타입 필터 */
  eventType?: EventType;
  
  /** 출석 필수 여부 필터 */
  isAttendanceRequired?: boolean;
  
  /** 시작 날짜 필터 (YYYY-MM-DD) */
  startDate?: string;
  
  /** 종료 날짜 필터 (YYYY-MM-DD) */
  endDate?: string;
}

/**
 * 페이지네이션 정보 타입
 */
export interface EventPagination {
  /** 현재 페이지 */
  page: number;
  
  /** 페이지 크기 */
  size: number;
  
  /** 전체 항목 수 */
  total: number;
}

/**
 * 이벤트 목록 응답 타입
 */
export interface EventList {
  /** 이벤트 목록 */
  events: Event[];
  
  /** 페이지네이션 정보 */
  pagination: EventPagination;
}

/**
 * 출석 목록 응답 타입
 */
export interface AttendanceList {
  /** 출석 목록 */
  attendances: Attendance[];
  
  /** 전체 출석 기록 수 */
  total: number;
}

/**
 * 이벤트 생성 폼 데이터 타입
 */
export interface EventFormData {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  eventType: EventType;
  isAttendanceRequired: boolean;
  currentGen: number;
  attendanceStartTime?: Date;
  attendanceEndTime?: Date;
  lateThresholdMinutes: number;
  isAttendanceCodeRequired: boolean;
  meta?: Record<string, any>;
}

/**
 * 출석 체크 폼 데이터 타입
 */
export interface AttendanceFormData {
  memberId: string;
  status: AttendanceStatus;
  reason?: string;
}

/**
 * 출석 체크 요청 데이터 타입
 */
export interface CheckInAttendanceData {
  attendanceCode?: string;
}

/**
 * 대량 출석 체크 결과 타입
 */
export interface BulkAttendanceResult {
  message: string;
  created: number;
  updated: number;
  errors: string[];
}
