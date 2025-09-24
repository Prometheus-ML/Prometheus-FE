'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@prometheus-fe/stores';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import GlassCard from '@/src/components/GlassCard';
import TabBar from '@/src/components/TabBar';

const navbarItems = [
  {
    name: '기본정보',
    href: '/profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
  {
    name: '커피챗',
    href: '/profile/coffee_chat',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    name: '프로젝트',
    href: '/profile/project',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  {
    name: '게시글',
    href: '/profile/post',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  }
];

export default function MyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated()) {
      alert('로그인이 필요합니다.');
      router.push('/auth/login');
      return;
    }
  }, [isAuthenticated, router]);

  // 권한 체크가 완료되지 않았으면 로딩 표시
  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="prometheus-bg fixed inset-0 -z-10"></div>
        <div className="text-lg text-white relative z-10">권한 확인 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative font-pretendard text-white">
      {/* Prometheus Background */}
      <div className="prometheus-bg fixed inset-0 -z-10"></div>
      
      {/* Navbar */}
      <nav className="backdrop-blur-sm shadow-lg border-b border-red-200 relative z-10">
        <div className="px-4 py-3">
          <div className="flex text-center justify-center mb-4">
            <h1 className="text-lg font-semibold">내 정보</h1>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex gap-2">
            {/* 홈으로 버튼 */}
            <GlassCard href="/my" className="w-12 h-12 flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </GlassCard>
            
            {/* 메뉴 아이템들 */}
            {navbarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <GlassCard
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? 'bg-gradient-to-r from-red-800 to-red-600 text-white border-red-700 shadow-lg'
                      : 'text-white'
                  } flex-1 h-12 flex flex-col items-center justify-center`}
                >
                  <div className={`${
                    isActive ? 'text-white' : 'text-white'
                  } mb-1`}>
                    {item.icon}
                  </div>
                  <span className="text-xs font-medium">{item.name}</span>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="backdrop-blur-sm min-h-screen shadow-lg p-4 relative z-10">
        {children}
      </main>
    </div>
  );
}
