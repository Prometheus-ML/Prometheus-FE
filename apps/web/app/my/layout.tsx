'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@prometheus-fe/stores';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const navbarItems = [
  {
    name: '기본정보',
    href: '/my',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
  {
    name: '커피챗',
    href: '/my/coffee_chat',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    name: '프로젝트',
    href: '/my/project',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  {
    name: '게시글',
    href: '/my/post',
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">권한 확인 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="md:max-w-4xl max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-gray-900">내 정보</h1>
            <Link 
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              홈으로
            </Link>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2">
            {navbarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  } w-12 h-12 flex flex-col items-center justify-center border-2 rounded-lg cursor-pointer transition-colors`}
                >
                  <div className={`${
                    isActive ? 'text-white' : 'text-gray-500'
                  } mb-1`}>
                    {item.icon}
                  </div>
                  <span className="text-xs font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:max-w-4xl max-w-lg mx-auto bg-white min-h-screen shadow-lg">
        {children}
      </main>
    </div>
  );
}
