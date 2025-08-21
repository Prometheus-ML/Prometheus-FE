'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@prometheus-fe/stores';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import GlassCard from '../../src/components/GlassCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faFolder, 
  faFileAlt, 
  faBan, 
  faHandshake, 
  faCalendarAlt, 
  faUsersCog, 
  faArrowLeft 
} from '@fortawesome/free-solid-svg-icons';

const navbarItems = [
  {
    name: '멤버',
    href: '/admin/member',
    icon: faUsers,
    requiredGrant: 'Administrator'
  },
  {
    name: '프로젝트',
    href: '/admin/project',
    icon: faFolder,
    requiredGrant: 'Administrator'
  },
  {
    name: '게시글',
    href: '/admin/post',
    icon: faFileAlt,
    requiredGrant: 'Administrator'
  },
  {
    name: '블랙리스트',
    href: '/admin/blacklist',
    icon: faBan,
    requiredGrant: 'Administrator'
  },
  {
    name: '스폰서',
    href: '/admin/landing',
    icon: faHandshake,
    requiredGrant: 'Administrator'
  },
  {
    name: '이벤트',
    href: '/admin/event',
    icon: faCalendarAlt,
    requiredGrant: 'Administrator'
  },
  {
    name: '모임',
    href: '/admin/group',
    icon: faUsersCog,
    requiredGrant: 'Administrator'
  }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const canAccessAdministrator = useAuthStore((s) => s.canAccessAdministrator);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const pathname = usePathname();
  
  // Hydration 상태 관리
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (!isAuthenticated()) {
      alert('로그인이 필요합니다.');
      router.push('/auth/login');
      return;
    }

    if (!canAccessAdministrator()) {
      alert('관리자가 아닙니다.');
      router.push('/');
      return;
    }

    setIsAuthorized(true);
  }, [isMounted, isAuthenticated, canAccessAdministrator, router]);

  // Hydration이 완료되지 않았거나 권한이 없는 경우 로딩 표시
  if (!isMounted || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="admin-bg fixed inset-0 -z-10"></div>
        <div className="text-lg text-white relative z-10">
          {!isMounted ? '로딩 중...' : '권한 확인 중...'}
        </div>
      </div>
    );
  }

  const hasAccess = (requiredGrant: string) => {
    switch (requiredGrant) {
      case 'Manager':
        return canAccessAdministrator(); // Manager 역할 제거, Administrator로 대체
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
              <FontAwesomeIcon icon={faArrowLeft} className="text-lg" />
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
                    <FontAwesomeIcon icon={item.icon} className="text-lg" />
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
