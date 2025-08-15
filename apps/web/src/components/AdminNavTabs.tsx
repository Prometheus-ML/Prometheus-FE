"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface AdminNavTabsProps {
  className?: string;
}

interface AdminTab {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const adminTabs: AdminTab[] = [
  {
    id: 'member',
    label: '멤버 관리',
    href: '/admin/member',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    )
  },
  {
    id: 'project',
    label: '프로젝트',
    href: '/admin/project',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  {
    id: 'blacklist',
    label: '블랙리스트',
    href: '/admin/blacklist',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
      </svg>
    )
  },
  {
    id: 'post',
    label: '게시글',
    href: '/admin/post',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  }
];

/**
 * AdminNavTabs 컴포넌트
 * 관리자 페이지들 간의 탭 네비게이션을 제공하는 컴포넌트
 */
export default function AdminNavTabs({ className = '' }: AdminNavTabsProps) {
  const pathname = usePathname();

  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4 ${className}`}>
      <div className="grid grid-cols-2 gap-3">
        {adminTabs.map((tab) => {
          const isActive = pathname === tab.href;
          
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex flex-col items-center p-4 rounded-lg border transition-all ${
                isActive
                  ? 'bg-red-500/20 border-red-500/30 text-red-300'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className={`p-2 rounded-lg mb-2 ${
                isActive ? 'bg-red-500/30' : 'bg-white/10'
              }`}>
                {tab.icon}
              </div>
              <span className="text-sm font-medium text-center">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
