import { ApiClient } from './apiClient';
import type {
  ScheduleListResponse,
  ScheduleResponse,
  AttendanceListResponse,
  AttendanceResponse,
  AttendanceStatsResponse,
  AttendanceCreateRequest,
  AttendanceUpdateRequest,
} from '@prometheus-fe/types';

export class SchedulesApi {
  private readonly api: ApiClient;
  private readonly base = '/schedules';

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
  }

  list(params?: Record<string, string | number | boolean | undefined>) {
    const sp = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) sp.set(k, String(v));
    });
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return this.api.get<ScheduleListResponse>(`${this.base}/${q ? q : ''}`.replace(/\/$/, q ? '/' : ''));
  }

  get(scheduleId: number | string) {
    return this.api.get<ScheduleResponse>(`${this.base}/${scheduleId}`);
  }

  // Attendance sub-resource
  listAttendance(scheduleId: number | string, params?: Record<string, string | number | undefined>) {
    const sp = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => { if (v !== undefined && v !== null) sp.set(k, String(v)); });
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return this.api.get<AttendanceListResponse>(`${this.base}/attendance/${scheduleId}${q}`);
  }

  createAttendance(scheduleId: number | string, payload: AttendanceCreateRequest) {
    return this.api.post<AttendanceResponse>(`${this.base}/attendance/${scheduleId}`, payload);
  }

  updateAttendance(scheduleId: number | string, attendanceId: number | string, payload: AttendanceUpdateRequest) {
    return this.api.put<AttendanceResponse>(`${this.base}/attendance/${scheduleId}/${attendanceId}`, payload);
  }

  deleteAttendance(scheduleId: number | string, attendanceId: number | string) {
    return this.api.delete<void>(`${this.base}/attendance/${scheduleId}/${attendanceId}`);
  }

  statsBySchedule(scheduleId: number | string) {
    return this.api.get<AttendanceStatsResponse>(`${this.base}/attendance/stats/${scheduleId}`);
  }

  statsByMember(memberId: string) {
    return this.api.get<Record<string, any>>(`${this.base}/attendance/member/${memberId}/stats`);
  }
}


