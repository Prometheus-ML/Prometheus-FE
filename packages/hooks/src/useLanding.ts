import { useState, useCallback } from 'react';
import { useApi } from '@prometheus-fe/context';
import {
  LandingSponsor,
  LandingHonorHall,
  LandingInterview,
  LandingLink,
  LandingHistory,
  LandingSponsorListParams,
  LandingSponsorListResponse,
  LandingInterviewListParams,
  LandingLinkListParams,
  LandingHistoryListParams,
  LandingSponsorCreateRequest,
  LandingHonorHallCreateRequest,
  LandingInterviewCreateRequest,
  LandingLinkCreateRequest,
  LandingHistoryCreateRequest,
  LandingInterviewUpdateRequest,
  LandingLinkUpdateRequest,
  LandingHistoryUpdateRequest
} from '@prometheus-fe/types';

export const useLanding = () => {
  const { landing } = useApi();
  
  // 상태 관리
  const [sponsors, setSponsors] = useState<LandingSponsor[]>([]);
  const [honorHall, setHonorHall] = useState<LandingHonorHall[]>([]);
  const [interviews, setInterviews] = useState<LandingInterview[]>([]);
  const [links, setLinks] = useState<LandingLink[]>([]);
  const [histories, setHistories] = useState<LandingHistory[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<LandingInterview | null>(null);
  const [selectedLink, setSelectedLink] = useState<LandingLink | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<LandingHistory | null>(null);
  
  // Admin 상태 관리
  const [adminSponsors, setAdminSponsors] = useState<LandingSponsor[]>([]);
  const [adminHonorHall, setAdminHonorHall] = useState<LandingHonorHall[]>([]);
  const [adminInterviews, setAdminInterviews] = useState<LandingInterview[]>([]);
  const [adminLinks, setAdminLinks] = useState<LandingLink[]>([]);
  const [adminHistories, setAdminHistories] = useState<LandingHistory[]>([]);
  
  // 로딩 상태
  const [isLoadingSponsors, setIsLoadingSponsors] = useState<boolean>(false);
  const [isLoadingHonorHall, setIsLoadingHonorHall] = useState<boolean>(false);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState<boolean>(false);
  const [isLoadingLinks, setIsLoadingLinks] = useState<boolean>(false);
  const [isLoadingHistories, setIsLoadingHistories] = useState<boolean>(false);
  
  // Admin 로딩 상태
  const [isLoadingAdminSponsors, setIsLoadingAdminSponsors] = useState<boolean>(false);
  const [isLoadingAdminHonorHall, setIsLoadingAdminHonorHall] = useState<boolean>(false);
  const [isLoadingAdminInterviews, setIsLoadingAdminInterviews] = useState<boolean>(false);
  const [isLoadingAdminLinks, setIsLoadingAdminLinks] = useState<boolean>(false);
  const [isLoadingAdminHistories, setIsLoadingAdminHistories] = useState<boolean>(false);
  
  // 페이지네이션 상태
  const [sponsorsTotal, setSponsorsTotal] = useState<number>(0);
  const [interviewsTotal, setInterviewsTotal] = useState<number>(0);
  const [linksTotal, setLinksTotal] = useState<number>(0);
  const [historiesTotal, setHistoriesTotal] = useState<number>(0);

  // ===== 히스토리 API =====

  // 히스토리 목록 조회 (JWT 토큰 필요)
  const getHistories = useCallback(async (params?: LandingHistoryListParams): Promise<LandingHistory[]> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      setIsLoadingHistories(true);
      const data = await landing.getHistories(params);
      setHistories(data || []);
      setHistoriesTotal(data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch histories:', error);
      throw error;
    } finally {
      setIsLoadingHistories(false);
    }
  }, [landing]);

  // 히스토리 생성 (JWT 토큰 필요)
  const createHistory = useCallback(async (data: LandingHistoryCreateRequest): Promise<number> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      const response = await landing.createHistory(data);
      return response.id;
    } catch (error) {
      console.error('Failed to create history:', error);
      throw error;
    }
  }, [landing]);

  // 히스토리 수정 (JWT 토큰 필요)
  const updateHistory = useCallback(async (historyId: number, data: LandingHistoryUpdateRequest): Promise<number> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      const response = await landing.updateHistory(historyId, data);
      return response.id;
    } catch (error) {
      console.error(`Failed to update history ${historyId}:`, error);
      throw error;
    }
  }, [landing]);

  // 히스토리 삭제 (JWT 토큰 필요)
  const deleteHistory = useCallback(async (historyId: number): Promise<void> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      await landing.deleteHistory(historyId);
    } catch (error) {
      console.error(`Failed to delete history ${historyId}:`, error);
      throw error;
    }
  }, [landing]);

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

  // ===== 인터뷰 API =====

  // 인터뷰 목록 조회 (공개)
  const getInterviews = useCallback(async (params?: LandingInterviewListParams): Promise<LandingInterview[]> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      setIsLoadingInterviews(true);
      const data = await landing.getInterviews(params);
      setInterviews(data || []);
      setInterviewsTotal(data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
      throw error;
    } finally {
      setIsLoadingInterviews(false);
    }
  }, [landing]);

  // 인터뷰 생성 (인증 필요)
  const createInterview = useCallback(async (data: LandingInterviewCreateRequest): Promise<number> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      const response = await landing.createInterview(data);
      return response.id;
    } catch (error) {
      console.error('Failed to create interview:', error);
      throw error;
    }
  }, [landing]);

  // 인터뷰 수정 (인증 필요)
  const updateInterview = useCallback(async (interviewId: number, data: LandingInterviewUpdateRequest): Promise<number> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      const response = await landing.updateInterview(interviewId, data);
      return response.id;
    } catch (error) {
      console.error(`Failed to update interview ${interviewId}:`, error);
      throw error;
    }
  }, [landing]);

  // 인터뷰 삭제 (인증 필요)
  const deleteInterview = useCallback(async (interviewId: number): Promise<void> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      await landing.deleteInterview(interviewId);
    } catch (error) {
      console.error(`Failed to delete interview ${interviewId}:`, error);
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

  // Admin 히스토리 목록 조회 (Super 이상)
  const getAdminHistories = useCallback(async (): Promise<LandingHistory[]> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      setIsLoadingAdminHistories(true);
      const data = await landing.getAdminHistories();
      setAdminHistories(data || []);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch admin histories:', error);
      throw error;
    } finally {
      setIsLoadingAdminHistories(false);
    }
  }, [landing]);

  // Admin 히스토리 생성 (Super 이상)
  const createAdminHistory = useCallback(async (data: LandingHistoryCreateRequest): Promise<number> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      const response = await landing.createAdminHistory(data);
      return response.id;
    } catch (error) {
      console.error('Failed to create admin history:', error);
      throw error;
    }
  }, [landing]);

  // Admin 히스토리 수정 (Super 이상)
  const updateAdminHistory = useCallback(async (historyId: number, data: LandingHistoryUpdateRequest): Promise<number> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      const response = await landing.updateAdminHistory(historyId, data);
      return response.id;
    } catch (error) {
      console.error(`Failed to update admin history ${historyId}:`, error);
      throw error;
    }
  }, [landing]);

  // Admin 히스토리 삭제 (Super 이상)
  const deleteAdminHistory = useCallback(async (historyId: number): Promise<void> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      await landing.deleteAdminHistory(historyId);
    } catch (error) {
      console.error(`Failed to delete admin history ${historyId}:`, error);
      throw error;
    }
  }, [landing]);

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

  // Admin 인터뷰 목록 조회 (Super 이상)
  const getAdminInterviews = useCallback(async (): Promise<LandingInterview[]> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      setIsLoadingAdminInterviews(true);
      const data = await landing.getAdminInterviews();
      setAdminInterviews(data || []);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch admin interviews:', error);
      throw error;
    } finally {
      setIsLoadingAdminInterviews(false);
    }
  }, [landing]);

  // Admin 인터뷰 생성 (Super 이상)
  const createAdminInterview = useCallback(async (data: LandingInterviewCreateRequest): Promise<number> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      const response = await landing.createAdminInterview(data);
      return response.id;
    } catch (error) {
      console.error('Failed to create admin interview:', error);
      throw error;
    }
  }, [landing]);

  // Admin 인터뷰 수정 (Super 이상)
  const updateAdminInterview = useCallback(async (interviewId: number, data: LandingInterviewUpdateRequest): Promise<number> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      const response = await landing.updateAdminInterview(interviewId, data);
      return response.id;
    } catch (error) {
      console.error(`Failed to update admin interview ${interviewId}:`, error);
      throw error;
    }
  }, [landing]);

  // Admin 인터뷰 삭제 (Super 이상)
  const deleteAdminInterview = useCallback(async (interviewId: number): Promise<void> => {
    if (!landing) {
      throw new Error('Landing API not available');
    }
    try {
      await landing.deleteAdminInterview(interviewId);
    } catch (error) {
      console.error(`Failed to delete admin interview ${interviewId}:`, error);
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
  const handleInterviewSelect = useCallback((interview: LandingInterview): void => {
    setSelectedInterview(interview);
  }, []);

  const handleInterviewDeselect = useCallback((): void => {
    setSelectedInterview(null);
  }, []);

  const handleLinkSelect = useCallback((link: LandingLink): void => {
    setSelectedLink(link);
  }, []);

  const handleLinkDeselect = useCallback((): void => {
    setSelectedLink(null);
  }, []);

  const handleHistorySelect = useCallback((history: LandingHistory): void => {
    setSelectedHistory(history);
  }, []);

  const handleHistoryDeselect = useCallback((): void => {
    setSelectedHistory(null);
  }, []);

  // 상태 초기화
  const clearSponsors = useCallback((): void => {
    setSponsors([]);
    setSponsorsTotal(0);
  }, []);

  const clearHonorHall = useCallback((): void => {
    setHonorHall([]);
  }, []);

  const clearInterviews = useCallback((): void => {
    setInterviews([]);
    setInterviewsTotal(0);
  }, []);

  const clearLinks = useCallback((): void => {
    setLinks([]);
    setLinksTotal(0);
  }, []);

  const clearHistories = useCallback((): void => {
    setHistories([]);
    setHistoriesTotal(0);
  }, []);

  return {
    // 상태
    sponsors,
    honorHall,
    interviews,
    links,
    histories,
    selectedInterview,
    selectedLink,
    selectedHistory,
    
    // Admin 상태
    adminSponsors,
    adminHonorHall,
    adminInterviews,
    adminLinks,
    adminHistories,
    
    // 로딩 상태
    isLoadingSponsors,
    isLoadingHonorHall,
    isLoadingInterviews,
    isLoadingLinks,
    isLoadingHistories,
    
    // Admin 로딩 상태
    isLoadingAdminSponsors,
    isLoadingAdminHonorHall,
    isLoadingAdminInterviews,
    isLoadingAdminLinks,
    isLoadingAdminHistories,
    
    // 페이지네이션
    sponsorsTotal,
    interviewsTotal,
    linksTotal,
    historiesTotal,
    
    // 히스토리 API 함수들
    getHistories,
    createHistory,
    updateHistory,
    deleteHistory,
    
    // 후원사 API 함수들
    getSponsors,
    
    // 명예의전당 API 함수들
    getHonorHall,
    
    // 인터뷰 API 함수들
    getInterviews,
    createInterview,
    updateInterview,
    deleteInterview,
    
    // 링크 API 함수들
    getLinks,
    createLink,
    updateLink,
    deleteLink,
    
    // Admin API 함수들
    getAdminHistories,
    createAdminHistory,
    updateAdminHistory,
    deleteAdminHistory,
    getAdminSponsors,
    getAdminHonorHall,
    getAdminInterviews,
    getAdminLinks,
    createSponsor,
    deleteSponsor,
    createHonorHall,
    deleteHonorHall,
    createAdminInterview,
    updateAdminInterview,
    deleteAdminInterview,
    createAdminLink,
    updateAdminLink,
    deleteAdminLink,
    
    // 선택 관리
    handleInterviewSelect,
    handleInterviewDeselect,
    handleLinkSelect,
    handleLinkDeselect,
    handleHistorySelect,
    handleHistoryDeselect,
    
    // 초기화 함수들
    clearSponsors,
    clearHonorHall,
    clearInterviews,
    clearLinks,
    clearHistories,
  };
};
