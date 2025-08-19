import { ApiClient } from './apiClient';
import type { TokenResponse, GoogleAuthUrlResponse, GoogleCallbackRequest, UserInfo } from '@prometheus-fe/types';

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

  refresh() {
    // 백엔드에서 쿠키에서 refresh_token을 읽으므로 body 없이 요청
    return this.api.post<TokenResponse>('/auth/refresh-access-token', {});
  }

  verify() {
    // 백엔드 엔드포인트와 일치
    return this.api.get<UserInfo>('/auth/verify-access-token');
  }
}


