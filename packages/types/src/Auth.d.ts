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

export interface TempLoginRequest {
  username: string;
  password: string;
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


