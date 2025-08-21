import { ApiClient } from './apiClient';
import {
  LandingSponsorListResponseDto,
  LandingHonorHallListResponseDto,
  LandingReviewListResponseDto,
  LandingLinkListResponseDto,
  LandingReviewCreateRequestDto,
  LandingReviewCreateResponseDto,
  LandingReviewUpdateRequestDto,
  LandingReviewUpdateResponseDto,
  LandingLinkCreateRequestDto,
  LandingLinkCreateResponseDto,
  LandingLinkUpdateRequestDto,
  LandingLinkUpdateResponseDto
} from './dto/landing.dto';
import {
  LandingSponsor,
  LandingHonorHall,
  LandingReview,
  LandingLink
} from '@prometheus-fe/types';

export class LandingApi {
  private readonly api: ApiClient;
  private readonly base = '/landing';

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
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

  // 리뷰 목록 조회 (공개)
  async getReviews(params?: any): Promise<LandingReview[]> {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.size) sp.set('size', String(params.size));
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const response = await this.api.get<LandingReview[]>(`${this.base}/reviews${query}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      throw new Error(error.message || 'Failed to fetch reviews');
    }
  }

  // 리뷰 생성 (인증 필요)
  async createReview(data: LandingReviewCreateRequestDto): Promise<LandingReviewCreateResponseDto> {
    try {
      const response = await this.api.post<LandingReviewCreateResponseDto>(`${this.base}/reviews/`, data);
      return response;
    } catch (error: any) {
      console.error('Error creating review:', error);
      throw new Error(error.message || 'Failed to create review');
    }
  }

  // 리뷰 수정 (인증 필요)
  async updateReview(reviewId: number, data: LandingReviewUpdateRequestDto): Promise<LandingReviewUpdateResponseDto> {
    try {
      const response = await this.api.put<LandingReviewUpdateResponseDto>(`${this.base}/reviews/${reviewId}`, data);
      return response;
    } catch (error: any) {
      console.error(`Error updating review ${reviewId}:`, error);
      throw new Error(error.message || 'Failed to update review');
    }
  }

  // 리뷰 삭제 (인증 필요)
  async deleteReview(reviewId: number): Promise<void> {
    try {
      await this.api.delete(`${this.base}/reviews/${reviewId}`);
    } catch (error: any) {
      console.error(`Error deleting review ${reviewId}:`, error);
      throw new Error(error.message || 'Failed to delete review');
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

  // Admin 후원사 목록 조회 (Super 이상)
  async getAdminSponsors(): Promise<LandingSponsor[]> {
    try {
      const response = await this.api.get<LandingSponsor[]>(`${this.base}/admin/sponsors`);
      return response;
    } catch (error: any) {
      console.error('Error fetching admin sponsors:', error);
      throw new Error(error.message || 'Failed to fetch admin sponsors');
    }
  }

  // Admin 후원사 생성 (Super 이상)
  async createAdminSponsor(data: any): Promise<any> {
    try {
      const response = await this.api.post(`${this.base}/admin/sponsors`, data);
      return response;
    } catch (error: any) {
      console.error('Error creating admin sponsor:', error);
      throw new Error(error.message || 'Failed to create admin sponsor');
    }
  }

  // Admin 후원사 삭제 (Super 이상)
  async deleteAdminSponsor(sponsorId: number): Promise<void> {
    try {
      await this.api.delete(`${this.base}/admin/sponsors/${sponsorId}`);
    } catch (error: any) {
      console.error(`Error deleting admin sponsor ${sponsorId}:`, error);
      throw new Error(error.message || 'Failed to delete admin sponsor');
    }
  }

  // Admin 명예의전당 목록 조회 (Super 이상)
  async getAdminHonorHall(): Promise<LandingHonorHall[]> {
    try {
      const response = await this.api.get<LandingHonorHall[]>(`${this.base}/admin/honor-hall`);
      return response;
    } catch (error: any) {
      console.error('Error fetching admin honor hall:', error);
      throw new Error(error.message || 'Failed to fetch admin honor hall');
    }
  }

  // Admin 명예의전당 생성 (Super 이상)
  async createAdminHonorHall(data: any): Promise<any> {
    try {
      const response = await this.api.post(`${this.base}/admin/honor-hall`, data);
      return response;
    } catch (error: any) {
      console.error('Error creating admin honor hall:', error);
      throw new Error(error.message || 'Failed to create admin honor hall');
    }
  }

  // Admin 명예의전당 삭제 (Super 이상)
  async deleteAdminHonorHall(honorHallId: number): Promise<void> {
    try {
      await this.api.delete(`${this.base}/admin/honor-hall/${honorHallId}`);
    } catch (error: any) {
      console.error(`Error deleting admin honor hall ${honorHallId}:`, error);
      throw new Error(error.message || 'Failed to delete admin honor hall');
    }
  }

  // Admin 리뷰 목록 조회 (Super 이상)
  async getAdminReviews(): Promise<LandingReview[]> {
    try {
      const response = await this.api.get<LandingReview[]>(`${this.base}/admin/reviews`);
      return response;
    } catch (error: any) {
      console.error('Error fetching admin reviews:', error);
      throw new Error(error.message || 'Failed to fetch admin reviews');
    }
  }

  // Admin 리뷰 생성 (Super 이상)
  async createAdminReview(data: LandingReviewCreateRequestDto): Promise<LandingReviewCreateResponseDto> {
    try {
      const response = await this.api.post<LandingReviewCreateResponseDto>(`${this.base}/admin/reviews`, data);
      return response;
    } catch (error: any) {
      console.error('Error creating admin review:', error);
      throw new Error(error.message || 'Failed to create admin review');
    }
  }

  // Admin 리뷰 수정 (Super 이상)
  async updateAdminReview(reviewId: number, data: LandingReviewUpdateRequestDto): Promise<LandingReviewUpdateResponseDto> {
    try {
      const response = await this.api.put<LandingReviewUpdateResponseDto>(`${this.base}/admin/reviews/${reviewId}`, data);
      return response;
    } catch (error: any) {
      console.error(`Error updating admin review ${reviewId}:`, error);
      throw new Error(error.message || 'Failed to update admin review');
    }
  }

  // Admin 리뷰 삭제 (Super 이상)
  async deleteAdminReview(reviewId: number): Promise<void> {
    try {
      await this.api.delete(`${this.base}/admin/reviews/${reviewId}`);
    } catch (error: any) {
      console.error(`Error deleting admin review ${reviewId}:`, error);
      throw new Error(error.message || 'Failed to delete admin review');
    }
  }

  // Admin 링크 목록 조회 (Super 이상)
  async getAdminLinks(): Promise<LandingLink[]> {
    try {
      const response = await this.api.get<LandingLink[]>(`${this.base}/admin/links`);
      return response;
    } catch (error: any) {
      console.error('Error fetching admin links:', error);
      throw new Error(error.message || 'Failed to fetch admin links');
    }
  }

  // Admin 링크 생성 (Super 이상)
  async createAdminLink(data: LandingLinkCreateRequestDto): Promise<LandingLinkCreateResponseDto> {
    try {
      const response = await this.api.post<LandingLinkCreateResponseDto>(`${this.base}/admin/links`, data);
      return response;
    } catch (error: any) {
      console.error('Error creating admin link:', error);
      throw new Error(error.message || 'Failed to create admin link');
    }
  }

  // Admin 링크 수정 (Super 이상)
  async updateAdminLink(linkId: number, data: LandingLinkUpdateRequestDto): Promise<LandingLinkUpdateResponseDto> {
    try {
      const response = await this.api.put<LandingLinkUpdateResponseDto>(`${this.base}/admin/links/${linkId}`, data);
      return response;
    } catch (error: any) {
      console.error(`Error updating admin link ${linkId}:`, error);
      throw new Error(error.message || 'Failed to update admin link');
    }
  }

  // Admin 링크 삭제 (Super 이상)
  async deleteAdminLink(linkId: number): Promise<void> {
    try {
      await this.api.delete(`${this.base}/admin/links/${linkId}`);
    } catch (error: any) {
      console.error(`Error deleting admin link ${linkId}:`, error);
      throw new Error(error.message || 'Failed to delete admin link');
    }
  }
}
