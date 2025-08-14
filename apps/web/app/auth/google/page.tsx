"use client";
import { useEffect, useState } from 'react';
import { authApi } from '@prometheus-fe/api';
import { useAuthStore } from '@prometheus-fe/stores';
import Link from 'next/link';
import Image from 'next/image';

export default function GoogleCallbackPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const errorParam = params.get('error');
      
      if (errorParam) {
        setError('Google 로그인이 취소되었거나 실패했습니다.');
        setIsLoading(false);
        return;
      }
      
      if (!code) {
        setError('인증 정보가 없습니다.');
        setIsLoading(false);
        return;
      }
      
      try {
        const tokens = await authApi.googleCallback({ code });
        setTokens(tokens.access_token, tokens.refresh_token);
        const user = await authApi.verify();
        setUser(user);
        window.location.replace('/');
      } catch (e: any) {
        console.error(e);
        setIsLoading(false);
        
        // 403 Forbidden 에러 처리
        if (e?.response?.status === 403) {
          setError('프로메테우스 멤버로 등록되어 있지 않습니다. 활동 당시의 전화번호를 통해 인증해주세요.');
        } else {
          setError('로그인 처리 중 오류가 발생했습니다.');
        }
      }
    };
    run();
  }, [setTokens, setUser]);

  return (
    <div className="min-h-screen">
      {/* Prometheus background */}
      <div className="prometheus-bg"></div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Image
                src="/icons/logo.png"
                width={80}
                height={80}
                alt="프로메테우스 로고"
                className="w-20 h-20 object-contain"
              />
            </div>
            <h1 className="text-2xl font-kimm-bold text-white mb-2">Prometheus</h1>
            <p className="text-sm font-kimm-light text-gray-300">대학생 인공지능 단체</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center">
            {isLoading ? (
              <div>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white font-pretendard">로그인 처리 중...</p>
              </div>
            ) : error ? (
              <div>
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-white font-pretendard mb-6 leading-relaxed">{error}</p>
                <Link 
                  href="/auth/login" 
                  className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  로그인 페이지로 돌아가기
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}


