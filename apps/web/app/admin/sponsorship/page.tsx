'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@prometheus-fe/stores';
import { useSponsorship } from '@prometheus-fe/hooks';
import { Sponsor, HonorHall } from '@prometheus-fe/types';
import GlassCard from '../../../src/components/GlassCard';

export default function AdminSponsorshipPage() {
  const canAccessManager = useAuthStore((s) => s.canAccessManager);
  const canAccessAdministrator = useAuthStore((s) => s.canAccessAdministrator);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  // Hydration 완료 상태 관리
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'sponsors' | 'honor-hall'>('sponsors');
  
  const {
    adminSponsors,
    adminHonorHall,
    isLoadingAdminSponsors,
    isLoadingAdminHonorHall,
    getAdminSponsors,
    getAdminHonorHall,
    createSponsor,
    deleteSponsor,
    createHonorHall,
    deleteHonorHall,
    handleSponsorSelect,
    handleSponsorDeselect,
    handleHonorHallSelect,
    handleHonorHallDeselect,
  } = useSponsorship();

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

    if (!canAccessManager()) {
      alert('관리자가 아닙니다.');
      window.location.href = '/';
      return;
    }
  }, [isMounted, isAuthenticated, canAccessManager]);

  // 데이터 로드
  const loadData = useCallback(async (): Promise<void> => {
    try {
      setError('');
      if (activeTab === 'sponsors') {
        await getAdminSponsors();
      } else {
        await getAdminHonorHall();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    }
  }, [activeTab, getAdminSponsors, getAdminHonorHall]);

  useEffect(() => {
    if (!isMounted || !isAuthenticated() || !canAccessManager()) return;
    loadData();
  }, [isMounted, loadData, isAuthenticated, canAccessManager]);

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    if (!isMounted || !isAuthenticated() || !canAccessManager()) return;
    loadData();
  }, [activeTab, loadData, isAuthenticated, canAccessManager]);

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">후원 관리</h1>
            <p className="text-sm text-gray-300 mt-1">프로메테우스 후원사 및 명예의전당 관리</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
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
          </div>
        </GlassCard>

        {/* 에러 메시지 */}
        {error && (
          <GlassCard className="p-4 mb-6 bg-red-500/20 border-red-500/50">
            <div className="text-red-300 text-center">{error}</div>
          </GlassCard>
        )}

        {/* 후원사 관리 탭 */}
        {activeTab === 'sponsors' && (
          <GlassCard className="overflow-hidden">
            {isLoadingAdminSponsors ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">후원사 목록</h2>
                  <GlassCard as="button" className="px-4 py-2 text-sm font-medium text-white">
                    후원사 추가
                  </GlassCard>
                </div>
                
                {adminSponsors.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">후원사가 없습니다</h3>
                    <p className="text-gray-300">첫 번째 후원사를 추가해보세요.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {adminSponsors.map((sponsor) => (
                      <GlassCard key={sponsor.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-white">{sponsor.name}</h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSponsorSelect(sponsor)}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => deleteSponsor(sponsor.id)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-300">
                          <p><span className="font-medium">목적:</span> {sponsor.purpose}</p>
                          <p><span className="font-medium">금액:</span> {sponsor.amount.toLocaleString()}원</p>
                          <p><span className="font-medium">후원일:</span> {new Date(sponsor.sponsored_at).toLocaleDateString()}</p>
                          {sponsor.note && <p><span className="font-medium">비고:</span> {sponsor.note}</p>}
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        )}

        {/* 명예의전당 관리 탭 */}
        {activeTab === 'honor-hall' && (
          <GlassCard className="overflow-hidden">
            {isLoadingAdminHonorHall ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">명예의전당 목록</h2>
                  <GlassCard as="button" className="px-4 py-2 text-sm font-medium text-white">
                    명예의전당 추가
                  </GlassCard>
                </div>
                
                {adminHonorHall.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">명예의전당이 없습니다</h3>
                    <p className="text-gray-300">첫 번째 명예의전당을 추가해보세요.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {adminHonorHall.map((honor) => (
                      <GlassCard key={honor.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-white">멤버 ID: {honor.member_id}</h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleHonorHallSelect(honor)}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => deleteHonorHall(honor.id)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-300">
                          <p><span className="font-medium">기여 유형:</span> {honor.contribution_type}</p>
                          <p><span className="font-medium">금액:</span> {honor.amount.toLocaleString()}원</p>
                          <p><span className="font-medium">설명:</span> {honor.description}</p>
                          <p><span className="font-medium">공개 여부:</span> {honor.is_public ? '공개' : '비공개'}</p>
                          <p><span className="font-medium">생성일:</span> {new Date(honor.created_at).toLocaleDateString()}</p>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        )}
      </div>
    </div>
  );
}
