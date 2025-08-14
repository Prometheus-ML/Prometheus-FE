"use client";
import { useEffect, useState } from 'react';
import { useAuthStore } from '@prometheus-fe/stores';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [localError, setLocalError] = useState<string | null>(null);
  const { googleCallback, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      // 기존 에러 클리어
      clearError();
      
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const errorParam = params.get('error');
      
      if (errorParam) {
        setLocalError('Google 로그인이 취소되었거나 실패했습니다.');
        return;
      }
      
      if (!code) {
        setLocalError('인증 정보가 없습니다.');
        return;
      }
      
      try {
        console.log('Google OAuth callback processing:', { code: code.substring(0, 10) + '...' });
        
        // Store의 googleCallback 메서드 사용
        const success = await googleCallback(code);
        
        if (success) {
          // 성공 시 메인 페이지로 리디렉션
          window.location.replace('/');
        }
        // 실패 시 에러는 store의 error 상태에서 처리됨
      } catch (err: any) {
        console.error('Google OAuth error:', err);
        setLocalError(err.message || 'Google 로그인 처리 중 오류가 발생했습니다.');
      }
    };

    handleGoogleCallback();
  }, [googleCallback, clearError]);

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
            ) : (error || localError) ? (
              <div>
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-white font-pretendard mb-6 leading-relaxed">{error || localError}</p>
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


