import { ApiClient } from './apiClient';
import type {
  SponsorCreateRequest,
  SponsorUpdateRequest,
  SponsorResponse,
  SponsorListResponse,
  SponsorshipApplicationCreateRequest,
  SponsorshipApplicationUpdateRequest,
  SponsorshipApplicationResponse,
  SponsorshipApplicationListResponse,
  HonorHallCreateRequest,
  HonorHallUpdateRequest,
  HonorHallResponse,
  HonorHallListResponse,
} from '@prometheus-fe/types';

export class SponsorshipApi {
  private readonly api: ApiClient;
  private readonly base = '/v1/sponsorship';

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
  }

  // Sponsors
  createSponsor(data: SponsorCreateRequest) {
    return this.api.post<SponsorResponse>(`${this.base}/sponsors`, data);
  }

  getSponsors(params?: Record<string, string | number | boolean | undefined>) {
    const sp = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => { if (v !== undefined && v !== null) sp.set(k, String(v)); });
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return this.api.get<SponsorListResponse>(`${this.base}/sponsors${q}`);
  }

  getSponsor(sponsorId: number | string) {
    return this.api.get<SponsorResponse>(`${this.base}/sponsors/${sponsorId}`);
  }

  updateSponsor(sponsorId: number | string, data: SponsorUpdateRequest) {
    return this.api.put<SponsorResponse>(`${this.base}/sponsors/${sponsorId}`, data);
  }

  deleteSponsor(sponsorId: number | string) {
    return this.api.delete<void>(`${this.base}/sponsors/${sponsorId}`);
  }

  // Applications
  createApplication(data: SponsorshipApplicationCreateRequest) {
    return this.api.post<SponsorshipApplicationResponse>(`${this.base}/applications`, data);
  }

  getApplications(params?: Record<string, string | number | undefined>) {
    const sp = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => { if (v !== undefined && v !== null) sp.set(k, String(v)); });
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return this.api.get<SponsorshipApplicationListResponse>(`${this.base}/applications${q}`);
  }

  updateApplication(applicationId: number | string, data: SponsorshipApplicationUpdateRequest) {
    return this.api.put<SponsorshipApplicationResponse>(`${this.base}/applications/${applicationId}`, data);
  }

  // Honor hall
  createHonor(data: HonorHallCreateRequest) {
    return this.api.post<HonorHallResponse>(`${this.base}/honor-hall`, data);
  }

  getHonorHall(params?: Record<string, string | number | boolean | undefined>) {
    const sp = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => { if (v !== undefined && v !== null) sp.set(k, String(v)); });
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return this.api.get<HonorHallListResponse>(`${this.base}/honor-hall${q}`);
  }

  updateHonor(honorId: number | string, data: HonorHallUpdateRequest) {
    return this.api.put<HonorHallResponse>(`${this.base}/honor-hall/${honorId}`, data);
  }
}


