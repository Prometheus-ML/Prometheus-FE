import { ApiClient } from './apiClient';
import type {
  EventCreateRequest,
  EventResponse,
  EventListResponse,
  EventMemberResponse,
  EventNoteCreateRequest,
  EventNoteResponse,
} from '@prometheus-fe/types';

export class CommunityApi {
  private readonly api: ApiClient;
  private readonly base = '/community/events';

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
  }

  createEvent(data: EventCreateRequest) {
    return this.api.post<EventResponse>(`${this.base}/`, data);
  }

  listEvents(params?: Record<string, string | number | undefined>) {
    const sp = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => { if (v !== undefined && v !== null) sp.set(k, String(v)); });
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return this.api.get<EventListResponse>(`${this.base}/${q ? q : ''}`.replace(/\/$/, q ? '/' : ''));
  }

  getEvent(eventId: number | string) {
    return this.api.get<EventResponse>(`${this.base}/${eventId}`);
  }

  requestJoin(eventId: number | string) {
    return this.api.post<EventMemberResponse>(`${this.base}/${eventId}/join`, {});
  }

  listMembers(eventId: number | string) {
    return this.api.get<EventMemberResponse[]>(`${this.base}/${eventId}/members`);
  }

  listJoinRequests(eventId: number | string) {
    return this.api.get<EventMemberResponse[]>(`${this.base}/${eventId}/members/requests`);
  }

  approveMember(eventId: number | string, memberId: string) {
    return this.api.post<EventMemberResponse>(`${this.base}/${eventId}/members/${memberId}/approve`, {});
  }

  rejectMember(eventId: number | string, memberId: string) {
    return this.api.post<EventMemberResponse>(`${this.base}/${eventId}/members/${memberId}/reject`, {});
  }

  createNote(eventId: number | string, data: EventNoteCreateRequest) {
    return this.api.post<EventNoteResponse>(`${this.base}/${eventId}/notes`, data);
  }
}


