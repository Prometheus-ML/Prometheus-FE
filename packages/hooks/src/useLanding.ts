import { useState, useCallback } from 'react';
import { useApi } from '@prometheus-fe/context';
import {
  LandingSponsor,
  LandingHonorHall,
  LandingReview,
  LandingLink,
  LandingSponsorListParams,
  LandingSponsorListResponse,
  LandingReviewListParams,
  LandingLinkListParams,
  LandingSponsorCreateRequest,
  LandingHonorHallCreateRequest,
  LandingReviewCreateRequest,
  LandingLinkCreateRequest,
  LandingReviewUpdateRequest,
  LandingLinkUpdateRequest
} from '@prometheus-fe/types';

export const useLanding = () => {
  const { landing } = useApi();
  
  // 상태 관리
  const [sponsors, setSponsors] = useState<LandingSponsor[]>([]);
  const [honorHall, setHonorHall] = useState<LandingHonorHall[]>([]);
  const [reviews, setReviews] = useState<LandingReview[]>([]);
  const [links, setLinks] = useState<LandingLink[]>([]);
  const [selectedReview, setSelectedReview] = useState<LandingReview | null>(null);
  const [selectedLink, setSelectedLink] = useState<LandingLink | null>(null);
  
  // Admin 상태 관리
  const [adminSponsors, setAdminSponsors] = useState<LandingSponsor[]>([]);
  const [adminHonorHall, setAdminHonorHall] = useState<LandingHonorHall[]>([]);
  const [adminReviews, setAdminReviews] = useState<LandingReview[]>([]);
  const [adminLinks, setAdminLinks] = useState<LandingLink[]>([]);
  
  // 로딩 상태
  const [isLoadingSponsors, setIsLoadingSponsors] = useState<boolean>(false);
  const [isLoadingHonorHall, setIsLoadingHonorHall] = useState<boolean>(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(false);
  const [isLoadingLinks, setIsLoadingLinks] = useState<boolean>(false);
  
  // Admin 로딩 상태
  const [isLoadingAdminSponsors, setIsLoadingAdminSponsors] = useState<boolean>(false);
  const [isLoadingAdminHonorHall, setIsLoadingAdminHonorHall] = useState<boolean>(false);
  const [isLoadingAdminReviews, setIsLoadingAdminReviews] = useState<boolean>(false);
  const [isLoadingAdminLinks, setIsLoadingAdminLinks] = useState<boolean>(false);
  
  // 페이지네이션 상태
  const [sponsorsTotal, setSponsorsTotal] = useState<number>(0);
  const [reviewsTotal, setReviewsTotal] = useState<number>(0);
  const [linksTotal, setLinksTotal] = useState<number>(0);

  // ===== 후원사 API =====

  // 후원사 목록 조회 (공개)
  const getSponsors = useCallback(async (params?: LandingSponsorListParams): Promise<LandingSponsorListResponse> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      setIsLoadingSponsors(true);
      const data = await landing.getSponsors(params);
      setSponsors(data.sponsors || []);
      setSponsorsTotal(data.total || 0);
      return data;
    } catch (error) {
      console.error('Failed to fetch sponsors:', error);
      throw error;
    } finally {
      setIsLoadingSponsors(false);
    }
  }, [landing]);

  // ===== 명예의전당 API =====

  // 명예의전당 목록 조회 (인증 필요)
  const getHonorHall = useCallback(async (): Promise<LandingHonorHall[]> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      setIsLoadingHonorHall(true);
      const data = await landing.getHonorHall();
      setHonorHall(data || []);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch honor hall:', error);
      throw error;
    } finally {
      setIsLoadingHonorHall(false);
    }
  }, [landing]);

  // ===== 리뷰 API =====

  // 리뷰 목록 조회 (공개)
  const getReviews = useCallback(async (params?: LandingReviewListParams): Promise<LandingReview[]> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      setIsLoadingReviews(true);
      const data = await landing.getReviews(params);
      setReviews(data || []);
      setReviewsTotal(data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      throw error;
    } finally {
      setIsLoadingReviews(false);
    }
  }, [landing]);

  // 리뷰 생성 (인증 필요)
  const createReview = useCallback(async (data: LandingReviewCreateRequest): Promise<number> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      const response = await landing.createReview(data);
      return response.id;
    } catch (error) {
      console.error('Failed to create review:', error);
      throw error;
    }
  }, [landing]);

  // 리뷰 수정 (인증 필요)
  const updateReview = useCallback(async (reviewId: number, data: LandingReviewUpdateRequest): Promise<number> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      const response = await landing.updateReview(reviewId, data);
      return response.id;
    } catch (error) {
      console.error(`Failed to update review ${reviewId}:`, error);
      throw error;
    }
  }, [landing]);

  // 리뷰 삭제 (인증 필요)
  const deleteReview = useCallback(async (reviewId: number): Promise<void> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      await landing.deleteReview(reviewId);
    } catch (error) {
      console.error(`Failed to delete review ${reviewId}:`, error);
      throw error;
    }
  }, [landing]);

  // ===== 링크 API =====

  // 링크 목록 조회 (공개)
  const getLinks = useCallback(async (params?: LandingLinkListParams): Promise<LandingLink[]> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      setIsLoadingLinks(true);
      const data = await landing.getLinks(params);
      setLinks(data || []);
      setLinksTotal(data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch links:', error);
      throw error;
    } finally {
      setIsLoadingLinks(false);
    }
  }, [landing]);

  // 링크 생성 (인증 필요)
  const createLink = useCallback(async (data: LandingLinkCreateRequest): Promise<number> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      const response = await landing.createLink(data);
      return response.id;
    } catch (error) {
      console.error('Failed to create link:', error);
      throw error;
    }
  }, [landing]);

  // 링크 수정 (인증 필요)
  const updateLink = useCallback(async (linkId: number, data: LandingLinkUpdateRequest): Promise<number> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      const response = await landing.updateLink(linkId, data);
      return response.id;
    } catch (error) {
      console.error(`Failed to update link ${linkId}:`, error);
      throw error;
    }
  }, [landing]);

  // 링크 삭제 (인증 필요)
  const deleteLink = useCallback(async (linkId: number): Promise<void> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      await landing.deleteLink(linkId);
    } catch (error) {
      console.error(`Failed to delete link ${linkId}:`, error);
      throw error;
    }
  }, [landing]);

  // ===== Admin API =====

  // Admin 후원사 목록 조회 (Super 이상)
  const getAdminSponsors = useCallback(async (): Promise<LandingSponsor[]> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      setIsLoadingAdminSponsors(true);
      const data = await landing.getAdminSponsors();
      setAdminSponsors(data || []);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch admin sponsors:', error);
      throw error;
    } finally {
      setIsLoadingAdminSponsors(false);
    }
  }, [landing]);

  // Admin 후원사 생성 (Super 이상)
  const createSponsor = useCallback(async (data: LandingSponsorCreateRequest): Promise<number> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      const response = await landing.createAdminSponsor(data);
      return response.id;
    } catch (error) {
      console.error('Failed to create admin sponsor:', error);
      throw error;
    }
  }, [landing]);

  // Admin 후원사 삭제 (Super 이상)
  const deleteSponsor = useCallback(async (sponsorId: number): Promise<void> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      await landing.deleteAdminSponsor(sponsorId);
    } catch (error) {
      console.error(`Failed to delete admin sponsor ${sponsorId}:`, error);
      throw error;
    }
  }, [landing]);

  // Admin 명예의전당 목록 조회 (Super 이상)
  const getAdminHonorHall = useCallback(async (): Promise<LandingHonorHall[]> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      setIsLoadingAdminHonorHall(true);
      const data = await landing.getAdminHonorHall();
      setAdminHonorHall(data || []);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch admin honor hall:', error);
      throw error;
    } finally {
      setIsLoadingAdminHonorHall(false);
    }
  }, [landing]);

  // Admin 명예의전당 생성 (Super 이상)
  const createHonorHall = useCallback(async (data: LandingHonorHallCreateRequest): Promise<number> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      const response = await landing.createAdminHonorHall(data);
      return response.id;
    } catch (error) {
      console.error('Failed to create admin honor hall:', error);
      throw error;
    }
  }, [landing]);

  // Admin 명예의전당 삭제 (Super 이상)
  const deleteHonorHall = useCallback(async (honorHallId: number): Promise<void> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      await landing.deleteAdminHonorHall(honorHallId);
    } catch (error) {
      console.error(`Failed to delete admin honor hall ${honorHallId}:`, error);
      throw error;
    }
  }, [landing]);

  // Admin 리뷰 목록 조회 (Super 이상)
  const getAdminReviews = useCallback(async (): Promise<LandingReview[]> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      setIsLoadingAdminReviews(true);
      const data = await landing.getAdminReviews();
      setAdminReviews(data || []);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch admin reviews:', error);
      throw error;
    } finally {
      setIsLoadingAdminReviews(false);
    }
  }, [landing]);

  // Admin 리뷰 생성 (Super 이상)
  const createAdminReview = useCallback(async (data: LandingReviewCreateRequest): Promise<number> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      const response = await landing.createAdminReview(data);
      return response.id;
    } catch (error) {
      console.error('Failed to create admin review:', error);
      throw error;
    }
  }, [landing]);

  // Admin 리뷰 수정 (Super 이상)
  const updateAdminReview = useCallback(async (reviewId: number, data: LandingReviewUpdateRequest): Promise<number> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      const response = await landing.updateAdminReview(reviewId, data);
      return response.id;
    } catch (error) {
      console.error(`Failed to update admin review ${reviewId}:`, error);
      throw error;
    }
  }, [landing]);

  // Admin 리뷰 삭제 (Super 이상)
  const deleteAdminReview = useCallback(async (reviewId: number): Promise<void> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      await landing.deleteAdminReview(reviewId);
    } catch (error) {
      console.error(`Failed to delete admin review ${reviewId}:`, error);
      throw error;
    }
  }, [landing]);

  // Admin 링크 목록 조회 (Super 이상)
  const getAdminLinks = useCallback(async (): Promise<LandingLink[]> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      setIsLoadingAdminLinks(true);
      const data = await landing.getAdminLinks();
      setAdminLinks(data || []);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch admin links:', error);
      throw error;
    } finally {
      setIsLoadingAdminLinks(false);
    }
  }, [landing]);

  // Admin 링크 생성 (Super 이상)
  const createAdminLink = useCallback(async (data: LandingLinkCreateRequest): Promise<number> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      const response = await landing.createAdminLink(data);
      return response.id;
    } catch (error) {
      console.error('Failed to create admin link:', error);
      throw error;
    }
  }, [landing]);

  // Admin 링크 수정 (Super 이상)
  const updateAdminLink = useCallback(async (linkId: number, data: LandingLinkUpdateRequest): Promise<number> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      const response = await landing.updateAdminLink(linkId, data);
      return response.id;
    } catch (error) {
      console.error(`Failed to update admin link ${linkId}:`, error);
      throw error;
    }
  }, [landing]);

  // Admin 링크 삭제 (Super 이상)
  const deleteAdminLink = useCallback(async (linkId: number): Promise<void> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      await landing.deleteAdminLink(linkId);
    } catch (error) {
      console.error(`Failed to delete admin link ${linkId}:`, error);
      throw error;
    }
  }, [landing]);

  // 선택된 항목 관리
  const handleReviewSelect = useCallback((review: LandingReview): void => {
    setSelectedReview(review);
  }, []);

  const handleReviewDeselect = useCallback((): void => {
    setSelectedReview(null);
  }, []);

  const handleLinkSelect = useCallback((link: LandingLink): void => {
    setSelectedLink(link);
  }, []);

  const handleLinkDeselect = useCallback((): void => {
    setSelectedLink(null);
  }, []);

  // 상태 초기화
  const clearSponsors = useCallback((): void => {
    setSponsors([]);
    setSponsorsTotal(0);
  }, []);

  const clearHonorHall = useCallback((): void => {
    setHonorHall([]);
  }, []);

  const clearReviews = useCallback((): void => {
    setReviews([]);
    setReviewsTotal(0);
  }, []);

  const clearLinks = useCallback((): void => {
    setLinks([]);
    setLinksTotal(0);
  }, []);

  return {
    // 상태
    sponsors,
    honorHall,
    reviews,
    links,
    selectedReview,
    selectedLink,
    
    // Admin 상태
    adminSponsors,
    adminHonorHall,
    adminReviews,
    adminLinks,
    
    // 로딩 상태
    isLoadingSponsors,
    isLoadingHonorHall,
    isLoadingReviews,
    isLoadingLinks,
    
    // Admin 로딩 상태
    isLoadingAdminSponsors,
    isLoadingAdminHonorHall,
    isLoadingAdminReviews,
    isLoadingAdminLinks,
    
    // 페이지네이션
    sponsorsTotal,
    reviewsTotal,
    linksTotal,
    
    // 후원사 API 함수들
    getSponsors,
    
    // 명예의전당 API 함수들
    getHonorHall,
    
    // 리뷰 API 함수들
    getReviews,
    createReview,
    updateReview,
    deleteReview,
    
    // 링크 API 함수들
    getLinks,
    createLink,
    updateLink,
    deleteLink,
    
    // Admin API 함수들
    getAdminSponsors,
    getAdminHonorHall,
    getAdminReviews,
    getAdminLinks,
    createSponsor,
    deleteSponsor,
    createHonorHall,
    deleteHonorHall,
    createAdminReview,
    updateAdminReview,
    deleteAdminReview,
    createAdminLink,
    updateAdminLink,
    deleteAdminLink,
    
    // 선택 관리
    handleReviewSelect,
    handleReviewDeselect,
    handleLinkSelect,
    handleLinkDeselect,
    
    // 초기화 함수들
    clearSponsors,
    clearHonorHall,
    clearReviews,
    clearLinks,
  };
};
