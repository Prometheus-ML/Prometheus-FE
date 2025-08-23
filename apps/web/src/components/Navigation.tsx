'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@prometheus-fe/stores';

const Navigation = () => {
  const [background, setBackground] = useState(false);
  const [fold, setFold] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, getUserGrant, isAuthenticated } = useAuthStore();

  // 인증 상태 확인
  const isAuthChecked = isAuthenticated !== undefined;

  const navList = [
    {
      path: "/about",
      name: "ABOUT US",
    },
    {
      path: "/member",
      name: "MEMBER",
    },
    {
      path: "/project",
      name: "PROJECT",
    },
    {
      path: "/interview",
      name: "INTERVIEW"
    },
    {
      path: "/news",
      name: "NEWS"
    },
  ];

  const handleScroll = () => {
    if (window.scrollY > 5) {
      setBackground(true);
    } else {
      setBackground(false);
    }
  };

  const handleResize = () => {
    setFold(true);
  };

  const handleLogout = async () => {
    await logout();
    setFold(true);
    window.location.reload();
  };

  const handleAdminClick = () => {
    router.push('/admin');
    setFold(true);
  };

  const handleProfileClick = () => {
    router.push('/my');
    setFold(true);
  };

  const handleLoginClick = () => {
    router.push('/auth/login');
    setFold(true);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 로그인/회원가입 페이지에서는 네비게이션 바를 숨김
  if (pathname === '/auth/login' || pathname === '/auth/register') {
    return null;
  }

  return (
    <nav
      className={`font-kimm-bold px-2 sm:px-4 py-3 bg-black w-full fixed z-50 ease-out transition-all drop-shadow-xl text-white`}
    >
      <div className="container flex flex-wrap justify-between mx-auto">
        <Link href="/" className="flex items-center font-bold text-xl text-white">
          <span className="prometheus text-rose-700">P</span>
          <span className="prometheus text-white">ROMETHEUS</span>
        </Link>
        
        <button
          onClick={() => setFold(!fold)}
          type="button"
          className="inline-flex items-center p-2 ml-auto text-base rounded-lg md:hidden text-white"
        >
          <svg
            className="w-6 h-6"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
        
        <div className={`w-full md:block md:w-auto ${fold ? 'hidden' : ''}`}>
          <ul className="flex flex-col mb-2 md:mb-0 md:p-2 mt-2 md:flex-row md:space-x-6 md:mt-0 md:text-base font-medium md:border-0 md:ml-auto">
            {navList.map((nav) => (
              <li key={nav.path}>
                <Link
                  href={nav.path}
                  onClick={() => setFold(true)}
                  className={`font-kimm-bold block text-xl md:text-sm lg:text-xl py-2 pr-6 pl-4 hover:opacity-80 md:p-0 hover:-translate-y-0.5 hover:scale-105 duration-200 text-white ${
                    pathname === nav.path ? 'router-link-active' : ''
                  }`}
                >
                  {nav.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* 인증 상태 확인 전까지는 스켈레톤 UI 표시 */}
        {!isAuthChecked ? (
          <div className="flex items-center space-x-2">
            <div className="w-16 h-8 bg-gray-600 rounded"></div>
          </div>
        ) : user ? (
          <>
            {/* fold 상태에 따른 LOGOUT 버튼 */}
            {(pathname === '/admin' || pathname === '/my') && (
              <button
                onClick={handleLogout}
                className={`font-kimm-bold hover:opacity-80 relative hover:-translate-y-0.5 hover:scale-105 duration-200 ${
                  fold
                    ? 'hidden md:block py-2 pr-6 md:pr-4 pl-4 rounded-3xl bg-[#B91C1C] md:px-4 md:py-1'
                    : 'ml-2 py-1 px-2 bg-[#B91C1C] text-white rounded'
                }`}
              >
                LOGOUT
              </button>
            )}

            {/* fold 상태에 따른 ADMIN 버튼 */}
            {getUserGrant() === 'admin' && pathname !== '/admin' && pathname !== '/my' && (
              <button
                onClick={handleAdminClick}
                className={`font-kimm-bold hover:opacity-80 relative hover:-translate-y-0.5 hover:scale-105 duration-200 ${
                  fold
                    ? 'hidden md:block py-2 pr-6 md:pr-4 pl-4 rounded-3xl bg-[#ffffff] text-black md:px-4 md:py-1'
                    : 'ml-2 py-1 px-2 bg-[#ffffff] text-black rounded'
                }`}
              >
                ADMIN
              </button>
            )}

            {/* fold 상태에 따른 PROFILE 버튼 */}
            {getUserGrant() !== 'admin' && pathname !== '/admin' && pathname !== '/my' && (
              <button
                onClick={handleProfileClick}
                className={`font-kimm-bold hover:opacity-80 relative hover:-translate-y-0.5 hover:scale-105 duration-200 ${
                  fold
                    ? 'hidden md:block py-2 pr-6 md:pr-4 pl-4 rounded-3xl bg-[#ffffff] text-black md:px-4 md:py-1'
                    : 'ml-2 py-1 px-2 bg-[#B91C1C] text-white rounded'
                }`}
              >
                PROFILE
              </button>
            )}
          </>
        ) : (
          /* 로그인 버튼 (user가 없는 경우) */
          <div className={user ? 'hidden md:block' : 'block'}>
            <button
              onClick={handleLoginClick}
              className={`font-kimm-bold hover:opacity-80 relative hover:-translate-y-0.5 hover:scale-105 duration-200 ${
                fold
                  ? 'hidden md:block py-2 pr-6 md:pr-3 pl-3 rounded-3xl bg-[#B91C1C] md:px-4 md:py-1'
                  : 'ml-2 py-1 px-2 bg-[#B91C1C] text-white rounded'
              }`}
            >
              LOGIN
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
