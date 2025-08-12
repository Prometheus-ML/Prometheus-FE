import ky, { HTTPError, Options as KyOptions } from 'ky';

export interface ApiClientOptions {
  baseUrl: string;
  getAccessToken?: () => string | undefined | null;
  onUnauthorized?: () => Promise<void> | void;
  onRefreshToken?: () => Promise<string | undefined> | string | undefined;
}

export interface PaginatedParams {
  page?: number;
  size?: number;
}

export class ApiClient {
  private readonly client;
  private readonly getAccessToken?: ApiClientOptions['getAccessToken'];
  private readonly onUnauthorized?: ApiClientOptions['onUnauthorized'];
  private readonly onRefreshToken?: ApiClientOptions['onRefreshToken'];

  constructor(options: ApiClientOptions) {
    this.getAccessToken = options.getAccessToken;
    this.onUnauthorized = options.onUnauthorized;
    this.onRefreshToken = options.onRefreshToken;

    this.client = ky.create({
      prefixUrl: options.baseUrl.replace(/\/$/, ''),
      credentials: 'include',
      hooks: {
        beforeRequest: [async (request) => {
          const token = this.getAccessToken?.();
          if (token) {
            request.headers.set('Authorization', `Bearer ${token}`);
          }
        }],
        afterResponse: [
          async (request, _options, response) => {
            if (response.status === 401) {
              // Try refresh once
              const newToken = await this.onRefreshToken?.();
              if (newToken) {
                request.headers.set('Authorization', `Bearer ${newToken}`);
                return this.client(request);
              }
              await this.onUnauthorized?.();
            }
            return response;
          },
        ],
      },
    });
  }

  get<T>(url: string, options?: KyOptions) {
    return this.client.get(url, options).json<T>();
  }
  post<T>(url: string, json?: unknown, options?: KyOptions) {
    return this.client.post(url, { json, ...options }).json<T>();
  }
  put<T>(url: string, json?: unknown, options?: KyOptions) {
    return this.client.put(url, { json, ...options }).json<T>();
  }
  delete<T>(url: string, options?: KyOptions) {
    return this.client.delete(url, options).json<T>();
  }

  upload<T>(url: string, formData: FormData, options?: KyOptions) {
    return this.client.post(url, { body: formData, ...options }).json<T>();
  }
}

// Domain APIs modeled from Nuxt composables
export interface User {
  id: number;
  email: string;
  name: string;
  grant?: string;
  grant_weight?: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export function createUserApi(client: ApiClient) {
  return {
    // Private users list (requires auth)
    getUsersPrivate: (params: Record<string, string | number | undefined> = {}) =>
      client.get<{ users: any[]; total: number; page: number; size: number }>(`users/private`, { searchParams: params }),
    // Public users list (no auth)
    getUsersPublic: (params: Record<string, string | number | undefined> = {}) =>
      client.get<{ users: any[]; total: number; page: number; size: number }>(`users/public`, { searchParams: params }),
    // Deprecated generic endpoint kept for compatibility
    getUsers: (params: Record<string, string | number | undefined> = {}) =>
      client.get<{ items: User[]; total: number }>(`users/`, { searchParams: params }),
    getUser: (userId: number | string) => client.get<User>(`users/${userId}`),
    createUser: (userData: unknown) => client.post<User>('users/', userData),
    updateUser: (userId: number | string, userData: unknown) => client.put<User>(`users/${userId}`, userData),
    deleteUser: (userId: number | string) => client.delete<void>(`users/${userId}`),
    updateMyInfo: (userData: unknown) => client.put<User>('users/me', userData),
    getMyProfile: () => client.get<User>('users/me'),
    updateMyProfile: (profileData: unknown) => client.put<User>('users/me', profileData),
  };
}

export function createAdminApi(client: ApiClient) {
  return {
    getMembers: (params: Record<string, string | number | undefined> = {}) =>
      client.get<{ items: User[]; total: number }>('admin/members', { searchParams: params }),
    createMember: (memberData: unknown) => client.post('admin/members', memberData),
    bulkCreateMembers: (membersData: unknown[]) => client.post('admin/members/bulk-create', { members: membersData }),
    updateMember: (memberId: number | string, memberData: unknown) => client.put(`admin/members/${memberId}`, memberData),
    deleteMember: (memberId: number | string) => client.delete(`admin/members/${memberId}`),
    getMemberStats: () => client.get('admin/members/stats'),
    getBlacklistStats: () => client.get('admin/members/blacklist-stats'),
    uploadMembersExcel: (formData: FormData) => client.upload('admin/members/upload-excel', formData),
    // approvals
    getPendingApprovals: (params: Record<string, string | number | undefined> = {}) =>
      client.get<{ items?: any[]; users?: any[]; total: number; page: number; size: number }>('admin/pending-approvals', { searchParams: params }),
  };
}

export function createAuthApi(client: ApiClient) {
  return {
    refresh: (refresh_token: string) => client.post<AuthTokens>('auth/refresh', { refresh_token }),
    me: () => client.get<User>('auth/me'),
    googleCallback: (code: string, redirect_uri: string) =>
      client.post<AuthTokens>('auth/google/callback', { code, redirect_uri }),
  };
}

// Coffee Chat APIs under /users/coffee-chats
export function createCoffeeChatApi(client: ApiClient) {
  const base = 'users/coffee-chats';
  return {
    getAvailableUsers: (params: Record<string, string | number | undefined> = {}) =>
      client.get<{ users: any[]; total: number; page: number; size: number }>(`${base}/available-users`, { searchParams: params }),
    createRequest: (payload: { recipient_id: string | number; message?: string }) =>
      client.post<any>(`${base}/requests`, payload),
    getSentRequests: (params: Record<string, string | number | undefined> = {}) =>
      client.get<{ requests: any[]; total: number; page: number; size: number }>(`${base}/requests/sent`, { searchParams: params }),
    getReceivedRequests: (params: Record<string, string | number | undefined> = {}) =>
      client.get<{ requests: any[]; total: number; page: number; size: number }>(`${base}/requests/received`, { searchParams: params }),
    respondRequest: (requestId: number | string, payload: { status: 'accepted' | 'rejected'; response_message?: string }) =>
      client.put<any>(`${base}/requests/${requestId}/respond`, payload),
    getContactInfo: (requestId: number | string) => client.get<{ contact?: string }>(`${base}/requests/${requestId}/contact-info`),
  };
}

// Projects API
export function createProjectsApi(client: ApiClient) {
  const base = 'projects';
  return {
    create: (data: any) => client.post<any>(`${base}/`, data),
    list: (params: Record<string, string | number | undefined> = {}) => client.get<{ projects: any[]; total: number; page: number; size: number }>(`${base}/`, { searchParams: params }),
    get: (projectId: number | string) => client.get<any>(`${base}/${projectId}`),
    update: (projectId: number | string, data: any) => client.put<any>(`${base}/${projectId}`, data),
    remove: (projectId: number | string) => client.delete<void>(`${base}/${projectId}`),
    addMember: (projectId: number | string, data: any) => client.post<any>(`${base}/${projectId}/members`, data),
    listMembers: (projectId: number | string, params: Record<string, string | number | undefined> = {}) =>
      client.get<{ members: any[]; total: number; page: number; size: number }>(`${base}/${projectId}/members`, { searchParams: params }),
    updateMember: (projectId: number | string, memberId: string, data: any) => client.put<any>(`${base}/${projectId}/members/${memberId}`, data),
    removeMember: (projectId: number | string, memberId: string) => client.delete<void>(`${base}/${projectId}/members/${memberId}`),
    memberHistory: (memberId: string) => client.get<any>(`${base}/member/${memberId}/history`),
  };
}

// Schedules Attendance API
export function createSchedulesApi(client: ApiClient) {
  const base = 'schedules/attendance';
  return {
    listAttendance: (scheduleId: number | string, params: Record<string, string | number | undefined> = {}) =>
      client.get<{ attendances: any[]; total: number }>(`${base}/${scheduleId}`, { searchParams: params }),
    createAttendance: (scheduleId: number | string, data: any) => client.post<any>(`${base}/${scheduleId}`, data),
    updateAttendance: (scheduleId: number | string, attendanceId: number | string, data: any) =>
      client.put<any>(`${base}/${scheduleId}/${attendanceId}`, data),
    deleteAttendance: (scheduleId: number | string, attendanceId: number | string) =>
      client.delete<void>(`${base}/${scheduleId}/${attendanceId}`),
    statsBySchedule: (scheduleId: number | string) => client.get<any>(`${base}/stats/${scheduleId}`),
    statsByMember: (memberId: string) => client.get<any>(`${base}/member/${memberId}/stats`),
  };
}

// Sponsorship API
export function createSponsorshipApi(client: ApiClient) {
  const base = 'sponsorship';
  return {
    // Sponsors
    createSponsor: (data: any) => client.post<any>(`${base}/sponsors`, data),
    getSponsors: (params: Record<string, string | number | boolean | undefined> = {}) =>
      client.get<{ sponsors: any[]; total: number; page: number; size: number }>(`${base}/sponsors`, { searchParams: params as any }),
    getSponsor: (sponsorId: number | string) => client.get<any>(`${base}/sponsors/${sponsorId}`),
    updateSponsor: (sponsorId: number | string, data: any) => client.put<any>(`${base}/sponsors/${sponsorId}`, data),
    deleteSponsor: (sponsorId: number | string) => client.delete<void>(`${base}/sponsors/${sponsorId}`),
    // Applications (public create)
    createApplication: (data: any) => client.post<any>(`${base}/applications`, data),
    getApplications: (params: Record<string, string | number | undefined> = {}) =>
      client.get<{ applications: any[]; total: number; page: number; size: number }>(`${base}/applications`, { searchParams: params }),
    updateApplication: (applicationId: number | string, data: any) => client.put<any>(`${base}/applications/${applicationId}`, data),
    // Honor hall
    createHonor: (data: any) => client.post<any>(`${base}/honor-hall`, data),
    getHonorHall: (params: Record<string, string | number | boolean | undefined> = {}) =>
      client.get<{ honor_hall: any[]; total: number; page: number; size: number }>(`${base}/honor-hall`, { searchParams: params as any }),
    updateHonor: (honorId: number | string, data: any) => client.put<any>(`${base}/honor-hall/${honorId}`, data),
  };
}

// Storage (Images)
export function createStorageApi(client: ApiClient) {
  const base = 'storage/image';
  return {
    upload: (formData: FormData) => client.upload(`${base}/upload`, formData),
    getInfo: (fileId: string) => client.get<any>(`${base}/${fileId}`),
    delete: (fileId: string) => client.delete<void>(`${base}/${fileId}`),
  };
}

// Community Events
export function createCommunityApi(client: ApiClient) {
  const base = 'community/events';
  return {
    createEvent: (data: any) => client.post<any>(`${base}/`, data),
    listEvents: (params: Record<string, string | number | undefined> = {}) =>
      client.get<{ total: number; items: any[] }>(`${base}/`, { searchParams: params }),
    getEvent: (eventId: number | string) => client.get<any>(`${base}/${eventId}`),
    requestJoin: (eventId: number | string) => client.post<any>(`${base}/${eventId}/join`),
    listMembers: (eventId: number | string) => client.get<any[]>(`${base}/${eventId}/members`),
    listJoinRequests: (eventId: number | string) => client.get<any[]>(`${base}/${eventId}/members/requests`),
    approveMember: (eventId: number | string, memberId: string) => client.post<any>(`${base}/${eventId}/members/${memberId}/approve`),
    rejectMember: (eventId: number | string, memberId: string) => client.post<any>(`${base}/${eventId}/members/${memberId}/reject`),
    createNote: (eventId: number | string, data: any) => client.post<any>(`${base}/${eventId}/notes`, data),
  };
}


