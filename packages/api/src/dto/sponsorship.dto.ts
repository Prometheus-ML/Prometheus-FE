// Sponsorship API DTO

// 관리자용 후원사 목록 조회 응답
export interface AdminSponsorListResponseDto {
  sponsors: {
    id: number;
    name: string;
    logo_url: string;
    purpose: string;
    amount: number;
    note: string;
    sponsored_at: string;
  }[];
}

// 관리자용 명예의전당 목록 조회 응답
export interface AdminHonorHallListResponseDto {
  honor_hall: {
    id: number;
    member_id: string;
    contribution_type: string;
    amount: number;
    description: string;
    benefit_info: string;
    is_public: boolean;
    created_at: string;
  }[];
}

// 후원사 생성 요청
export interface SponsorCreateRequestDto {
  name: string;
  logo_url: string;
  purpose: string;
  amount: number;
  note: string;
  sponsored_at: string;
}

// 후원사 생성 응답
export interface SponsorCreateResponseDto {
  id: number;
}

// 명예의전당 생성 요청
export interface HonorHallCreateRequestDto {
  member_id: string;
  contribution_type: string;
  amount: number;
  description: string;
  benefit_info: string;
  is_public: boolean;
}

// 명예의전당 생성 응답
export interface HonorHallCreateResponseDto {
  id: number;
}

// 일반 사용자용 후원사 목록 조회 응답
export interface PublicSponsorListResponseDto {
  sponsors: {
    id: number;
    name: string;
    logo_url: string;
    purpose: string;
    amount: number;
    note: string;
    sponsored_at: string;
  }[];
  total: number;
  page: number;
  size: number;
}

// 일반 사용자용 명예의전당 목록 조회 응답
export interface PublicHonorHallListResponseDto {
  honor_hall: {
    name: string;
    purpose: string;
  }[];
}
