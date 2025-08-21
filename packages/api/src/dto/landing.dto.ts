// Landing API DTO

// 후원사 목록 조회 응답
export interface LandingSponsorListResponseDto {
  sponsors: {
    id: number;
    name: string;
    logo_url: string | null;
    purpose: string;
    amount: number;
    note: string;
    sponsored_at: string;
  }[];
  total: number;
  page: number;
  size: number;
}

// 명예의전당 목록 조회 응답
export interface LandingHonorHallListResponseDto {
  honor_hall: {
    name: string;
    purpose: string;
  }[];
}

// 리뷰 목록 조회 응답
export interface LandingReviewListResponseDto {
  reviews: {
    id: number;
    member_id: string;
    content: string;
    rating: number;
    created_at: string;
  }[];
  total: number;
  page: number;
  size: number;
}

// 링크 목록 조회 응답
export interface LandingLinkListResponseDto {
  links: {
    id: number;
    title: string;
    url: string;
    image_url: string | null;
    created_at: string;
  }[];
  total: number;
  page: number;
  size: number;
}

// 리뷰 생성 요청
export interface LandingReviewCreateRequestDto {
  member_id: string;
  content: string;
  rating: number;
}

// 리뷰 생성 응답
export interface LandingReviewCreateResponseDto {
  id: number;
}

// 리뷰 수정 요청
export interface LandingReviewUpdateRequestDto {
  content: string;
  rating: number;
}

// 리뷰 수정 응답
export interface LandingReviewUpdateResponseDto {
  id: number;
}

// 링크 생성 요청
export interface LandingLinkCreateRequestDto {
  title: string;
  url: string;
  image_url?: string;
}

// 링크 생성 응답
export interface LandingLinkCreateResponseDto {
  id: number;
}

// 링크 수정 요청
export interface LandingLinkUpdateRequestDto {
  title: string;
  url: string;
  image_url?: string;
}

// 링크 수정 응답
export interface LandingLinkUpdateResponseDto {
  id: number;
}
