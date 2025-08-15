"use client";
import { useEffect, useState } from 'react';
import { useAuthStore } from '@prometheus-fe/stores';
import { useApi } from '@prometheus-fe/context';
import Link from 'next/link';
import Image from 'next/image';
import type { MyProfileResponse } from '@prometheus-fe/types';

export default function Page() {
  const isAuthenticated = useAuthStore((s: any) => s.isAuthenticated);
  const [me, setMe] = useState<MyProfileResponse | null>(null);
  const [daysCount, setDaysCount] = useState(0);
  const { user: userApi } = useApi();

  useEffect(() => {
    if (!isAuthenticated()) return;
    
    userApi.me()
      .then((userData) => {
        setMe(userData);
        // 활동 시작일로부터 경과일 계산
        if (userData.activity_start_date) {
          const startDate = new Date(userData.activity_start_date);
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - startDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysCount(diffDays);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch user profile:', error);
        setMe(null);
      });
  }, [isAuthenticated, userApi]);

  return (
    <div className="min-h-screen">
      {/* Prometheus background */}
      <div className="prometheus-bg"></div>
      
      {/* Header */}
      <header className="max-w-md mx-auto relative z-10 px-4 py-6">
          <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative">
              <Image 
                src="/icons/logo.png" 
                alt="프로메테우스 로고" 
                width={40}
                height={40}
                className="object-contain"
              />
              </div>
              <div>
              <h1 className="text-xl font-kimm-bold text-white">Prometheus</h1>
              <p className="text-xs font-kimm-light text-gray-300">대학생 인공지능 단체</p>
            </div>
          </div>

          {/* Right: Icons */}
            <div className="flex items-center gap-4">
            <Link href="/notifications" className="text-white hover:text-gray-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M9 11h.01M9 8h.01M9 5h.01M9 2h.01" />
              </svg>
            </Link>
            <Link href="/profile" className="text-white hover:text-gray-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
              </div>
            </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto relative z-10 px-4 pb-8">
        {isAuthenticated() && me ? (
          <>
            {/* Personalized Greeting */}
            <div className="mb-8">
              <h2 className="text-2xl font-pretendard text-white mb-2">
                <span className="text-white">{me.name}</span> 님은{' '}
                <br/>
                <span className="font-bold">PROMETHEUS</span>와{' '}
                <span className="text-white">{daysCount}</span>일째
              </h2>
              <div className="inline-block bg-red-600/20 border border-red-500/30 rounded-full px-3 py-1">
                <span className="text-red-300 text-sm font-pretendard">{me.gen || 0}기</span>
            </div>
          </div>

            {/* Routing Cards - 2x3 Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {/* 출석하기 */}
              <Link href="/attendance" className="bg-[#1e1e1e] rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                  <h3 className="text-white font-semibold text-sm">출석하기</h3>
                </div>
              </Link>

              {/* 모임/스터디 */}
              <Link href="/group" className="bg-[#1e1e1e] rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </div>
                  <h3 className="text-white font-semibold text-sm">모임/스터디</h3>
              </div>
              </Link>

              {/* 커뮤니티 */}
              <Link href="/community" className="bg-[#1e1e1e] rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
            </div>
                  <h3 className="text-white font-semibold text-sm">커뮤니티</h3>
        </div>
              </Link>

              {/* 멤버 */}
              <Link href="/member" className="bg-[#1e1e1e] rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold text-sm">멤버</h3>
                  </div>
              </Link>

              {/* 프로젝트 */}
              <Link href="/project" className="bg-[#1e1e1e] rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold text-sm">프로젝트</h3>
                </div>
              </Link>

              {/* 관리자 (조건부) */}
              {(me.grant === 'Super' || me.grant === 'Administrator' || me.grant === 'Manager') && (
                <Link href="/admin" className="bg-[#1e1e1e] rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                </div>
                    <h3 className="text-white font-semibold text-sm">관리자</h3>
              </div>
                </Link>
              )}
          </div>
          </>
        ) : (
          <>
            {/* Non-member version */}
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-pretendard text-white mb-4">로그인하세요</h2>
              <p className="text-gray-300 font-pretendard mb-6">프로메테우스의 모든 기능을 이용해보세요</p>
              <Link 
                href="/auth/login" 
                className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                로그인하기
              </Link>
        </div>

            {/* Non-member Cards - 3 columns */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* 프로메테우스의 철학 */}
              <Link href="/philosophy" className="bg-[#1e1e1e] rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </div>
                  <h3 className="text-white font-semibold text-xs">프로메테우스의 철학</h3>
                </div>
              </Link>

              {/* 멤버 */}
              <Link href="/members" className="bg-[#1e1e1e] rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
              </div>
                  <h3 className="text-white font-semibold text-xs">멤버</h3>
          </div>
              </Link>

              {/* 프로젝트 */}
              <Link href="/projects" className="bg-[#1e1e1e] rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                    </svg>
            </div>
                  <h3 className="text-white font-semibold text-xs">프로젝트</h3>
          </div>
              </Link>
        </div>
          </>
        )}
      </main>
    </div>
  );
}

