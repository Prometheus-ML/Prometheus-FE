import { ApiClient } from './apiClient';
import type {
  PostCreateRequest,
  PostResponse,
  PostListResponse,
  CommentCreateRequest,
  CommentResponse,
  // Legacy event types for backward compatibility
  EventCreateRequest,
  EventResponse,
  EventListResponse,
  EventMemberResponse,
  EventNoteCreateRequest,
  EventNoteResponse,
} from '@prometheus-fe/types';

export class CommunityApi {
  private readonly api: ApiClient;
  private readonly postsBase = '/community/posts';
  private readonly eventsBase = '/community/events'; // legacy

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
  }

  // Posts API
  createPost(data: PostCreateRequest) {
    return this.api.post<PostResponse>(`${this.postsBase}/`, data);
  }

  listPosts(params?: { page?: number; size?: number; category?: string }) {
    const sp = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => { 
      if (v !== undefined && v !== null) sp.set(k, String(v)); 
    });
    const query = sp.toString() ? `?${sp.toString()}` : '';
    return this.api.get<PostListResponse>(`${this.postsBase}/${query}`);
  }

  getPost(postId: number | string) {
    return this.api.get<PostResponse>(`${this.postsBase}/${postId}`);
  }

  deletePost(postId: number | string) {
    return this.api.delete<PostResponse>(`${this.postsBase}/${postId}`);
  }

  // Comments API
  createComment(postId: number | string, data: CommentCreateRequest) {
    return this.api.post<CommentResponse>(`${this.postsBase}/${postId}/comments`, data);
  }

  deleteComment(postId: number | string, commentId: number | string) {
    return this.api.delete<CommentResponse>(`${this.postsBase}/${postId}/comments/${commentId}`);
  }

  // Legacy Events API (keeping for backward compatibility)
  createEvent(data: EventCreateRequest) {
    return this.api.post<EventResponse>(`${this.eventsBase}/`, data);
  }

  listEvents(params?: Record<string, string | number | undefined>) {
    const sp = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => { if (v !== undefined && v !== null) sp.set(k, String(v)); });
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return this.api.get<EventListResponse>(`${this.eventsBase}/${q ? q : ''}`.replace(/\/$/, q ? '/' : ''));
  }

  getEvent(eventId: number | string) {
    return this.api.get<EventResponse>(`${this.eventsBase}/${eventId}`);
  }

  requestJoin(eventId: number | string) {
    return this.api.post<EventMemberResponse>(`${this.eventsBase}/${eventId}/join`, {});
  }

  listMembers(eventId: number | string) {
    return this.api.get<EventMemberResponse[]>(`${this.eventsBase}/${eventId}/members`);
  }

  listJoinRequests(eventId: number | string) {
    return this.api.get<EventMemberResponse[]>(`${this.eventsBase}/${eventId}/members/requests`);
  }

  approveMember(eventId: number | string, memberId: string) {
    return this.api.post<EventMemberResponse>(`${this.eventsBase}/${eventId}/members/${memberId}/approve`, {});
  }

  rejectMember(eventId: number | string, memberId: string) {
    return this.api.post<EventMemberResponse>(`${this.eventsBase}/${eventId}/members/${memberId}/reject`, {});
  }

  createNote(eventId: number | string, data: EventNoteCreateRequest) {
    return this.api.post<EventNoteResponse>(`${this.eventsBase}/${eventId}/notes`, data);
  }
}


