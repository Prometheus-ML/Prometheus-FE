import { ApiClient } from './apiClient';
import {
  CreatePostRequest,
  CreatePostResponse,
  GetPostsRequest,
  GetPostsResponse,
  CreateCommentRequest,
  CreateCommentResponse,
  CreateEventRequest,
  CreateEventResponse,
  GetEventsRequest,
  GetEventsResponse,
  CreateEventNoteRequest,
  CreateEventNoteResponse,
} from './dto/community.dto';
import type {
  Post,
  Comment,
  Event,
  EventMember,
  EventNote,
} from '@prometheus-fe/types';

export class CommunityApi {
  private readonly api: ApiClient;
  private readonly postsBase = '/community/posts';
  private readonly eventsBase = '/community/events'; // legacy

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
  }

  // Posts API
  async createPost(data: CreatePostRequest): Promise<CreatePostResponse> {
    try {
      const response = await this.api.post<CreatePostResponse>(`${this.postsBase}/`, data);
      return response;
    } catch (error: any) {
      console.error('Error creating post:', error);
      throw new Error(error.message || 'Failed to create post');
    }
  }

  async listPosts(params?: GetPostsRequest): Promise<GetPostsResponse> {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.size) sp.set('size', String(params.size));
      if (params?.category) sp.set('category', params.category);
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const response = await this.api.get<GetPostsResponse>(`${this.postsBase}/${query}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      throw new Error(error.message || 'Failed to fetch posts');
    }
  }

  async getPost(postId: number | string): Promise<Post> {
    try {
      const response = await this.api.get<Post>(`${this.postsBase}/${postId}`);
      return response;
    } catch (error: any) {
      console.error(`Error fetching post ${postId}:`, error);
      throw new Error(error.message || 'Failed to fetch post');
    }
  }

  async deletePost(postId: number | string): Promise<void> {
    try {
      await this.api.delete(`${this.postsBase}/${postId}`);
    } catch (error: any) {
      console.error(`Error deleting post ${postId}:`, error);
      throw new Error(error.message || 'Failed to delete post');
    }
  }

  // Comments API
  async createComment(postId: number | string, data: CreateCommentRequest): Promise<CreateCommentResponse> {
    try {
      const response = await this.api.post<CreateCommentResponse>(`${this.postsBase}/${postId}/comments`, data);
      return response;
    } catch (error: any) {
      console.error(`Error creating comment for post ${postId}:`, error);
      throw new Error(error.message || 'Failed to create comment');
    }
  }

  async deleteComment(postId: number | string, commentId: number | string): Promise<void> {
    try {
      await this.api.delete(`${this.postsBase}/${postId}/comments/${commentId}`);
    } catch (error: any) {
      console.error(`Error deleting comment ${commentId} from post ${postId}:`, error);
      throw new Error(error.message || 'Failed to delete comment');
    }
  }

  // Legacy Events API (keeping for backward compatibility)
  async createEvent(data: CreateEventRequest): Promise<CreateEventResponse> {
    try {
      const response = await this.api.post<CreateEventResponse>(`${this.eventsBase}/`, data);
      return response;
    } catch (error: any) {
      console.error('Error creating event:', error);
      throw new Error(error.message || 'Failed to create event');
    }
  }

  async listEvents(params?: GetEventsRequest): Promise<GetEventsResponse> {
    try {
      const sp = new URLSearchParams();
      Object.entries(params || {}).forEach(([k, v]) => { 
        if (v !== undefined && v !== null) sp.set(k, String(v)); 
      });
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const url = `${this.eventsBase}/${query}`.replace(/\/$/, query ? '/' : '');
      
      const response = await this.api.get<GetEventsResponse>(url);
      return response;
    } catch (error: any) {
      console.error('Error fetching events:', error);
      throw new Error(error.message || 'Failed to fetch events');
    }
  }

  async getEvent(eventId: number | string): Promise<Event> {
    try {
      const response = await this.api.get<Event>(`${this.eventsBase}/${eventId}`);
      return response;
    } catch (error: any) {
      console.error(`Error fetching event ${eventId}:`, error);
      throw new Error(error.message || 'Failed to fetch event');
    }
  }

  async requestJoin(eventId: number | string): Promise<EventMember> {
    try {
      const response = await this.api.post<EventMember>(`${this.eventsBase}/${eventId}/join`, {});
      return response;
    } catch (error: any) {
      console.error(`Error joining event ${eventId}:`, error);
      throw new Error(error.message || 'Failed to join event');
    }
  }

  async listMembers(eventId: number | string): Promise<EventMember[]> {
    try {
      const response = await this.api.get<EventMember[]>(`${this.eventsBase}/${eventId}/members`);
      return response;
    } catch (error: any) {
      console.error(`Error fetching members for event ${eventId}:`, error);
      throw new Error(error.message || 'Failed to fetch event members');
    }
  }

  async listJoinRequests(eventId: number | string): Promise<EventMember[]> {
    try {
      const response = await this.api.get<EventMember[]>(`${this.eventsBase}/${eventId}/members/requests`);
      return response;
    } catch (error: any) {
      console.error(`Error fetching join requests for event ${eventId}:`, error);
      throw new Error(error.message || 'Failed to fetch join requests');
    }
  }

  async approveMember(eventId: number | string, memberId: string): Promise<EventMember> {
    try {
      const response = await this.api.post<EventMember>(`${this.eventsBase}/${eventId}/members/${memberId}/approve`, {});
      return response;
    } catch (error: any) {
      console.error(`Error approving member ${memberId} for event ${eventId}:`, error);
      throw new Error(error.message || 'Failed to approve member');
    }
  }

  async rejectMember(eventId: number | string, memberId: string): Promise<EventMember> {
    try {
      const response = await this.api.post<EventMember>(`${this.eventsBase}/${eventId}/members/${memberId}/reject`, {});
      return response;
    } catch (error: any) {
      console.error(`Error rejecting member ${memberId} for event ${eventId}:`, error);
      throw new Error(error.message || 'Failed to reject member');
    }
  }

  async createNote(eventId: number | string, data: CreateEventNoteRequest): Promise<CreateEventNoteResponse> {
    try {
      const response = await this.api.post<CreateEventNoteResponse>(`${this.eventsBase}/${eventId}/notes`, data);
      return response;
    } catch (error: any) {
      console.error(`Error creating note for event ${eventId}:`, error);
      throw new Error(error.message || 'Failed to create event note');
    }
  }
}


