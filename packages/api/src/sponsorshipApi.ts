import { ApiClient } from './apiClient';
import {
  AdminSponsorListResponseDto,
  AdminHonorHallListResponseDto,
  SponsorCreateRequestDto,
  SponsorCreateResponseDto,
  HonorHallCreateRequestDto,
  HonorHallCreateResponseDto,
  PublicSponsorListResponseDto,
  PublicHonorHallListResponseDto
} from './dto/sponsorship.dto';

export class SponsorshipApi {
  private readonly api: ApiClient;
  private readonly adminBase = '/admin/sponsorship';
  private readonly publicBase = '/sponsorship';

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
  }

  // ===== 관리자용 API =====

  // 관리자용 후원사 목록 조회
  async getAdminSponsors(): Promise<AdminSponsorListResponseDto> {
    try {
      const response = await this.api.get<AdminSponsorListResponseDto>(`${this.adminBase}/sponsors`);
      return response;
    } catch (error: any) {
      console.error('Error fetching admin sponsors:', error);
      throw new Error(error.message || 'Failed to fetch admin sponsors');
    }
  }

  // 관리자용 명예의전당 목록 조회
  async getAdminHonorHall(): Promise<AdminHonorHallListResponseDto> {
    try {
      const response = await this.api.get<AdminHonorHallListResponseDto>(`${this.adminBase}/honor-hall`);
      return response;
    } catch (error: any) {
      console.error('Error fetching admin honor hall:', error);
      throw new Error(error.message || 'Failed to fetch admin honor hall');
    }
  }

  // 후원사 생성
  async createSponsor(data: SponsorCreateRequestDto): Promise<SponsorCreateResponseDto> {
    try {
      const response = await this.api.post<SponsorCreateResponseDto>(`${this.adminBase}/sponsors`, data);
      return response;
    } catch (error: any) {
      console.error('Error creating sponsor:', error);
      throw new Error(error.message || 'Failed to create sponsor');
    }
  }

  // 후원사 삭제
  async deleteSponsor(sponsorId: number): Promise<void> {
    try {
      await this.api.delete(`${this.adminBase}/sponsors/${sponsorId}`);
    } catch (error: any) {
      console.error(`Error deleting sponsor ${sponsorId}:`, error);
      throw new Error(error.message || 'Failed to delete sponsor');
    }
  }

  // 명예의전당 생성
  async createHonorHall(data: HonorHallCreateRequestDto): Promise<HonorHallCreateResponseDto> {
    try {
      const response = await this.api.post<HonorHallCreateResponseDto>(`${this.adminBase}/honor-hall`, data);
      return response;
    } catch (error: any) {
      console.error('Error creating honor hall:', error);
      throw new Error(error.message || 'Failed to create honor hall');
    }
  }

  // 명예의전당 삭제
  async deleteHonorHall(honorId: number): Promise<void> {
    try {
      await this.api.delete(`${this.adminBase}/honor-hall/${honorId}`);
    } catch (error: any) {
      console.error(`Error deleting honor hall ${honorId}:`, error);
      throw new Error(error.message || 'Failed to delete honor hall');
    }
  }

  // ===== 일반 사용자용 API =====

  // 일반 사용자용 후원사 목록 조회
  async getPublicSponsors(params?: any): Promise<PublicSponsorListResponseDto> {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.size) sp.set('size', String(params.size));
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const response = await this.api.get<PublicSponsorListResponseDto>(`${this.publicBase}/sponsors${query}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching public sponsors:', error);
      throw new Error(error.message || 'Failed to fetch public sponsors');
    }
  }

  // 일반 사용자용 명예의전당 목록 조회
  async getPublicHonorHall(): Promise<PublicHonorHallListResponseDto> {
    try {
      const response = await this.api.get<PublicHonorHallListResponseDto>(`${this.publicBase}/honor-hall/`);
      return response;
    } catch (error: any) {
      console.error('Error fetching public honor hall:', error);
      throw new Error(error.message || 'Failed to fetch public honor hall');
    }
  }
}


