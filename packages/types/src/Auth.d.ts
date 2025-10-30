export interface GoogleAuthUrlResponse {
  auth_url: string;
  state?: string | null;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface GoogleCallbackRequest {
  code: string;
  state?: string | null;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  grant: string;
  gen?: number | null;
  school?: string | null;
  major?: string | null;
  student_id?: string | null;
  birthdate?: string | null; // ISO date
  phone?: string | null;
  github?: string | null;
  notion?: string | null;
  figma?: string | null;
  history?: string[] | null;
  status: string;
  profile_image_url?: string | null;
  activity_start_date?: string | null; // ISO date
  active_gens?: number[] | null;
  meta?: Record<string, any> | null;
}

// === 전화번호 인증 관련 타입 ===

// 전화번호 인증 코드 발송 요청
export interface SendPhoneCodeRequest {
  phone: string; // 형식: "010-1234-5678" 또는 "01012345678"
}

// 인증 코드 발송 응답
export interface SendPhoneCodeResponse {
  message: string;
  expires_at: string; // ISO date - 코드 만료 시간
}

// 인증 코드 확인 요청
export interface VerifyPhoneCodeRequest {
  phone: string;
  code: string; // 6자리 숫자 코드
}

// 전화번호 인증 성공 응답
export interface VerifyPhoneCodeResponse {
  temp_token: string; // 임시 토큰 (5분 유효)
  user: {
    id: string;
    name: string;
    phone: string;
    current_google_email?: string | null; // 현재 연결된 Google 계정
  };
}

// Google 계정 재연결 요청
export interface LinkGoogleAccountRequest {
  temp_token: string; // 전화번호 인증으로 받은 토큰
  id_token: string; // Google ID Token
}

// 계정 연결 성공 응답
export interface LinkGoogleAccountResponse extends TokenResponse {
  message: string;
  previous_email?: string | null; // 이전에 연결되었던 이메일
  new_email: string; // 새로 연결된 이메일
}

// 로그인 에러 응답
export interface AuthErrorResponse {
  error: string;
  error_code: 'ACCOUNT_NOT_FOUND' | 'INVALID_CREDENTIALS' | 'ACCOUNT_DISABLED' | 'UNKNOWN';
  message: string;
  can_use_phone_verification?: boolean; // 전화번호 인증 사용 가능 여부
}

// Google 계정 변경 요청
export interface AccountChangeRequest {
  temp_token: string; // 전화번호 인증으로 받은 토큰
  new_google_email: string; // 변경하고자 하는 Google 이메일
}

// 계정 변경 요청 응답
export interface AccountChangeResponse {
  message: string;
  request_id: string; // 요청 추적 ID
  status: 'pending'; // 승인 대기 상태
  estimated_approval_time?: string; // 예상 승인 시간 (선택)
}