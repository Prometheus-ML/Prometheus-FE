// Landing 관련 타입 정의

export interface LandingSponsor {
  id: number;
  name: string;
  logo_url: string | null;
  purpose: string;
  amount: number;
  note: string;
  sponsored_at: string;
}

export interface LandingHonorHall {
  name: string;
  purpose: string;
}

export interface LandingReview {
  id: number;
  member_id: string;
  gen?: number;
  content: string;
  rating: number;
  created_at: string;
}

export interface LandingLink {
  id: number;
  title: string;
  url: string;
  image_url: string | null;
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

export interface LandingReviewListParams {
  page?: number;
  size?: number;
}

export interface LandingReviewListResponse {
  reviews: LandingReview[];
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

export interface LandingReviewCreateRequest {
  member_id: string;
  gen?: number;
  content: string;
  rating: number;
}

export interface LandingLinkCreateRequest {
  title: string;
  url: string;
  image_url?: string;
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

export interface LandingReviewUpdateRequest {
  gen?: number;
  content: string;
  rating: number;
}

export interface LandingLinkUpdateRequest {
  title: string;
  url: string;
  image_url?: string;
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

export interface LandingReviewCreateResponse {
  id: number;
}

export interface LandingReviewUpdateResponse {
  id: number;
}

export interface LandingLinkCreateResponse {
  id: number;
}

export interface LandingLinkUpdateResponse {
  id: number;
}
