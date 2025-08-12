import { ApiClient } from './apiClient';
import type {
  UserPublicListResponse,
  UserPrivateListResponse,
  MyProfileResponse,
  MyProfileUpdateRequest,
  UserDetailResponse,
  GrantUpdateRequest,
  StatusUpdateRequest,
} from '@prometheus-fe/types';

export class UserApi {
  private readonly api: ApiClient;

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
  }

  listPublic(params?: Record<string, string | number | undefined>) {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) searchParams.set(key, String(value));
    });
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.api.get<UserPublicListResponse>(`/v1/users/public${query}`);
  }

  listPrivate(params?: Record<string, string | number | undefined>) {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) searchParams.set(k, String(v));
    });
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.api.get<UserPrivateListResponse>(`/v1/users/private${query}`);
  }

  me() {
    return this.api.get<MyProfileResponse>('/v1/users/me');
  }

  updateMe(payload: MyProfileUpdateRequest) {
    return this.api.put<MyProfileResponse>('/v1/users/me', payload);
  }

  updateUser(userId: string, payload: Partial<UserDetailResponse>) {
    return this.api.put<UserDetailResponse>(`/v1/users/${userId}`, payload);
  }

  deleteUser(userId: string) {
    return this.api.delete<void>(`/v1/users/${userId}`);
  }

  updateGrant(userId: string, payload: GrantUpdateRequest) {
    return this.api.put<UserDetailResponse>(`/v1/users/${userId}/grant`, payload);
  }

  updateStatus(userId: string, payload: StatusUpdateRequest) {
    return this.api.put<UserDetailResponse>(`/v1/users/${userId}/status`, payload);
  }
}


