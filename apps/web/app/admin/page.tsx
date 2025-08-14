"use client";
import { useEffect, useState } from 'react';
import { useAuthStore } from '@prometheus-fe/stores';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const sidebarItems = [
  {
    name: '멤버 관리',
    href: '/admin/member',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    requiredGrant: 'Manager'
  },
  {
    name: '프로젝트 관리',
    href: '/admin/project',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    requiredGrant: 'Manager'
  },
  {
    name: '게시글 관리',
    href: '/admin/posts',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    requiredGrant: 'Manager'
  },
  {
    name: '블랙리스트 관리',
    href: '/admin/blacklist',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    requiredGrant: 'Administrator'
  }
];

export default function AdminPage() {
  const canAccessManager = useAuthStore((s) => s.canAccessManager);
  const canAccessAdministrator = useAuthStore((s) => s.canAccessAdministrator);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">권한 확인 중...</div>
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

  const availableItems = sidebarItems.filter(item => hasAccess(item.requiredGrant));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 사이드바 - 모바일 오버레이 */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SidebarContent items={availableItems} pathname={pathname} />
          </div>
        </div>
      )}

      {/* 사이드바 - 데스크톱 */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <SidebarContent items={availableItems} pathname={pathname} />
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* 모바일 헤더 */}
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">관리자 대시보드</h1>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="py-4">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {availableItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="text-blue-600">
                              {item.icon}
                            </div>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                바로가기
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                {item.name}
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ items, pathname }: { items: typeof sidebarItems, pathname: string }) {
  return (
    <>
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-white border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">관리자 패널</h2>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 bg-white space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium border-l-4 rounded-r-md`}
              >
                <div className={`${
                  isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                } mr-3 flex-shrink-0`}>
                  {item.icon}
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
