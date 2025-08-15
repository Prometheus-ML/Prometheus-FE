'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@prometheus-fe/stores';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import GlassCard from '../../src/components/GlassCard';

const navbarItems = [
  {
    name: '멤버',
    href: '/admin/member',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    requiredGrant: 'Manager'
  },
  {
    name: '프로젝트',
    href: '/admin/project',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    requiredGrant: 'Manager'
  },
  {
    name: '게시글',
    href: '/admin/post',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    requiredGrant: 'Manager'
  },
  {
    name: '블랙리스트',
    href: '/admin/blacklist',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    requiredGrant: 'Administrator'
  },
  {
    name: '스폰서',
    href: '/admin/sponsorship',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
    requiredGrant: 'Manager'
  },
  {
    name: '이벤트',
    href: '/admin/event',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    requiredGrant: 'Manager'
  },
  {
    name: '모임',
    href: '/admin/group',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    requiredGrant: 'Manager'
  }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const canAccessManager = useAuthStore((s) => s.canAccessManager);
  const canAccessAdministrator = useAuthStore((s) => s.canAccessAdministrator);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated()) {
      alert('로그인이 필요합니다.');
      router.push('/auth/login');
      return;
    }

    if (!canAccessManager()) {
      alert('관리자가 아닙니다.');
      router.push('/');
      return;
    }
  }, [isAuthenticated, canAccessManager, router]);

  // 권한 체크가 완료되지 않았으면 로딩 표시
  if (!isAuthenticated() || !canAccessManager()) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="admin-bg fixed inset-0 -z-10"></div>
        <div className="text-lg text-white relative z-10">권한 확인 중...</div>
      </div>
    );
  }

  const hasAccess = (requiredGrant: string) => {
    switch (requiredGrant) {
      case 'Manager':
        return canAccessManager();
      case 'Administrator':
        return canAccessAdministrator();
      default:
        return false;
    }
  };

  const availableItems = navbarItems.filter(item => hasAccess(item.requiredGrant));

  return (
    <div className="min-h-screen relative font-pretendard text-white">
      {/* Admin Background */}
      <div className="admin-bg fixed inset-0 -z-10"></div>
      
             {/* Navbar */}
       <nav className="backdrop-blur-sm shadow-lg border-b border-red-200 relative z-10">
        <div className="px-4 py-3">
          <div className="flex text-center justify-center mb-4">
            <h1 className="text-lg font-semibold">프로메테우스 관리자 페이지</h1>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex gap-2">
                         {/* 홈으로 버튼 */}
             <GlassCard href="/" className="w-12 h-12 flex items-center justify-center text-white">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
               </svg>
             </GlassCard>
            
            {/* 메뉴 아이템들 */}
            {availableItems.map((item) => {
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
