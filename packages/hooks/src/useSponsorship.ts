import { useState, useCallback } from 'react';
import { useApi } from '@prometheus-fe/context';
import {
  Sponsor,
  HonorHall,
  HonorHallPublic,
  SponsorListParams,
  SponsorListResponse,
  SponsorCreateRequest,
  HonorHallCreateRequest
} from '@prometheus-fe/types';

export const useSponsorship = () => {
  const { sponsorship } = useApi();
  
  // 상태 관리
  const [adminSponsors, setAdminSponsors] = useState<Sponsor[]>([]);
  const [adminHonorHall, setAdminHonorHall] = useState<HonorHall[]>([]);
  const [publicSponsors, setPublicSponsors] = useState<Sponsor[]>([]);
  const [publicHonorHall, setPublicHonorHall] = useState<HonorHallPublic[]>([]);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [selectedHonorHall, setSelectedHonorHall] = useState<HonorHall | null>(null);
  
  // 로딩 상태
  const [isLoadingAdminSponsors, setIsLoadingAdminSponsors] = useState<boolean>(false);
  const [isLoadingAdminHonorHall, setIsLoadingAdminHonorHall] = useState<boolean>(false);
  const [isLoadingPublicSponsors, setIsLoadingPublicSponsors] = useState<boolean>(false);
  const [isLoadingPublicHonorHall, setIsLoadingPublicHonorHall] = useState<boolean>(false);
  
  // 페이지네이션 상태
  const [publicSponsorsTotal, setPublicSponsorsTotal] = useState<number>(0);

  // ===== 관리자용 API =====

  // 관리자용 후원사 목록 조회
  const getAdminSponsors = useCallback(async (): Promise<Sponsor[]> => {
    if (!sponsorship) {
      throw new Error('Sponsorship API not available');
    }
    try {
      setIsLoadingAdminSponsors(true);
      const data = await sponsorship.getAdminSponsors();
      setAdminSponsors(data.sponsors || []);
      return data.sponsors || [];
    } catch (error) {
      console.error('Failed to fetch admin sponsors:', error);
      throw error;
    } finally {
      setIsLoadingAdminSponsors(false);
    }
  }, [sponsorship]);

  // 관리자용 명예의전당 목록 조회
  const getAdminHonorHall = useCallback(async (): Promise<HonorHall[]> => {
    if (!sponsorship) {
      throw new Error('Sponsorship API not available');
    }
    try {
      setIsLoadingAdminHonorHall(true);
      const data = await sponsorship.getAdminHonorHall();
      setAdminHonorHall(data.honor_hall || []);
      return data.honor_hall || [];
    } catch (error) {
      console.error('Failed to fetch admin honor hall:', error);
      throw error;
    } finally {
      setIsLoadingAdminHonorHall(false);
    }
  }, [sponsorship]);

  // 후원사 생성
  const createSponsor = useCallback(async (data: SponsorCreateRequest): Promise<number> => {
    if (!sponsorship) {
      throw new Error('Sponsorship API not available');
    }
    try {
      const response = await sponsorship.createSponsor(data);
      return response.id;
    } catch (error) {
      console.error('Failed to create sponsor:', error);
      throw error;
    }
  }, [sponsorship]);

  // 후원사 삭제
  const deleteSponsor = useCallback(async (sponsorId: number): Promise<void> => {
    if (!sponsorship) {
      throw new Error('Sponsorship API not available');
    }
    try {
      await sponsorship.deleteSponsor(sponsorId);
    } catch (error) {
      console.error('Failed to delete sponsor:', error);
      throw error;
    }
  }, [sponsorship]);

  // 명예의전당 생성
  const createHonorHall = useCallback(async (data: HonorHallCreateRequest): Promise<number> => {
    if (!sponsorship) {
      throw new Error('Sponsorship API not available');
    }
    try {
      const response = await sponsorship.createHonorHall(data);
      return response.id;
    } catch (error) {
      console.error('Failed to create honor hall:', error);
      throw error;
    }
  }, [sponsorship]);

  // 명예의전당 삭제
  const deleteHonorHall = useCallback(async (honorId: number): Promise<void> => {
    if (!sponsorship) {
      throw new Error('Sponsorship API not available');
    }
    try {
      await sponsorship.deleteHonorHall(honorId);
    } catch (error) {
      console.error('Failed to delete honor hall:', error);
      throw error;
    }
  }, [sponsorship]);

  // ===== 일반 사용자용 API =====

  // 일반 사용자용 후원사 목록 조회
  const getPublicSponsors = useCallback(async (params?: SponsorListParams): Promise<SponsorListResponse> => {
    if (!sponsorship) {
      throw new Error('Sponsorship API not available');
    }
    try {
      setIsLoadingPublicSponsors(true);
      const data = await sponsorship.getPublicSponsors(params);
      setPublicSponsors(data.sponsors || []);
      setPublicSponsorsTotal(data.total || 0);
      return data;
    } catch (error) {
      console.error('Failed to fetch public sponsors:', error);
      throw error;
    } finally {
      setIsLoadingPublicSponsors(false);
    }
  }, [sponsorship]);

  // 일반 사용자용 명예의전당 목록 조회
  const getPublicHonorHall = useCallback(async (): Promise<HonorHallPublic[]> => {
    if (!sponsorship) {
      throw new Error('Sponsorship API not available');
    }
    try {
      setIsLoadingPublicHonorHall(true);
      const data = await sponsorship.getPublicHonorHall();
      setPublicHonorHall(data.honor_hall || []);
      return data.honor_hall || [];
    } catch (error) {
      console.error('Failed to fetch public honor hall:', error);
      throw error;
    } finally {
      setIsLoadingPublicHonorHall(false);
    }
  }, [sponsorship]);

  // 선택된 항목 관리
  const handleSponsorSelect = useCallback((sponsor: Sponsor): void => {
    setSelectedSponsor(sponsor);
  }, []);

  const handleSponsorDeselect = useCallback((): void => {
    setSelectedSponsor(null);
  }, []);

  const handleHonorHallSelect = useCallback((honorHall: HonorHall): void => {
    setSelectedHonorHall(honorHall);
  }, []);

  const handleHonorHallDeselect = useCallback((): void => {
    setSelectedHonorHall(null);
  }, []);

  // 상태 초기화
  const clearAdminSponsors = useCallback((): void => {
    setAdminSponsors([]);
  }, []);

  const clearAdminHonorHall = useCallback((): void => {
    setAdminHonorHall([]);
  }, []);

  const clearPublicSponsors = useCallback((): void => {
    setPublicSponsors([]);
    setPublicSponsorsTotal(0);
  }, []);

  const clearPublicHonorHall = useCallback((): void => {
    setPublicHonorHall([]);
  }, []);

  return {
    // 상태
    adminSponsors,
    adminHonorHall,
    publicSponsors,
    publicHonorHall,
    selectedSponsor,
    selectedHonorHall,
    
    // 로딩 상태
    isLoadingAdminSponsors,
    isLoadingAdminHonorHall,
    isLoadingPublicSponsors,
    isLoadingPublicHonorHall,
    
    // 페이지네이션
    publicSponsorsTotal,
    
    // 관리자용 API 함수들
    getAdminSponsors,
    getAdminHonorHall,
    createSponsor,
    deleteSponsor,
    createHonorHall,
    deleteHonorHall,
    
    // 일반 사용자용 API 함수들
    getPublicSponsors,
    getPublicHonorHall,
    
    // 선택 관리
    handleSponsorSelect,
    handleSponsorDeselect,
    handleHonorHallSelect,
    handleHonorHallDeselect,
    
    // 초기화 함수들
    clearAdminSponsors,
    clearAdminHonorHall,
    clearPublicSponsors,
    clearPublicHonorHall,
  };
};
