import { ApiClient } from './apiClient';
import {
  EventCreateRequest,
  EventUpdateRequest,
  EventResponse,
  EventListRequest,
  EventListResponse,
  AttendanceCreateRequest,
  AttendanceUpdateRequest,
  BulkAttendanceCreateRequest,
  AttendanceResponse,
  AttendanceListRequest,
  AttendanceListResponse
} from './dto/event.dto';

export class EventApi {
  private readonly api: ApiClient;
  private readonly base = '/admin/events';

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
  }

  // 이벤트 목록 조회
  async getEventList(params: EventListRequest): Promise<EventListResponse> {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.size) sp.set('size', String(params.size));
      if (params?.gen) sp.set('gen', String(params.gen));
      if (params?.event_type) sp.set('event_type', params.event_type);
      if (params?.is_attendance_required !== undefined) sp.set('is_attendance_required', String(params.is_attendance_required));
      if (params?.start_date) sp.set('start_date', params.start_date);
      if (params?.end_date) sp.set('end_date', params.end_date);
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const response = await this.api.get<EventListResponse>(`${this.base}/${query}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching events:', error);
      throw new Error(error.message || 'Failed to fetch events');
    }
  }

  // 이벤트 상세 조회
  async getEvent(eventId: number): Promise<EventResponse> {
    try {
      const response = await this.api.get<EventResponse>(`${this.base}/${eventId}`);
      return response;
    } catch (error: any) {
      console.error(`Error fetching event ${eventId}:`, error);
      throw new Error(error.message || 'Failed to fetch event');
    }
  }

  // 이벤트 생성
  async createEvent(data: EventCreateRequest): Promise<EventResponse> {
    try {
      const response = await this.api.post<EventResponse>(`${this.base}/`, data);
      return response;
    } catch (error: any) {
      console.error('Error creating event:', error);
      throw new Error(error.message || 'Failed to create event');
    }
  }

  // 이벤트 수정
  async updateEvent(eventId: number, data: EventUpdateRequest): Promise<EventResponse> {
    try {
      const response = await this.api.put<EventResponse>(`${this.base}/${eventId}`, data);
      return response;
    } catch (error: any) {
      console.error(`Error updating event ${eventId}:`, error);
      throw new Error(error.message || 'Failed to update event');
    }
  }

  // 이벤트 삭제
  async deleteEvent(eventId: number): Promise<void> {
    try {
      await this.api.delete(`${this.base}/${eventId}`);
    } catch (error: any) {
      console.error(`Error deleting event ${eventId}:`, error);
      throw new Error(error.message || 'Failed to delete event');
    }
  }

  // 출석 목록 조회
  async getAttendanceList(eventId: number, params?: AttendanceListRequest): Promise<AttendanceListResponse> {
    try {
      const sp = new URLSearchParams();
      if (params?.status_filter) sp.set('status_filter', params.status_filter);
      if (params?.member_id_filter) sp.set('member_id_filter', params.member_id_filter);
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const response = await this.api.get<AttendanceListResponse>(`${this.base}/${eventId}/attendances${query}`);
      return response;
    } catch (error: any) {
      console.error(`Error fetching attendances for event ${eventId}:`, error);
      throw new Error(error.message || 'Failed to fetch attendances');
    }
  }

  // 출석 체크
  async createAttendance(eventId: number, data: AttendanceCreateRequest): Promise<AttendanceResponse> {
    try {
      const response = await this.api.post<AttendanceResponse>(`${this.base}/${eventId}/attendances`, data);
      return response;
    } catch (error: any) {
      console.error(`Error creating attendance for event ${eventId}:`, error);
      throw new Error(error.message || 'Failed to create attendance');
    }
  }

  // 대량 출석 등록
  async createBulkAttendance(eventId: number, data: BulkAttendanceCreateRequest): Promise<AttendanceResponse[]> {
    try {
      const response = await this.api.post<AttendanceResponse[]>(`${this.base}/${eventId}/attendances/bulk`, data);
      return response;
    } catch (error: any) {
      console.error(`Error creating bulk attendance for event ${eventId}:`, error);
      throw new Error(error.message || 'Failed to create bulk attendance');
    }
  }

  // 출석 수정
  async updateAttendance(eventId: number, attendanceId: number, data: AttendanceUpdateRequest): Promise<AttendanceResponse> {
    try {
      const response = await this.api.put<AttendanceResponse>(`${this.base}/${eventId}/attendances/${attendanceId}`, data);
      return response;
    } catch (error: any) {
      console.error(`Error updating attendance ${attendanceId} for event ${eventId}:`, error);
      throw new Error(error.message || 'Failed to update attendance');
    }
  }

  // 출석 삭제
  async deleteAttendance(eventId: number, attendanceId: number): Promise<void> {
    try {
      await this.api.delete(`${this.base}/${eventId}/attendances/${attendanceId}`);
    } catch (error: any) {
      console.error(`Error deleting attendance ${attendanceId} for event ${eventId}:`, error);
      throw new Error(error.message || 'Failed to delete attendance');
    }
  }

  // ===== 일반 사용자용 API =====

  // 일반 사용자용 이벤트 목록 조회
  async getPublicEventList(params?: any): Promise<any> {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.size) sp.set('size', String(params.size));
      if (params?.gen) sp.set('gen', String(params.gen));
      if (params?.event_type) sp.set('event_type', params.event_type);
      if (params?.is_attendance_required !== undefined) sp.set('is_attendance_required', String(params.is_attendance_required));
      if (params?.start_date) sp.set('start_date', params.start_date);
      if (params?.end_date) sp.set('end_date', params.end_date);
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const response = await this.api.get(`/events/${query}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching public events:', error);
      throw new Error(error.message || 'Failed to fetch public events');
    }
  }

  // 일반 사용자용 이벤트 상세 조회
  async getPublicEvent(eventId: number): Promise<any> {
    try {
      const response = await this.api.get(`/events/${eventId}`);
      return response;
    } catch (error: any) {
      console.error(`Error fetching public event ${eventId}:`, error);
      throw new Error(error.message || 'Failed to fetch public event');
    }
  }

  // 일반 사용자용 출석 목록 조회
  async getPublicAttendanceList(eventId: number, params?: any): Promise<any> {
    try {
      const sp = new URLSearchParams();
      if (params?.status_filter) sp.set('status_filter', params.status_filter);
      if (params?.member_id_filter) sp.set('member_id_filter', params.member_id_filter);
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const response = await this.api.get(`/events/attendance/${eventId}${query}`);
      return response;
    } catch (error: any) {
      console.error(`Error fetching public attendances for event ${eventId}:`, error);
      throw new Error(error.message || 'Failed to fetch public attendances');
    }
  }

  // 내 출석 기록 조회
  async getMyAttendances(params?: any): Promise<any> {
    try {
      const sp = new URLSearchParams();
      if (params?.event_id) sp.set('event_id', String(params.event_id));
      if (params?.status_filter) sp.set('status_filter', params.status_filter);
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const response = await this.api.get(`/events/attendance/my${query}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching my attendances:', error);
      throw new Error(error.message || 'Failed to fetch my attendances');
    }
  }

  // 특정 이벤트 내 출석 조회
  async getMyAttendanceForEvent(eventId: number): Promise<any> {
    try {
      const response = await this.api.get(`/events/attendance/${eventId}/my`);
      return response;
    } catch (error: any) {
      console.error(`Error fetching my attendance for event ${eventId}:`, error);
      throw new Error(error.message || 'Failed to fetch my attendance for event');
    }
  }
}
