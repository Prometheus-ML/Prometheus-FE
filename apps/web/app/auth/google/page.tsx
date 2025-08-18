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

          {/* Google Button with Loading State */}
          <button
            disabled
            className="w-2/3 mx-auto flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all duration-300 mb-6 cursor-not-allowed opacity-75"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                <span className="font-pretendard">로그인중...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-pretendard">Google 계정으로 계속하기</span>
              </>
            )}
          </button>

          {/* Error Display */}
          {(error || localError) && (
            <div className="w-2/3 mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-300 font-pretendard text-sm leading-relaxed">{error || localError}</p>
            </div>
          )}

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


