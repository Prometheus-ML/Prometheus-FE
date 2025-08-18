"use client";
import { useEffect, useState } from 'react';
import { useAuthStore } from '@prometheus-fe/stores';
import { useMember } from '@prometheus-fe/hooks';
import Link from 'next/link';
import Image from 'next/image';
import type { MyProfileResponse } from '@prometheus-fe/types';
import GlassCard from '../src/components/GlassCard';
import RedButton from '../src/components/RedButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, 
  faUser, 
  faCheck, 
  faUsers, 
  faComments, 
  faUserFriends, 
  faCalendarAlt, 
  faProjectDiagram, 
  faCog, 
  faLightbulb 
} from '@fortawesome/free-solid-svg-icons';

export default function Page() {
  const isAuthenticated = useAuthStore((s: any) => s.isAuthenticated);
  const canAccessManager = useAuthStore((s: any) => s.canAccessManager);
  const [daysCount, setDaysCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { myProfile, getMyProfile, isLoadingProfile } = useMember();

  useEffect(() => {
    // Add a small delay to show skeleton UI
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) return;
    
    getMyProfile()
      .then((userData: MyProfileResponse) => {
        // 활동 시작일로부터 경과일 계산
        if (userData.activity_start_date) {
          const startDate = new Date(userData.activity_start_date);
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - startDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysCount(diffDays);
        }
      })
      .catch((error: Error) => {
        console.error('Failed to fetch user profile:', error);
      });
  }, [isAuthenticated, getMyProfile]);

  // Skeleton UI Component
  const SkeletonCard = () => (
    <div className="p-4 flex flex-col justify-center items-center animate-pulse">
      <div className="w-16 h-16 bg-gray-600 rounded-full mb-4"></div>
      <div className="w-24 h-6 bg-gray-600 rounded mb-2"></div>
      <div className="w-32 h-4 bg-gray-600 rounded"></div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="md:max-w-4xl max-w-lg mx-auto min-h-screen font-pretendard">
        {/* Header Skeleton */}
        <header className="px-4 py-6 border-b border-white/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-600 rounded-lg animate-pulse"></div>
              <div>
                <div className="w-24 h-6 bg-gray-600 rounded animate-pulse mb-1"></div>
                <div className="w-32 h-4 bg-gray-600 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-5 h-5 bg-gray-600 rounded animate-pulse"></div>
              <div className="w-5 h-5 bg-gray-600 rounded animate-pulse"></div>
            </div>
          </div>
        </header>

        {/* Main Content Skeleton */}
        <main className="px-4 pb-8 flex-1">
          <div className="mb-8 pt-6">
            <div className="w-64 h-8 bg-gray-600 rounded animate-pulse mb-2"></div>
            <div className="w-32 h-6 bg-gray-600 rounded animate-pulse"></div>
          </div>

          <div className="grid grid-cols-2 gap-4 h-2/3">
            <GlassCard className="animate-pulse">
              <SkeletonCard />
            </GlassCard>
            <GlassCard className="animate-pulse">
              <SkeletonCard />
            </GlassCard>
            <GlassCard className="animate-pulse">
              <SkeletonCard />
            </GlassCard>
            <GlassCard className="animate-pulse">
              <SkeletonCard />
            </GlassCard>
            <GlassCard className="animate-pulse">
              <SkeletonCard />
            </GlassCard>
            <GlassCard className="animate-pulse">
              <SkeletonCard />
            </GlassCard>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="md:max-w-4xl max-w-lg mx-auto min-h-screen font-pretendard">
      {/* Header */}
      <header className="mx-4 px-6 py-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative">
              <Image 
                src="/icons/logo.png" 
                alt="프로메테우스 로고" 
                width={40}
                height={40}
                className="bg-black rounded-lg object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-kimm-bold text-[#FFFFFF]">Prometheus</h1>
              <p className="text-sm font-pretendard text-[#e0e0e0]">대학생 인공지능 단체</p>
            </div>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-4">
            {canAccessManager() && (
              <RedButton href="/admin" className="text-sm px-3 py-1">
                Admin
              </RedButton>
            )}
            <Link href="/notifications" className="text-[#FFFFFF] hover:text-[#e0e0e0] transition-colors">
              <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
            </Link>
            <Link href="/my" className="text-[#FFFFFF] hover:text-[#e0e0e0] transition-colors">
              <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-8 flex-1">
        {isAuthenticated() && myProfile ? (
          <>
            {/* Personalized Greeting */}
            <div className="mb-8 pt-6">
              <h2 className="text-2xl font-pretendard text-[#FFFFFF] mb-2">
                <span className="text-[#FFFFFF]">{myProfile.name}</span> 님은{' '}
                <br/>
                <span className="font-bold text-[#FF4500]">PROMETHEUS</span>와{' '}
                <span className="text-[#FFFFFF]">{daysCount}</span>일째
              </h2>
              <div className="inline-block bg-[#8B0000]/20 border border-[#c2402a]/30 rounded-full px-3 py-1">
                <span className="text-[#ffa282] text-sm font-pretendard">{myProfile.gen || 0}기</span>
              </div>
            </div>

            {/* Routing Cards - Custom Grid Layout */}
            <div className="grid grid-cols-5 gap-4 h-2/3">
              {/* 출석하기 - 2/5 columns */}
              <GlassCard href="/attendance" className="p-4 flex flex-col justify-center items-center col-span-2 row-span-2">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-[#8B0000]/20 rounded-full flex items-center justify-center mb-4 border border-[#c2402a]/30">
                    <FontAwesomeIcon icon={faCheck} className="w-8 h-8 text-[#ffa282]" />
                  </div>
                  <h3 className="text-[#FFFFFF] font-semibold font-kimm-bold text-lg">출석하기</h3>
                  <p className="text-[#e0e0e0] text-sm mt-2">정기 출석 체크</p>
                </div>
              </GlassCard>

              {/* 모임/스터디 - 3/5 columns */}
              <GlassCard href="/group" className="p-4 flex flex-col justify-center items-center col-span-3">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-[#8B0000]/20 rounded-full flex items-center justify-center mb-4 border border-[#c2402a]/30">
                    <FontAwesomeIcon icon={faUsers} className="w-8 h-8 text-[#ffa282]" />
                  </div>
                  <h3 className="text-[#FFFFFF] font-semibold font-kimm-bold text-lg">모임/스터디</h3>
                  <p className="text-[#e0e0e0] text-sm mt-2">팀 활동 관리</p>
                </div>
              </GlassCard>

              {/* 커뮤니티 - 3/5 columns */}
              <GlassCard href="/community" className="p-4 flex flex-col justify-center items-center col-span-3">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-[#8B0000]/20 rounded-full flex items-center justify-center mb-4 border border-[#c2402a]/30">
                    <FontAwesomeIcon icon={faComments} className="w-8 h-8 text-[#ffa282]" />
                  </div>
                  <h3 className="text-[#FFFFFF] font-semibold font-kimm-bold text-lg">커뮤니티</h3>
                  <p className="text-[#e0e0e0] text-sm mt-2">소통과 공유</p>
                </div>
              </GlassCard>

              {/* 멤버 - 3/5 columns */}
              <GlassCard href="/member" className="p-4 flex flex-col justify-center items-center col-span-3">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-[#8B0000]/20 rounded-full flex items-center justify-center mb-4 border border-[#c2402a]/30">
                    <FontAwesomeIcon icon={faUserFriends} className="w-8 h-8 text-[#ffa282]" />
                  </div>
                  <h3 className="text-[#FFFFFF] font-semibold font-kimm-bold text-lg">멤버</h3>
                  <p className="text-[#e0e0e0] text-sm mt-2">멤버 정보</p>
                </div>
              </GlassCard>

              {/* 프로젝트 - 2/5 columns */}
              <GlassCard href="/project" className="p-4 flex flex-col justify-center items-center col-span-2">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-[#8B0000]/20 rounded-full flex items-center justify-center mb-4 border border-[#c2402a]/30">
                    <FontAwesomeIcon icon={faProjectDiagram} className="w-8 h-8 text-[#ffa282]" />
                  </div>
                  <h3 className="text-[#FFFFFF] font-semibold font-kimm-bold text-lg">프로젝트</h3>
                  <p className="text-[#e0e0e0] text-sm mt-2">프로젝트 관리</p>
                </div>
              </GlassCard>
            </div>
          </>
        ) : (
          <>
            {/* Non-member version */}
            <GlassCard className="my-8 p-8 text-center">
              <h2 className="text-2xl font-bold font-pretendard text-[#FFFFFF] mb-4">로그인하세요</h2>
              <p className="text-[#e0e0e0] font-pretendard mb-6">프로메테우스의 모든 기능을 이용해보세요</p>
              <RedButton href="/auth/login" className="text-base px-6 py-3">
                로그인하기
              </RedButton>
            </GlassCard>

            {/* Non-member Cards - Full Height Grid */}
            <div className="grid grid-cols-3 gap-4 h-2/3">
              {/* 프로메테우스의 철학 */}
              <GlassCard href="/landing" className="p-4 flex flex-col justify-center items-center">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-[#8B0000]/20 rounded-full flex items-center justify-center mb-4 border border-[#c2402a]/30">
                    <FontAwesomeIcon icon={faLightbulb} className="w-8 h-8 text-[#ffa282]" />
                  </div>
                  <h3 className="text-[#FFFFFF] font-semibold text-lg">프로메테우스</h3>
                  <p className="text-[#e0e0e0] text-sm mt-2">동아리 소개</p>
                </div>
              </GlassCard>

              {/* 멤버 */}
              <GlassCard href="/member" className="p-4 flex flex-col justify-center items-center">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-[#8B0000]/20 rounded-full flex items-center justify-center mb-4 border border-[#c2402a]/30">
                    <FontAwesomeIcon icon={faUserFriends} className="w-8 h-8 text-[#ffa282]" />
                  </div>
                  <h3 className="text-[#FFFFFF] font-semibold text-lg">멤버</h3>
                  <p className="text-[#e0e0e0] text-sm mt-2">멤버 소개</p>
                </div>
              </GlassCard>

              {/* 프로젝트 */}
              <GlassCard href="/project" className="p-4 flex flex-col justify-center items-center">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-[#8B0000]/20 rounded-full flex items-center justify-center mb-4 border border-[#c2402a]/30">
                    <FontAwesomeIcon icon={faProjectDiagram} className="w-8 h-8 text-[#ffa282]" />
                  </div>
                  <h3 className="text-[#FFFFFF] font-semibold text-lg">프로젝트</h3>
                  <p className="text-[#e0e0e0] text-sm mt-2">프로젝트 소개</p>
                </div>
              </GlassCard>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

