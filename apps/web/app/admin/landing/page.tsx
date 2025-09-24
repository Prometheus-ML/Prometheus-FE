'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@prometheus-fe/stores';
import { useLanding } from '@prometheus-fe/hooks';
import GlassCard from '@/src/components/GlassCard';
import SponsorsTab from '@/src/components/landing/SponsorsTab';
import HonorHallTab from '@/src/components/landing/HonorHallTab';
import InterviewsTab from '@/src/components/landing/InterviewsTab';
import LinksTab from '@/src/components/landing/LinksTab';


export default function AdminLandingPage() {
  const canAccessAdministrator = useAuthStore((s) => s.canAccessAdministrator);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  // Hydration 완료 상태 관리
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'sponsors' | 'honor-hall' | 'interviews' | 'links'>('sponsors');
  
  const {
    adminSponsors,
    adminHonorHall,
    adminInterviews,
    adminLinks,
    isLoadingAdminSponsors,
    isLoadingAdminHonorHall,
    isLoadingAdminInterviews,
    isLoadingAdminLinks,
    getAdminSponsors,
    getAdminHonorHall,
    getAdminInterviews,
    getAdminLinks,
  } = useLanding();

  // Hydration 완료 감지
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 권한 체크 (hydration 완료 후에만)
  useEffect(() => {
    if (!isMounted) return;

    if (!isAuthenticated()) {
      alert('로그인이 필요합니다.');
      window.location.href = '/auth/login';
      return;
    }

    if (!canAccessAdministrator()) {
      alert('관리자가 아닙니다.');
      window.location.href = '/';
      return;
    }
  }, [isMounted, isAuthenticated, canAccessAdministrator]);

  // 데이터 로드
  const loadData = useCallback(async (): Promise<void> => {
    try {
      setError('');
      if (activeTab === 'sponsors') {
        await getAdminSponsors();
      } else if (activeTab === 'honor-hall') {
        await getAdminHonorHall();
      } else if (activeTab === 'interviews') {
        await getAdminInterviews();
      } else if (activeTab === 'links') {
        await getAdminLinks();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    }
  }, [activeTab, getAdminSponsors, getAdminHonorHall, getAdminInterviews, getAdminLinks]);

  useEffect(() => {
    if (!isMounted || !isAuthenticated() || !canAccessAdministrator()) return;
    loadData();
  }, [isMounted, loadData, isAuthenticated, canAccessAdministrator]);

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    if (!isMounted || !isAuthenticated() || !canAccessAdministrator()) return;
    loadData();
  }, [activeTab, loadData, isAuthenticated, canAccessAdministrator]);


  return (
    <div className="py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Landing 관리</h1>
          <p className="text-sm text-gray-300 mt-1">프로메테우스 Landing 페이지 관리</p>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <GlassCard className="p-4 mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('sponsors')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'sponsors'
                ? 'bg-red-500 text-white'
                : 'text-white hover:bg-white/10'
            }`}
          >
            후원사 관리
          </button>
          <button
            onClick={() => setActiveTab('honor-hall')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'honor-hall'
                ? 'bg-red-500 text-white'
                : 'text-white hover:bg-white/10'
            }`}
          >
            명예의전당 관리
          </button>
          <button
            onClick={() => setActiveTab('interviews')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'interviews'
                ? 'bg-red-500 text-white'
                : 'text-white hover:bg-white/10'
            }`}
          >
            인터뷰 관리
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'links'
                ? 'bg-red-500 text-white'
                : 'text-white hover:bg-white/10'
            }`}
          >
            링크 관리
          </button>
        </div>
      </GlassCard>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-400">
          {error}
        </div>
      )}

      {/* 후원사 관리 탭 */}
      {activeTab === 'sponsors' && (
        <SponsorsTab
          isLoading={isLoadingAdminSponsors}
          sponsors={adminSponsors}
          onRefresh={loadData}
        />
      )}

      {/* 명예의전당 관리 탭 */}
      {activeTab === 'honor-hall' && (
        <HonorHallTab
          isLoading={isLoadingAdminHonorHall}
          honorHall={adminHonorHall}
          onRefresh={loadData}
        />
      )}

      {/* 인터뷰 관리 탭 */}
      {activeTab === 'interviews' && (
        <InterviewsTab
          isLoading={isLoadingAdminInterviews}
          interviews={adminInterviews}
          onRefresh={loadData}
        />
      )}

      {/* 링크 관리 탭 */}
      {activeTab === 'links' && (
        <LinksTab
          isLoading={isLoadingAdminLinks}
          links={adminLinks}
          onRefresh={loadData}
        />
      )}
    </div>
  );
}
