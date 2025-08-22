// Landing 관련 타입 정의

export interface LandingSponsor {
  id: number;
  name: string;
  logo_url: string | null;
  purpose: string | null;
  amount: number | null;
  note: string | null;
  sponsored_at: string;
}

export interface LandingHonorHall {
  name: string;
  purpose: string;
}

export interface LandingInterview {
  id: number;
  member_id: string;
  member_name: string;
  member_gen: number;
  gen: number;
  content: string;
  created_at: string;
}

export interface LandingLink {
  id: number;
  title: string;
  url: string;
  image_url: string | null;
  post_date: string;
  created_at: string;
}

// Request/Response 타입들
export interface LandingSponsorListParams {
  page?: number;
  size?: number;
}

export interface LandingSponsorListResponse {
  sponsors: LandingSponsor[];
  total: number;
  page: number;
  size: number;
}

export interface LandingHonorHallListParams {
  page?: number;
  size?: number;
}

export interface LandingHonorHallListResponse {
  honor_hall: LandingHonorHall[];
  total: number;
  page: number;
  size: number;
}

export interface LandingInterviewListParams {
  page?: number;
  size?: number;
}

export interface LandingInterviewListResponse {
  interviews: LandingInterview[];
  total: number;
  page: number;
  size: number;
}

export interface LandingLinkListParams {
  page?: number;
  size?: number;
}

export interface LandingLinkListResponse {
  links: LandingLink[];
  total: number;
  page: number;
  size: number;
}

// Create Request 타입들
export interface LandingSponsorCreateRequest {
  name: string;
  logo_url: string;
  purpose: string;
  amount: number;
  note: string;
  sponsored_at: string;
}

export interface LandingHonorHallCreateRequest {
  name: string;
  purpose: string;
  amount?: number;
  note?: string;
  honored_at?: string;
}

export interface LandingInterviewCreateRequest {
  member_id: string;
  gen: number;
  content: string;
}

export interface LandingLinkCreateRequest {
  title: string;
  url: string;
  image_url?: string;
  post_date: string;
}

// Update Request 타입들
export interface LandingSponsorUpdateRequest {
  name: string;
  logo_url: string;
  purpose: string;
  amount: number;
  note: string;
  sponsored_at: string;
}

export interface LandingHonorHallUpdateRequest {
  name: string;
  purpose: string;
  amount?: number;
  note?: string;
  honored_at?: string;
}

export interface LandingInterviewUpdateRequest {
  gen: number;
  content: string;
}

export interface LandingLinkUpdateRequest {
  title: string;
  url: string;
  image_url?: string;
  post_date: string;
}

// Response 타입들
export interface LandingSponsorCreateResponse {
  id: number;
}

export interface LandingSponsorUpdateResponse {
  id: number;
}

export interface LandingHonorHallCreateResponse {
  id: number;
}

export interface LandingHonorHallUpdateResponse {
  id: number;
}

export interface LandingInterviewCreateResponse {
  id: number;
}

export interface LandingInterviewUpdateResponse {
  id: number;
}

export interface LandingLinkCreateResponse {
  id: number;
}

export interface LandingLinkUpdateResponse {
  id: number;
}
