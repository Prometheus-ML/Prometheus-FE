import { ApiClient } from './apiClient';
import type { TokenResponse, GoogleAuthUrlResponse, GoogleCallbackRequest, UserInfo,
    SendPhoneCodeRequest, SendPhoneCodeResponse, VerifyPhoneCodeRequest, VerifyPhoneCodeResponse, LinkGoogleAccountRequest, LinkGoogleAccountResponse
 } from '@prometheus-fe/types';

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

  refresh(refreshToken: string) {
    // 리프레시 토큰을 body로 전송
    return this.api.post<TokenResponse>('/auth/refresh', { refresh_token: refreshToken });
  }

  verify() {
    // 액세스 토큰을 Authorization 헤더로 전송
    return this.api.get<UserInfo>('/auth/verify-access-token');
  }

   // === 전화번호 인증 관련 메서드 추가 ===

  /**
   * 전화번호로 인증 코드 발송
   * SMS로 6자리 인증 코드가 전송됨
   */
  sendPhoneVerificationCode(payload: SendPhoneCodeRequest) {
    return this.api.post<SendPhoneCodeResponse>('/auth/phone/send-code', payload);
  }

  /**
   * 전화번호 인증 코드 확인
   * 성공 시 임시 토큰(temp_token) 발급
   */
  verifyPhoneCode(payload: VerifyPhoneCodeRequest) {
    return this.api.post<VerifyPhoneCodeResponse>('/auth/phone/verify-code', payload);
  }

  /**
   * 전화번호 인증 후 Google 계정 재연결
   * temp_token과 새로운 Google ID Token으로 계정 업데이트
   */
  linkGoogleAccount(payload: LinkGoogleAccountRequest) {
    return this.api.post<LinkGoogleAccountResponse>('/auth/phone/link-google', payload);
  }
}


