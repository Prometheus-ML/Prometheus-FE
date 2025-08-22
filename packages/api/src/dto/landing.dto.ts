// Landing API DTO

// 후원사 목록 조회 응답
export interface LandingSponsorListResponseDto {
  sponsors: {
    id: number;
    name: string;
    logo_url: string | null;
    purpose: string | null;
    amount: number | null;
    note: string | null;
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

// 인터뷰 목록 조회 응답 (공개)
export interface LandingInterviewListResponseDto {
  interviews: {
    id: number;
    member_id: string;
    member_name: string;
    member_gen: number;
    gen: number;
    content: string;
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
    post_date: string;
    created_at: string;
  }[];
  total: number;
  page: number;
  size: number;
}

// 인터뷰 생성 요청
export interface LandingInterviewCreateRequestDto {
  member_id: string;
  gen: number;
  content: string;
}

// 인터뷰 생성 응답
export interface LandingInterviewCreateResponseDto {
  id: number;
}

// 인터뷰 수정 요청
export interface LandingInterviewUpdateRequestDto {
  gen: number;
  content: string;
}

// 인터뷰 수정 응답
export interface LandingInterviewUpdateResponseDto {
  id: number;
}

// 링크 생성 요청
export interface LandingLinkCreateRequestDto {
  title: string;
  url: string;
  image_url?: string;
  post_date: string;
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
  post_date: string;
}

// 링크 수정 응답
export interface LandingLinkUpdateResponseDto {
  id: number;
}
