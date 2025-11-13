"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@prometheus-fe/stores";

export default function LoginPage() {
  const [isLoadingApple, setIsLoadingApple] = useState(false);
  const { getGoogleAuthUrl, getAppleAuthUrl } = useAuthStore();

  const handleGoogleLogin = async () => {
    try {
      const response = await getGoogleAuthUrl();
      if (response?.auth_url) {
        window.location.href = response.auth_url;
      } else {
        alert("Google 로그인을 시작할 수 없습니다.");
      }
    } catch (error) {
      console.error("Google 로그인 URL 가져오기 실패:", error);
      alert("Google 로그인을 시작할 수 없습니다.");
    }
  };

  const handleAppleLogin = async () => {
    setIsLoadingApple(true);
    try {
      const response = await getAppleAuthUrl();
      if (response?.auth_url) {
        // Apple 로그인 페이지로 리디렉션
        window.location.href = response.auth_url;
      } else {
        alert("Apple 로그인을 시작할 수 없습니다.");
        setIsLoadingApple(false);
      }
    } catch (error) {
      console.error("Apple 로그인 URL 가져오기 실패:", error);
      alert("Apple 로그인을 시작할 수 없습니다.");
      setIsLoadingApple(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Login container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          {/* Logo/Title */}
          <div className="text-center mb-32">
            <div className="flex justify-center mb-6">
              <Image 
                src="/icons/logo.png" 
                width={120}
                height={120}
                alt="프로메테우스 로고" 
                className="w-32 h-32 object-contain"
              />
            </div>
            <p className="text-sm font-pretendard text-gray-300 mb-4">대학생 인공지능 단체</p>
            <h1 className="text-4xl font-kimm-bold text-white mb-8">Prometheus</h1>
          </div>
          <button
              onClick={handleGoogleLogin}
              className="w-2/3 mx-auto flex items-center justify-center gap-3 bg-white text-gray-800 hover:bg-gray-100 hover:shadow-lg hover:scale-105 font-semibold py-3 px-6 rounded-lg transition-all duration-300 mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-pretendard">Google 계정으로 계속하기</span>
          </button>

          {/*<button
            onClick={handleAppleLogin}
            disabled={isLoadingApple}
            className="w-2/3 mx-auto flex items-center justify-center gap-3 bg-black text-white hover:bg-gray-900 hover:shadow-lg hover:scale-105 font-semibold py-3 px-6 rounded-lg transition-all duration-300 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >*/}
            {/*isLoadingApple ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span className="font-pretendard">로딩 중...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span className="font-pretendard">Apple로 계속하기</span>
              </>
            )*/}
          {/*</button>*/}

           {/* Divider */}
           <div className="flex items-center mb-6">
             <div className="flex-1 border-t border-white/20"></div>
             <span className="px-4 text-gray-300 text-sm font-pretendard">또는</span>
             <div className="flex-1 border-t border-white/20"></div>
           </div>

           {/* Back to main */}
           <div className="text-center mb-8">
             <Link 
               href="/" 
               className="text-gray-300 hover:text-white hover:underline text-sm font-pretendard transition-all duration-200"
             >
               메인으로 이동
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
}


