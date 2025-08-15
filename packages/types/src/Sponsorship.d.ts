// Sponsorship 관련 타입 정의

export interface Sponsor {
  id: number;
  name: string;
  logo_url: string;
  purpose: string;
  amount: number;
  note: string;
  sponsored_at: string;
}

export interface HonorHall {
  id: number;
  member_id: string;
  contribution_type: string;
  amount: number;
  description: string;
  benefit_info: string;
  is_public: boolean;
  created_at: string;
}

export interface HonorHallPublic {
  name: string;
  purpose: string;
}

export interface SponsorListParams {
  page?: number;
  size?: number;
}

export interface SponsorListResponse {
  sponsors: Sponsor[];
  total: number;
  page: number;
  size: number;
}

export interface SponsorCreateRequest {
  name: string;
  logo_url: string;
  purpose: string;
  amount: number;
  note: string;
  sponsored_at: string;
}

export interface HonorHallCreateRequest {
  member_id: string;
  contribution_type: string;
  amount: number;
  description: string;
  benefit_info: string;
  is_public: boolean;
}

export interface SponsorCreateResponse {
  id: number;
}

export interface HonorHallCreateResponse {
  id: number;
}


