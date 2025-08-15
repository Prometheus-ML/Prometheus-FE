'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@prometheus-fe/stores';
import { useSponsorship } from '@prometheus-fe/hooks';
import { Sponsor, HonorHallPublic } from '@prometheus-fe/types';
import GlassCard from '../../src/components/GlassCard';
import Image from 'next/image';

export default function SponsorshipPage() {
  const { isAuthenticated } = useAuthStore();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'sponsors' | 'honor-hall'>('sponsors');
  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(20);
  
  const {
    publicSponsors,
    publicHonorHall,
    isLoadingPublicSponsors,
    isLoadingPublicHonorHall,
    publicSponsorsTotal,
    getPublicSponsors,
    getPublicHonorHall,
  } = useSponsorship();

  // Hydration 완료 감지
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 데이터 로드
  const loadData = useCallback(async (): Promise<void> => {
    try {
      setError('');
      if (activeTab === 'sponsors') {
        await getPublicSponsors({ page, size });
      } else {
        await getPublicHonorHall();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    }
  }, [activeTab, page, size, getPublicSponsors, getPublicHonorHall]);

  useEffect(() => {
    if (!isMounted) return;
    loadData();
  }, [isMounted, loadData]);

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    if (!isMounted) return;
    setPage(1); // 탭 변경 시 페이지 초기화
    loadData();
  }, [activeTab, loadData]);

  // 페이지 변경 시 데이터 로드
  useEffect(() => {
    if (!isMounted || activeTab !== 'sponsors') return;
    loadData();
  }, [page, loadData]);

  // Hydration이 완료되지 않은 경우
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  const pages = Math.max(1, Math.ceil((publicSponsorsTotal || 0) / size));

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <GlassCard href="/" className="w-10 h-10 flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </GlassCard>
            <div>
              <h1 className="text-xl font-semibold text-white">후원</h1>
              <p className="text-sm text-gray-300 mt-1">프로메테우스를 후원해주신 분들</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white">{publicSponsorsTotal}</div>
            <div className="text-xs text-gray-300">총 후원사</div>
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
              후원사
            </button>
            <button
              onClick={() => setActiveTab('honor-hall')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'honor-hall'
                  ? 'bg-red-500 text-white'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              명예의전당
            </button>
          </div>
        </GlassCard>

        {/* 에러 메시지 */}
        {error && (
          <GlassCard className="p-4 mb-6 bg-red-500/20 border-red-500/50">
            <div className="text-red-300 text-center">{error}</div>
          </GlassCard>
        )}

        {/* 후원사 탭 */}
        {activeTab === 'sponsors' && (
          <GlassCard className="overflow-hidden">
            {isLoadingPublicSponsors ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : (
              <div className="p-6">
                {publicSponsors.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">후원사가 없습니다</h3>
                    <p className="text-gray-300">아직 후원사가 등록되지 않았습니다.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {publicSponsors.map((sponsor) => (
                        <GlassCard key={sponsor.id} className="p-4">
                          <div className="flex items-center mb-3">
                            {sponsor.logo_url && (
                              <Image
                                width={48}
                                height={48}
                                src={sponsor.logo_url} 
                                alt={sponsor.name}
                                className="w-12 h-12 object-contain mr-3 rounded"
                              />
                            )}
                            <h3 className="font-semibold text-white">{sponsor.name}</h3>
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

                    {/* 페이지네이션 */}
                    {pages > 1 && (
                      <div className="flex justify-center space-x-2">
                        <GlassCard 
                          as="button" 
                          onClick={() => setPage(p => Math.max(1, p - 1))} 
                          disabled={page === 1}
                          className="px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                          이전
                        </GlassCard>
                        <span className="px-3 py-2 text-sm text-white">
                          {page} / {pages}
                        </span>
                        <GlassCard 
                          as="button" 
                          onClick={() => setPage(p => Math.min(pages, p + 1))} 
                          disabled={page === pages}
                          className="px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                          다음
                        </GlassCard>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </GlassCard>
        )}

        {/* 명예의전당 탭 */}
        {activeTab === 'honor-hall' && (
          <GlassCard className="overflow-hidden">
            {isLoadingPublicHonorHall ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : (
              <div className="p-6">
                {publicHonorHall.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">명예의전당이 없습니다</h3>
                    <p className="text-gray-300">아직 명예의전당에 등록된 멤버가 없습니다.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {publicHonorHall.map((honor, index) => (
                      <GlassCard key={index} className="p-4">
                        <div className="flex items-center mb-3">
                          <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mr-3">
                            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          </div>
                          <h3 className="font-semibold text-white">{honor.name}</h3>
                        </div>
                        <div className="text-sm text-gray-300">
                          <p><span className="font-medium">기여:</span> {honor.purpose}</p>
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
