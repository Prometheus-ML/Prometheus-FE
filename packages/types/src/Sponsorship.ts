export interface SponsorCreateRequest {
  name: string;
  logo_url?: string | null;
  description?: string | null;
  website_url?: string | null;
  contact_email?: string | null;
  sponsorship_level?: string | null;
}

export interface SponsorUpdateRequest {
  name?: string | null;
  logo_url?: string | null;
  description?: string | null;
  website_url?: string | null;
  contact_email?: string | null;
  sponsorship_level?: string | null;
  is_active?: boolean | null;
}

export interface SponsorResponse {
  id: number;
  name: string;
  logo_url?: string | null;
  description?: string | null;
  website_url?: string | null;
  contact_email?: string | null;
  sponsorship_level?: string | null;
  is_active: boolean;
  created_at: string; // ISO
  updated_at: string; // ISO
  meta?: Record<string, any> | null;
}

export interface SponsorListResponse {
  sponsors: SponsorResponse[];
  total: number;
  page: number;
  size: number;
}

export interface SponsorshipApplicationCreateRequest {
  sponsor_id: number;
  applicant_name: string;
  applicant_email: string;
  company_name: string;
  position?: string | null;
  phone?: string | null;
  sponsorship_type: string;
  amount?: number | null;
  description?: string | null;
}

export interface SponsorshipApplicationUpdateRequest {
  status?: string | null;
  notes?: string | null;
}

export interface SponsorshipApplicationResponse {
  id: number;
  sponsor_id: number;
  applicant_name: string;
  applicant_email: string;
  company_name: string;
  position?: string | null;
  phone?: string | null;
  sponsorship_type: string;
  amount?: number | null;
  description?: string | null;
  status: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SponsorshipApplicationListResponse {
  applications: SponsorshipApplicationResponse[];
  total: number;
  page: number;
  size: number;
}

export interface HonorHallCreateRequest {
  member_id: string;
  contribution_type: string;
  amount?: number | null;
  description?: string | null;
  benefit_info?: string | null;
  is_public: boolean;
}

export interface HonorHallUpdateRequest {
  contribution_type?: string | null;
  amount?: number | null;
  description?: string | null;
  benefit_info?: string | null;
  is_public?: boolean | null;
}

export interface HonorHallResponse {
  id: number;
  member_id: string;
  contribution_type: string;
  amount?: number | null;
  description?: string | null;
  benefit_info?: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface HonorHallListResponse {
  honor_hall: HonorHallResponse[];
  total: number;
  page: number;
  size: number;
}


