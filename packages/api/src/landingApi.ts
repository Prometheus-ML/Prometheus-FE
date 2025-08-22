import { ApiClient } from './apiClient';
import {
  LandingSponsorListResponseDto,
  LandingHonorHallListResponseDto,
  LandingInterviewListResponseDto,
  LandingLinkListResponseDto,
  LandingHistoryListResponseDto,
  LandingHistoryCreateRequestDto,
  LandingHistoryCreateResponseDto,
  LandingHistoryUpdateRequestDto,
  LandingHistoryUpdateResponseDto,
  LandingInterviewCreateRequestDto,
  LandingInterviewCreateResponseDto,
  LandingInterviewUpdateRequestDto,
  LandingInterviewUpdateResponseDto,
  LandingLinkCreateRequestDto,
  LandingLinkCreateResponseDto,
  LandingLinkUpdateRequestDto,
  LandingLinkUpdateResponseDto
} from './dto/landing.dto';
import {
  LandingSponsor,
  LandingHonorHall,
  LandingInterview,
  LandingLink,
  LandingHistory
} from '@prometheus-fe/types';

export class LandingApi {
  private readonly api: ApiClient;
  private readonly base = '/landing';

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
  }

  // ===== 히스토리 API =====

  // 히스토리 목록 조회 (JWT 토큰 필요)
  async getHistories(params?: any): Promise<LandingHistory[]> {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.size) sp.set('size', String(params.size));
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const response = await this.api.get<LandingHistory[]>(`${this.base}/history${query}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching histories:', error);
      throw new Error(error.message || 'Failed to fetch histories');
    }
  }

  // 히스토리 생성 (인증 필요)
  async createHistory(data: LandingHistoryCreateRequestDto): Promise<LandingHistoryCreateResponseDto> {
    try {
      const response = await this.api.post<LandingHistoryCreateResponseDto>(`${this.base}/history/`, data);
      return response;
    } catch (error: any) {
      console.error('Error creating history:', error);
      throw new Error(error.message || 'Failed to create history');
    }
  }

  // 히스토리 수정 (인증 필요)
  async updateHistory(historyId: number, data: LandingHistoryUpdateRequestDto): Promise<LandingHistoryUpdateResponseDto> {
    try {
      const response = await this.api.put<LandingHistoryUpdateResponseDto>(`${this.base}/history/${historyId}`, data);
      return response;
    } catch (error: any) {
      console.error(`Error updating history ${historyId}:`, error);
      throw new Error(error.message || 'Failed to update history');
    }
  }

  // 히스토리 삭제 (인증 필요)
  async deleteHistory(historyId: number): Promise<void> {
    try {
      await this.api.delete(`${this.base}/history/${historyId}`);
    } catch (error: any) {
      console.error(`Error deleting history ${historyId}:`, error);
      throw new Error(error.message || 'Failed to delete history');
    }
  }

  // ===== 후원사 API =====

  // 후원사 목록 조회 (공개)
  async getSponsors(params?: any): Promise<LandingSponsorListResponseDto> {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.size) sp.set('size', String(params.size));
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const response = await this.api.get<LandingSponsorListResponseDto>(`${this.base}/sponsors${query}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching sponsors:', error);
      throw new Error(error.message || 'Failed to fetch sponsors');
    }
  }

  // ===== 명예의전당 API =====

  // 명예의전당 목록 조회 (인증 필요)
  async getHonorHall(): Promise<LandingHonorHall[]> {
    try {
      const response = await this.api.get<LandingHonorHall[]>(`${this.base}/honor-hall/`);
      return response;
    } catch (error: any) {
      console.error('Error fetching honor hall:', error);
      throw new Error(error.message || 'Failed to fetch honor hall');
    }
  }

  // ===== 리뷰 API =====

  // 인터뷰 목록 조회 (공개)
  async getInterviews(params?: any): Promise<LandingInterview[]> {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.size) sp.set('size', String(params.size));
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const response = await this.api.get<LandingInterview[]>(`${this.base}/interviews${query}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching interviews:', error);
      throw new Error(error.message || 'Failed to fetch interviews');
    }
  }

  // 인터뷰 생성 (인증 필요)
  async createInterview(data: LandingInterviewCreateRequestDto): Promise<LandingInterviewCreateResponseDto> {
    try {
      const response = await this.api.post<LandingInterviewCreateResponseDto>(`${this.base}/interviews/`, data);
      return response;
    } catch (error: any) {
      console.error('Error creating interview:', error);
      throw new Error(error.message || 'Failed to create interview');
    }
  }

  // 인터뷰 수정 (인증 필요)
  async updateInterview(interviewId: number, data: LandingInterviewUpdateRequestDto): Promise<LandingInterviewUpdateResponseDto> {
    try {
      const response = await this.api.put<LandingInterviewUpdateResponseDto>(`${this.base}/interviews/${interviewId}`, data);
      return response;
    } catch (error: any) {
      console.error(`Error updating interview ${interviewId}:`, error);
      throw new Error(error.message || 'Failed to update interview');
    }
  }

  // 인터뷰 삭제 (인증 필요)
  async deleteInterview(interviewId: number): Promise<void> {
    try {
      await this.api.delete(`${this.base}/interviews/${interviewId}`);
    } catch (error: any) {
      console.error(`Error deleting interview ${interviewId}:`, error);
      throw new Error(error.message || 'Failed to delete interview');
    }
  }

  // ===== 링크 API =====

  // 링크 목록 조회 (공개)
  async getLinks(params?: any): Promise<LandingLink[]> {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.size) sp.set('size', String(params.size));
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const response = await this.api.get<LandingLink[]>(`${this.base}/links${query}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching links:', error);
      throw new Error(error.message || 'Failed to fetch links');
    }
  }

  // 링크 생성 (인증 필요)
  async createLink(data: LandingLinkCreateRequestDto): Promise<LandingLinkCreateResponseDto> {
    try {
      const response = await this.api.post<LandingLinkCreateResponseDto>(`${this.base}/links/`, data);
      return response;
    } catch (error: any) {
      console.error('Error creating link:', error);
      throw new Error(error.message || 'Failed to create link');
    }
  }

  // 링크 수정 (인증 필요)
  async updateLink(linkId: number, data: LandingLinkUpdateRequestDto): Promise<LandingLinkUpdateResponseDto> {
    try {
      const response = await this.api.put<LandingLinkUpdateResponseDto>(`${this.base}/links/${linkId}`, data);
      return response;
    } catch (error: any) {
      console.error(`Error updating link ${linkId}:`, error);
      throw new Error(error.message || 'Failed to update link');
    }
  }

  // 링크 삭제 (인증 필요)
  async deleteLink(linkId: number): Promise<void> {
    try {
      await this.api.delete(`${this.base}/links/${linkId}`);
    } catch (error: any) {
      console.error(`Error deleting link ${linkId}:`, error);
      throw new Error(error.message || 'Failed to delete link');
    }
  }

  // ===== Admin API =====

  // Admin 히스토리 목록 조회 (Super 이상)
  async getAdminHistories(): Promise<LandingHistory[]> {
    try {
      const response = await this.api.get<LandingHistory[]>(`/admin/landing/history`);
      return response;
    } catch (error: any) {
      console.error('Error fetching admin histories:', error);
      throw new Error(error.message || 'Failed to fetch admin histories');
    }
  }

  // Admin 히스토리 생성 (Super 이상)
  async createAdminHistory(data: LandingHistoryCreateRequestDto): Promise<LandingHistoryCreateResponseDto> {
    try {
      const response = await this.api.post<LandingHistoryCreateResponseDto>(`/admin/landing/history`, data);
      return response;
    } catch (error: any) {
      console.error('Error creating admin history:', error);
      throw new Error(error.message || 'Failed to create admin history');
    }
  }

  // Admin 히스토리 수정 (Super 이상)
  async updateAdminHistory(historyId: number, data: LandingHistoryUpdateRequestDto): Promise<LandingHistoryUpdateResponseDto> {
    try {
      const response = await this.api.put<LandingHistoryUpdateResponseDto>(`/admin/landing/history/${historyId}`, data);
      return response;
    } catch (error: any) {
      console.error(`Error updating admin history ${historyId}:`, error);
      throw new Error(error.message || 'Failed to update admin history');
    }
  }

  // Admin 히스토리 삭제 (Super 이상)
  async deleteAdminHistory(historyId: number): Promise<void> {
    try {
      await this.api.delete(`/admin/landing/history/${historyId}`);
    } catch (error: any) {
      console.error(`Error deleting admin history ${historyId}:`, error);
      throw new Error(error.message || 'Failed to delete admin history');
    }
  }

  // Admin 후원사 목록 조회 (Super 이상)
  async getAdminSponsors(): Promise<LandingSponsor[]> {
    try {
      const response = await this.api.get<LandingSponsor[]>(`/admin/landing/sponsors`);
      return response;
    } catch (error: any) {
      console.error('Error fetching admin sponsors:', error);
      throw new Error(error.message || 'Failed to fetch admin sponsors');
    }
  }

  // Admin 후원사 생성 (Super 이상)
  async createAdminSponsor(data: any): Promise<any> {
    try {
      const response = await this.api.post(`/admin/landing/sponsors`, data);
      return response;
    } catch (error: any) {
      console.error('Error creating admin sponsor:', error);
      throw new Error(error.message || 'Failed to create admin sponsor');
    }
  }

  // Admin 후원사 삭제 (Super 이상)
  async deleteAdminSponsor(sponsorId: number): Promise<void> {
    try {
      await this.api.delete(`/admin/landing/sponsors/${sponsorId}`);
    } catch (error: any) {
      console.error(`Error deleting admin sponsor ${sponsorId}:`, error);
      throw new Error(error.message || 'Failed to delete admin sponsor');
    }
  }

  // Admin 명예의전당 목록 조회 (Super 이상)
  async getAdminHonorHall(): Promise<LandingHonorHall[]> {
    try {
      const response = await this.api.get<LandingHonorHall[]>(`/admin/landing/honor-hall`);
      return response;
    } catch (error: any) {
      console.error('Error fetching admin honor hall:', error);
      throw new Error(error.message || 'Failed to fetch admin honor hall');
    }
  }

  // Admin 명예의전당 생성 (Super 이상)
  async createAdminHonorHall(data: any): Promise<any> {
    try {
      const response = await this.api.post(`/admin/landing/honor-hall`, data);
      return response;
    } catch (error: any) {
      console.error('Error creating admin honor hall:', error);
      throw new Error(error.message || 'Failed to create admin honor hall');
    }
  }

  // Admin 명예의전당 삭제 (Super 이상)
  async deleteAdminHonorHall(honorHallId: number): Promise<void> {
    try {
      await this.api.delete(`/admin/landing/honor-hall/${honorHallId}`);
    } catch (error: any) {
      console.error(`Error deleting admin honor hall ${honorHallId}:`, error);
      throw new Error(error.message || 'Failed to delete admin honor hall');
    }
  }

  // Admin 인터뷰 목록 조회 (Super 이상)
  async getAdminInterviews(): Promise<LandingInterview[]> {
    try {
      const response = await this.api.get<LandingInterview[]>(`/admin/landing/interviews`);
      return response;
    } catch (error: any) {
      console.error('Error fetching admin interviews:', error);
      throw new Error(error.message || 'Failed to fetch admin interviews');
    }
  }

  // Admin 인터뷰 생성 (Super 이상)
  async createAdminInterview(data: LandingInterviewCreateRequestDto): Promise<LandingInterviewCreateResponseDto> {
    try {
      const response = await this.api.post<LandingInterviewCreateResponseDto>(`/admin/landing/interviews`, data);
      return response;
    } catch (error: any) {
      console.error('Error creating admin interview:', error);
      throw new Error(error.message || 'Failed to create admin interview');
    }
  }

  // Admin 인터뷰 수정 (Super 이상)
  async updateAdminInterview(interviewId: number, data: LandingInterviewUpdateRequestDto): Promise<LandingInterviewUpdateResponseDto> {
    try {
      const response = await this.api.put<LandingInterviewUpdateResponseDto>(`/admin/landing/interviews/${interviewId}`, data);
      return response;
    } catch (error: any) {
      console.error(`Error updating admin interview ${interviewId}:`, error);
      throw new Error(error.message || 'Failed to update admin interview');
    }
  }

  // Admin 인터뷰 삭제 (Super 이상)
  async deleteAdminInterview(interviewId: number): Promise<void> {
    try {
      await this.api.delete(`/admin/landing/interviews/${interviewId}`);
    } catch (error: any) {
      console.error(`Error deleting admin interview ${interviewId}:`, error);
      throw new Error(error.message || 'Failed to delete admin interview');
    }
  }

  // Admin 링크 목록 조회 (Super 이상)
  async getAdminLinks(): Promise<LandingLink[]> {
    try {
      const response = await this.api.get<LandingLink[]>(`/admin/landing/links`);
      return response;
    } catch (error: any) {
      console.error('Error fetching admin links:', error);
      throw new Error(error.message || 'Failed to fetch admin links');
    }
  }

  // Admin 링크 생성 (Super 이상)
  async createAdminLink(data: LandingLinkCreateRequestDto): Promise<LandingLinkCreateResponseDto> {
    try {
      const response = await this.api.post<LandingLinkCreateResponseDto>(`/admin/landing/links`, data);
      return response;
    } catch (error: any) {
      console.error('Error creating admin link:', error);
      throw new Error(error.message || 'Failed to create admin link');
    }
  }

  // Admin 링크 수정 (Super 이상)
  async updateAdminLink(linkId: number, data: LandingLinkUpdateRequestDto): Promise<LandingLinkUpdateResponseDto> {
    try {
      const response = await this.api.put<LandingLinkUpdateResponseDto>(`/admin/landing/links/${linkId}`, data);
      return response;
    } catch (error: any) {
      console.error(`Error updating admin link ${linkId}:`, error);
      throw new Error(error.message || 'Failed to update admin link');
    }
  }

  // Admin 링크 삭제 (Super 이상)
  async deleteAdminLink(linkId: number): Promise<void> {
    try {
      await this.api.delete(`/admin/landing/links/${linkId}`);
    } catch (error: any) {
      console.error(`Error deleting admin link ${linkId}:`, error);
      throw new Error(error.message || 'Failed to delete admin link');
    }
  }
}
