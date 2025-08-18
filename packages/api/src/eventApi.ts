/**
 * 이벤트 API 클래스
 * 
 * 백엔드 event API와 통신하는 데이터 접근 계층
 * DTO와 Domain Type 간의 변환 담당
 */

import { ApiClient } from './apiClient';
import {
  Event,
  Attendance,
  AttendanceStats,
  EventList,
  AttendanceList,
  EventFormData,
  AttendanceFormData,
  BulkAttendanceResult,
  EventFilter,
  EventType,
  AttendanceStatus
} from '@prometheus-fe/types';
import {
  CreateEventRequest,
  UpdateEventRequest,
  EventResponseDto,
  EventListResponseDto,
  CreateAttendanceRequest,
  UpdateAttendanceRequest,
  AttendanceResponseDto,
  AttendanceListResponseDto,
  BulkAttendanceCreateRequest,
  BulkAttendanceResponseDto,
  AttendanceStatsResponseDto,
  SuccessResponseDto,
  EventQueryParams,
  AttendanceQueryParams
} from './dto/event.dto';

export class EventApi {
  constructor(private apiClient: ApiClient) {}

  /**
   * 이벤트 목록 조회
   */
  async getEvents(
    page: number = 1,
    size: number = 20,
    filter?: EventFilter
  ): Promise<EventList> {
    const params: EventQueryParams = {
      page,
      size,
      ...(filter?.gen && { gen: filter.gen }),
      ...(filter?.eventType && { event_type: filter.eventType }),
      ...(filter?.isAttendanceRequired !== undefined && { 
        is_attendance_required: filter.isAttendanceRequired 
      }),
      ...(filter?.startDate && { start_date: filter.startDate }),
      ...(filter?.endDate && { end_date: filter.endDate })
    };

    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString();

    const response = await this.apiClient.get<EventListResponseDto>(
      `/event/?${queryString}`
    );

    return this.transformEventListResponse(response);
  }

  /**
   * 이벤트 상세 조회
   */
  async getEvent(eventId: number): Promise<Event> {
    const response = await this.apiClient.get<EventResponseDto>(
      `/event/${eventId}`
    );

    return this.transformEventResponse(response);
  }

  /**
   * 이벤트 생성 (관리자용)
   */
  async createEvent(formData: EventFormData): Promise<Event> {
    const requestData: CreateEventRequest = {
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
      start_time: formData.startTime.toISOString(),
      end_time: formData.endTime.toISOString(),
      location: formData.location?.trim() || undefined,
      event_type: formData.eventType,
      is_attendance_required: formData.isAttendanceRequired,
      current_gen: formData.currentGen,
      meta: formData.meta || undefined
    };

    const response = await this.apiClient.post<EventResponseDto>(
      '/admin/events/',
      requestData
    );

    return this.transformEventResponse(response);
  }

  /**
   * 이벤트 수정 (관리자용)
   */
  async updateEvent(eventId: number, formData: Partial<EventFormData>): Promise<Event> {
    const requestData: UpdateEventRequest = {};

    if (formData.title !== undefined) {
      requestData.title = formData.title.trim();
    }
    if (formData.description !== undefined) {
      requestData.description = formData.description?.trim() || undefined;
    }
    if (formData.startTime !== undefined) {
      requestData.start_time = formData.startTime.toISOString();
    }
    if (formData.endTime !== undefined) {
      requestData.end_time = formData.endTime.toISOString();
    }
    if (formData.location !== undefined) {
      requestData.location = formData.location?.trim() || undefined;
    }
    if (formData.eventType !== undefined) {
      requestData.event_type = formData.eventType;
    }
    if (formData.isAttendanceRequired !== undefined) {
      requestData.is_attendance_required = formData.isAttendanceRequired;
    }
    if (formData.currentGen !== undefined) {
      requestData.current_gen = formData.currentGen;
    }
    if (formData.meta !== undefined) {
      requestData.meta = formData.meta;
    }

    const response = await this.apiClient.put<EventResponseDto>(
      `/admin/events/${eventId}`,
      requestData
    );

    return this.transformEventResponse(response);
  }

  /**
   * 이벤트 삭제 (관리자용)
   */
  async deleteEvent(eventId: number): Promise<void> {
    await this.apiClient.delete<SuccessResponseDto>(
      `/admin/events/${eventId}`
    );
  }

  /**
   * 출석 목록 조회
   */
  async getAttendances(
    eventId: number,
    statusFilter?: AttendanceStatus,
    memberIdFilter?: string
  ): Promise<AttendanceList> {
    const params: AttendanceQueryParams = {
      ...(statusFilter && { status_filter: statusFilter }),
      ...(memberIdFilter && { member_id_filter: memberIdFilter })
    };

    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString();

    const response = await this.apiClient.get<AttendanceListResponseDto>(
      `/event/${eventId}/attendance?${queryString}`
    );

    return this.transformAttendanceListResponse(response);
  }

  /**
   * 출석 체크 (관리자용)
   */
  async createAttendance(eventId: number, formData: AttendanceFormData): Promise<Attendance> {
    const requestData: CreateAttendanceRequest = {
      member_id: formData.memberId,
      status: formData.status,
      reason: formData.reason?.trim() || undefined
    };

    const response = await this.apiClient.post<AttendanceResponseDto>(
      `/admin/events/${eventId}/attendance`,
      requestData
    );

    return this.transformAttendanceResponse(response);
  }

  /**
   * 내 출석 체크 (일반 사용자용)
   */
  async checkInAttendance(eventId: number): Promise<Attendance> {
    const response = await this.apiClient.post<AttendanceResponseDto>(
      `/event/${eventId}/attendance/check-in`,
      {}
    );

    return this.transformAttendanceResponse(response);
  }

  /**
   * 출석 정보 수정 (관리자용)
   */
  async updateAttendance(
    eventId: number, 
    attendanceId: number, 
    formData: Partial<AttendanceFormData>
  ): Promise<Attendance> {
    const requestData: UpdateAttendanceRequest = {};

    if (formData.status !== undefined) {
      requestData.status = formData.status;
    }
    if (formData.reason !== undefined) {
      requestData.reason = formData.reason?.trim() || undefined;
    }

    const response = await this.apiClient.put<AttendanceResponseDto>(
      `/admin/events/${eventId}/attendance/${attendanceId}`,
      requestData
    );

    return this.transformAttendanceResponse(response);
  }

  /**
   * 출석 정보 삭제 (관리자용)
   */
  async deleteAttendance(eventId: number, attendanceId: number): Promise<void> {
    await this.apiClient.delete<SuccessResponseDto>(
      `/admin/events/${eventId}/attendance/${attendanceId}`
    );
  }

  /**
   * 대량 출석 체크 (관리자용)
   */
  async bulkCreateAttendances(
    eventId: number, 
    attendancesData: AttendanceFormData[]
  ): Promise<BulkAttendanceResult> {
    const requestData: BulkAttendanceCreateRequest = {
      attendances: attendancesData.map(data => ({
        member_id: data.memberId,
        status: data.status,
        reason: data.reason?.trim() || undefined
      }))
    };

    const response = await this.apiClient.post<BulkAttendanceResponseDto>(
      `/admin/events/${eventId}/attendance/bulk`,
      requestData
    );

    return {
      message: response.message,
      created: response.created,
      updated: response.updated,
      errors: response.errors
    };
  }

  /**
   * 출석 통계 조회
   */
  async getAttendanceStats(eventId: number): Promise<AttendanceStats> {
    const response = await this.apiClient.get<AttendanceStatsResponseDto>(
      `/admin/events/${eventId}/attendance/stats`
    );

    return {
      totalMembers: response.total_members,
      present: response.present,
      absent: response.absent,
      late: response.late,
      excused: response.excused,
      attendanceRate: response.attendance_rate
    };
  }

  /**
   * 내 출석 기록 조회
   */
  async getMyAttendances(
    eventId?: number,
    statusFilter?: AttendanceStatus
  ): Promise<Attendance[]> {
    const params: AttendanceQueryParams = {
      ...(eventId && { event_id: eventId }),
      ...(statusFilter && { status_filter: statusFilter })
    };

    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString();

    const response = await this.apiClient.get<AttendanceResponseDto[]>(
      `/event/attendance/my?${queryString}`
    );

    return response.map(dto => this.transformAttendanceResponse(dto));
  }

  /**
   * 특정 이벤트에서 내 출석 정보 조회
   */
  async getMyAttendanceForEvent(eventId: number): Promise<Attendance | null> {
    try {
      const response = await this.apiClient.get<AttendanceResponseDto | null>(
        `/event/${eventId}/attendance/my`
      );

      return response ? this.transformAttendanceResponse(response) : null;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * EventResponseDto를 Event 도메인 타입으로 변환
   */
  private transformEventResponse(dto: EventResponseDto): Event {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      startTime: new Date(dto.start_time),
      endTime: new Date(dto.end_time),
      location: dto.location,
      eventType: dto.event_type as EventType,
      isAttendanceRequired: dto.is_attendance_required,
      currentGen: dto.current_gen,
      meta: dto.meta
    };
  }

  /**
   * EventListResponseDto를 EventList 도메인 타입으로 변환
   */
  private transformEventListResponse(dto: EventListResponseDto): EventList {
    return {
      events: dto.events.map(event => this.transformEventResponse(event)),
      pagination: {
        page: dto.page,
        size: dto.size,
        total: dto.total
      }
    };
  }

  /**
   * AttendanceResponseDto를 Attendance 도메인 타입으로 변환
   */
  private transformAttendanceResponse(dto: AttendanceResponseDto): Attendance {
    return {
      id: dto.id,
      eventId: dto.event_id,
      memberId: dto.member_id,
      memberName: dto.member_name,
      status: dto.status as AttendanceStatus,
      reason: dto.reason,
      checkedInAt: dto.checked_in_at ? new Date(dto.checked_in_at) : undefined
    };
  }

  /**
   * AttendanceListResponseDto를 AttendanceList 도메인 타입으로 변환
   */
  private transformAttendanceListResponse(dto: AttendanceListResponseDto): AttendanceList {
    return {
      attendances: dto.attendances.map(attendance => 
        this.transformAttendanceResponse(attendance)
      ),
      total: dto.total
    };
  }
}
