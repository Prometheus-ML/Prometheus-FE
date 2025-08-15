import { ApiClient } from './apiClient';
import type {
  UserPublicListResponse,
  UserPrivateListResponse,
  MyProfileResponse,
  MyProfileUpdateRequest,
  UserDetailResponse,
  GrantUpdateRequest,
  StatusUpdateRequest,
  UserUpdateByManagerRequest,
  UserPublic,
  CoffeeChatAvailableUserListResponse,
  CoffeeChatRequestCreate,
  CoffeeChatRequestResponse,
  CoffeeChatRequestListResponse,
  CoffeeChatResponseRequest,
  CoffeeChatContactInfoResponse,
} from '@prometheus-fe/types';

export class UserApi {
  private readonly api: ApiClient;

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
  }

  // 사용자 검색 (공개)
  searchUsers(params?: { q?: string; limit?: number }) {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) searchParams.set(key, String(value));
    });
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.api.get<UserPublic[]>(`/users/ids${query}`);
  }

  // 공개 사용자 목록
  listPublic(params?: {
    page?: number;
    size?: number;
    search?: string;
    executive?: boolean;
    gen?: number;
    mbti?: string;
    school?: string;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) searchParams.set(key, String(value));
    });
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.api.get<UserPublicListResponse>(`/users/list/public${query}`);
  }

  // 인증된 사용자용 목록
  listPrivate(params?: {
    page?: number;
    size?: number;
    search?: string;
    executive?: boolean;
    gen?: number;
    mbti?: string;
    school?: string;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) searchParams.set(key, String(value));
    });
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.api.get<UserPrivateListResponse>(`/users/list/private${query}`);
  }

  // 사용자 상세 정보 조회
  getUser(userId: string) {
    return this.api.get<UserDetailResponse>(`/users/${userId}`);
  }

  // 내 프로필 조회
  me() {
    return this.api.get<MyProfileResponse>('/users/me');
  }

  // 내 프로필 수정
  updateMe(payload: MyProfileUpdateRequest) {
    return this.api.put<MyProfileResponse>('/users/me', payload);
  }

  // 사용자 정보 수정 (Manager 이상)
  updateUser(userId: string, payload: UserUpdateByManagerRequest) {
    return this.api.put<UserDetailResponse>(`/users/${userId}`, payload);
  }

  // 사용자 삭제 (Manager 이상)
  deleteUser(userId: string) {
    return this.api.delete<void>(`/users/${userId}`);
  }

  // 사용자 역할 변경 (Administrator 이상)
  updateGrant(userId: string, payload: GrantUpdateRequest) {
    return this.api.put<UserDetailResponse>(`/users/${userId}/grant`, payload);
  }

  // 사용자 상태 변경 (Manager 이상)
  updateStatus(userId: string, payload: StatusUpdateRequest) {
    return this.api.put<UserDetailResponse>(`/users/${userId}/status`, payload);
  }

  // 사용자 프로젝트 목록
  getUserProjects(userId: string) {
    return this.api.get<any[]>(`/users/${userId}/projects`);
  }

  // 사용자 게시글 목록
  getUserPosts(userId: string) {
    return this.api.get<any[]>(`/users/${userId}/posts`);
  }

  // Coffee Chat APIs
  async getAvailableUsers(params?: {
    page?: number;
    size?: number;
    search?: string;
    gen_filter?: number;
  }): Promise<CoffeeChatAvailableUserListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.size) searchParams.set('size', params.size.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.gen_filter) searchParams.set('gen_filter', params.gen_filter.toString());
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.api.get<CoffeeChatAvailableUserListResponse>(`/users/coffee-chats/available-users${query}`);
  }

  async createCoffeeChatRequest(payload: CoffeeChatRequestCreate): Promise<CoffeeChatRequestResponse> {
    return this.api.post<CoffeeChatRequestResponse>('/users/coffee-chats/requests', payload);
  }

  async getSentRequests(params?: {
    page?: number;
    size?: number;
    status_filter?: string;
  }): Promise<CoffeeChatRequestListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.size) searchParams.set('size', params.size.toString());
    if (params?.status_filter) searchParams.set('status_filter', params.status_filter);
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.api.get<CoffeeChatRequestListResponse>(`/users/coffee-chats/requests/sent${query}`);
  }

  async getReceivedRequests(params?: {
    page?: number;
    size?: number;
    status_filter?: string;
  }): Promise<CoffeeChatRequestListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.size) searchParams.set('size', params.size.toString());
    if (params?.status_filter) searchParams.set('status_filter', params.status_filter);
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.api.get<CoffeeChatRequestListResponse>(`/users/coffee-chats/requests/received${query}`);
  }

  async respondToRequest(requestId: number, payload: CoffeeChatResponseRequest): Promise<CoffeeChatRequestResponse> {
    return this.api.put<CoffeeChatRequestResponse>(`/users/coffee-chats/requests/${requestId}/respond`, payload);
  }

  async getContactInfo(requestId: number): Promise<CoffeeChatContactInfoResponse> {
    return this.api.get<CoffeeChatContactInfoResponse>(`/users/coffee-chats/requests/${requestId}/contact-info`);
  }
}


