import { ApiClient } from './apiClient';
import type { TokenResponse, GoogleAuthUrlResponse, GoogleCallbackRequest } from '@prometheus-fe/types';

export class AuthApi {
  private readonly api: ApiClient;

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
  }

  getGoogleAuthUrl(state?: string) {
    const query = state ? `?state=${encodeURIComponent(state)}` : '';
    return this.api.get<GoogleAuthUrlResponse>(`/auth/google/url${query}`);
  }

  googleCallback(payload: GoogleCallbackRequest) {
    return this.api.post<TokenResponse>('/auth/google/callback', payload);
  }

  googleLogin(id_token: string) {
    return this.api.post<TokenResponse>('/auth/google/login', { id_token });
  }

  refresh(refresh_token: string) {
    return this.api.post<TokenResponse>('/auth/refresh', { refresh_token });
  }

  me() {
    return this.api.get<import('@prometheus-fe/types').UserInfo>('/auth/me');
  }
}


