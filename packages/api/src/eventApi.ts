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
  AttendanceStatus,
  AttendanceCode,
  CheckInAttendanceData,
  Participant,
  ParticipantList,
  ParticipantRequest,
  ParticipantResult,
  ExcusedAbsenceRequest,
  UpdateExcusedAbsenceRequest,
  MyAttendance
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
  AttendanceQueryParams,
  CheckInAttendanceRequest,
  GenerateAttendanceCodeRequest,
  AttendanceCodeResponseDto,
  CheckAttendanceCodeRequest,
  CheckAttendanceCodeResponseDto,
  AddParticipantsRequestDto,
  RemoveParticipantsRequestDto,
  ParticipantResultDto,
  ParticipantListResponseDto,
  ParticipantDto,
  ExcusedAbsenceRequestDto,
  UpdateExcusedAbsenceRequestDto,
  MyAttendanceDto,
  MyAttendanceListResponseDto
} from './dto/event.dto';

export class EventApi {
  constructor(private apiClient: ApiClient) {}

  /**
   * 백엔드에서 처리할 수 있도록 날짜를 포맷팅
   * 타임존 정보를 제거하고 로컬 시간으로 변환  
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간대를 고려하여 YYYY-MM-DDTHH:mm:ss 형식으로 변환
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

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
      `/event/list?${queryString}`
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
      start_time: this.formatDateTimeForBackend(formData.startTime),
      end_time: this.formatDateTimeForBackend(formData.endTime),
      location: formData.location?.trim() || undefined,
      event_type: formData.eventType,
      is_attendance_required: formData.isAttendanceRequired,
      current_gen: formData.currentGen,
      attendance_start_time: formData.attendanceStartTime ? this.formatDateTimeForBackend(formData.attendanceStartTime) : undefined,
      attendance_end_time: formData.attendanceEndTime ? this.formatDateTimeForBackend(formData.attendanceEndTime) : undefined,
      late_threshold_minutes: formData.lateThresholdMinutes,
      is_attendance_code_required: formData.isAttendanceCodeRequired,
      meta: formData.meta || undefined
    };

    console.log('📡 [EventApi] POST /admin/event/create 요청 데이터:', requestData);
    
    const response = await this.apiClient.post<EventResponseDto>(
      '/admin/event/create',
      requestData
    );

    console.log('📡 [EventApi] 응답 데이터:', response);
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
      requestData.start_time = this.formatDateTimeForBackend(formData.startTime);
    }
    if (formData.endTime !== undefined) {
      requestData.end_time = this.formatDateTimeForBackend(formData.endTime);
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
    if (formData.attendanceStartTime !== undefined) {
      requestData.attendance_start_time = formData.attendanceStartTime ? this.formatDateTimeForBackend(formData.attendanceStartTime) : undefined;
    }
    if (formData.attendanceEndTime !== undefined) {
      requestData.attendance_end_time = formData.attendanceEndTime ? this.formatDateTimeForBackend(formData.attendanceEndTime) : undefined;
    }
    if (formData.lateThresholdMinutes !== undefined) {
      requestData.late_threshold_minutes = formData.lateThresholdMinutes;
    }
    if (formData.isAttendanceCodeRequired !== undefined) {
      requestData.is_attendance_code_required = formData.isAttendanceCodeRequired;
    }
    if (formData.meta !== undefined) {
      requestData.meta = formData.meta;
    }

    const response = await this.apiClient.put<EventResponseDto>(
      `/admin/event/${eventId}`,
      requestData
    );

    return this.transformEventResponse(response);
  }

  /**
   * 이벤트 삭제 (관리자용)
   */
  async deleteEvent(eventId: number): Promise<void> {
    await this.apiClient.delete<SuccessResponseDto>(
      `/admin/event/${eventId}`
    );
  }

  /**
   * 출석 코드 생성 (관리자용)
   */
  async generateAttendanceCode(eventId: number): Promise<AttendanceCode> {
    const response = await this.apiClient.post<AttendanceCodeResponseDto>(
      `/admin/event/${eventId}/attendance-code/generate`,
      {}
    );

    return {
      eventId: response.event_id,
      attendanceCode: response.attendance_code,
      isAttendanceCodeRequired: response.is_attendance_code_required,
      createdAt: new Date(response.created_at)
    };
  }

  /**
   * 출석 코드 조회 (관리자용)
   */
  async getAttendanceCode(eventId: number): Promise<AttendanceCode> {
    const response = await this.apiClient.get<AttendanceCodeResponseDto>(
      `/admin/event/${eventId}/attendance-code`
    );

    return {
      eventId: response.event_id,
      attendanceCode: response.attendance_code,
      isAttendanceCodeRequired: response.is_attendance_code_required,
      createdAt: new Date(response.created_at)
    };
  }

  /**
   * 출석 코드 삭제 (관리자용)
   */
  async deleteAttendanceCode(eventId: number): Promise<void> {
    await this.apiClient.delete<SuccessResponseDto>(
      `/admin/event/${eventId}/attendance-code`
    );
  }

  /**
   * 출석 코드 확인 (관리자용)
   */
  async checkAttendanceCode(eventId: number, attendanceCode: string): Promise<{ isValid: boolean; message: string }> {
    const response = await this.apiClient.post<CheckAttendanceCodeResponseDto>(
      `/admin/event/${eventId}/attendance-code/check`,
      { attendance_code: attendanceCode }
    );

    return {
      isValid: response.is_valid,
      message: response.message
    };
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
      `/admin/event/${eventId}/attendance`,
      requestData
    );

    return this.transformAttendanceResponse(response);
  }

  /**
   * 내 출석 체크 (일반 사용자용)
   */
  async checkInAttendance(eventId: number, data?: CheckInAttendanceData): Promise<MyAttendance> {
    const requestData: CheckInAttendanceRequest = {};
    
    if (data?.attendanceCode) {
      requestData.attendance_code = data.attendanceCode;
    }

    const response = await this.apiClient.post<MyAttendanceDto>(
      `/event/${eventId}/attendance/check-in`,
      requestData
    );

    return this.transformMyAttendanceResponse(response);
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
      `/admin/event/${eventId}/attendance/${attendanceId}`,
      requestData
    );

    return this.transformAttendanceResponse(response);
  }

  /**
   * 출석 정보 삭제 (관리자용)
   */
  async deleteAttendance(eventId: number, attendanceId: number): Promise<void> {
    await this.apiClient.delete<SuccessResponseDto>(
      `/admin/event/${eventId}/attendance/${attendanceId}`
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
      `/admin/event/${eventId}/attendance/bulk`,
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
      `/admin/event/${eventId}/attendance/stats`
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
  ): Promise<MyAttendance[]> {
    const params: AttendanceQueryParams = {
      ...(eventId && { event_id: eventId }),
      ...(statusFilter && { status_filter: statusFilter })
    };

    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString();

    const response = await this.apiClient.get<MyAttendanceDto[]>(
      `/event/attendance/my?${queryString}`
    );

    return response.map(dto => this.transformMyAttendanceResponse(dto));
  }

  /**
   * 특정 이벤트에서 내 출석 정보 조회
   */
  async getMyAttendanceForEvent(eventId: number): Promise<MyAttendance | null> {
    try {
      const response = await this.apiClient.get<MyAttendanceDto | null>(
        `/event/${eventId}/attendance/my`
      );

      return response ? this.transformMyAttendanceResponse(response) : null;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * 참여자 추가 (관리자용)
   */
  async addParticipants(eventId: number, request: ParticipantRequest): Promise<ParticipantResult> {
    const requestData: AddParticipantsRequestDto = {
      member_ids: request.memberIds
    };

    const response = await this.apiClient.post<ParticipantResultDto>(
      `/admin/event/${eventId}/participants/add`,
      requestData
    );

    return {
      message: response.message,
      added: response.added,
      alreadyExists: response.already_exists,
      errors: response.errors
    };
  }

  /**
   * 참여자 제거 (관리자용)
   */
  async removeParticipants(eventId: number, request: ParticipantRequest): Promise<ParticipantResult> {
    const requestData: RemoveParticipantsRequestDto = {
      member_ids: request.memberIds
    };

    const response = await this.apiClient.post<ParticipantResultDto>(
      `/admin/event/${eventId}/participants/remove`,
      requestData
    );

    return {
      message: response.message,
      removed: response.removed,
      notFound: response.not_found,
      errors: response.errors
    };
  }

  /**
   * 참여자 목록 조회 (관리자용)
   */
  async getParticipants(eventId: number): Promise<ParticipantList> {
    const response = await this.apiClient.get<ParticipantListResponseDto>(
      `/admin/event/${eventId}/participants`
    );

    return this.transformParticipantListResponse(response);
  }

  /**
   * 사유결석 설정 (관리자용)
   */
  async setExcusedAbsence(eventId: number, request: ExcusedAbsenceRequest): Promise<Attendance> {
    const requestData: ExcusedAbsenceRequestDto = {
      member_id: request.memberId,
      reason: request.reason
    };

    const response = await this.apiClient.post<AttendanceResponseDto>(
      `/admin/event/${eventId}/excused-absence`,
      requestData
    );

    return this.transformAttendanceResponse(response);
  }

  /**
   * 사유결석 사유 수정 (관리자용)
   */
  async updateExcusedAbsenceReason(
    eventId: number, 
    memberId: string, 
    request: UpdateExcusedAbsenceRequest
  ): Promise<Attendance> {
    const requestData: UpdateExcusedAbsenceRequestDto = {
      reason: request.reason
    };

    const response = await this.apiClient.put<AttendanceResponseDto>(
      `/admin/event/${eventId}/excused-absence/${memberId}`,
      requestData
    );

    return this.transformAttendanceResponse(response);
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
      attendanceStartTime: dto.attendance_start_time ? new Date(dto.attendance_start_time) : undefined,
      attendanceEndTime: dto.attendance_end_time ? new Date(dto.attendance_end_time) : undefined,
      lateThresholdMinutes: dto.late_threshold_minutes,
      isAttendanceCodeRequired: dto.is_attendance_code_required,
      hasAttendanceCode: dto.has_attendance_code,
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

  /**
   * ParticipantListResponseDto를 ParticipantList 도메인 타입으로 변환
   */
  private transformParticipantListResponse(dto: ParticipantListResponseDto): ParticipantList {
    return {
      participants: dto.participants.map(participant => ({
        eventId: participant.event_id,
        memberId: participant.member_id,
        memberName: participant.member_name,
        memberGen: participant.member_gen,
        status: participant.status as AttendanceStatus,
        addedAt: new Date(participant.added_at)
      })),
      total: dto.total
    };
  }

  /**
   * MyAttendanceDto를 MyAttendance 도메인 타입으로 변환
   */
  private transformMyAttendanceResponse(dto: MyAttendanceDto): MyAttendance {
    return {
      id: dto.id,
      eventId: dto.event_id,
      eventTitle: dto.event_title,
      eventGen: dto.event_gen,
      memberId: dto.member_id,
      memberName: dto.member_name,
      status: dto.status as AttendanceStatus,
      reason: dto.reason,
      checkedInAt: dto.checked_in_at ? new Date(dto.checked_in_at) : undefined
    };
  }
}
