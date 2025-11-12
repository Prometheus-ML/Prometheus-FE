"use client";
import { useEffect, useState } from 'react';
import { useAuthStore } from '@prometheus-fe/stores';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function AppleCallbackPage() {
  const router = useRouter();
  const [localError, setLocalError] = useState<string | null>(null);
  const { appleCallback, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    const handleAppleCallback = async () => {
      // 기존 에러 클리어
      clearError();
      
      // Apple은 form_post 방식으로 데이터를 전송하므로
      // URL 파라미터가 아닌 POST body에서 데이터를 받아야 함
      // 하지만 Next.js는 기본적으로 GET 요청만 처리하므로,
      // 서버 액션 또는 API 라우트를 사용해야 함
      
      // 임시로 URL 파라미터에서 code를 받는 방식 사용
      // 실제로는 서버 사이드에서 처리하는 것이 좋음
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const errorParam = params.get('error');
      
      if (errorParam) {
        setLocalError('Apple 로그인이 취소되었거나 실패했습니다.');
        return;
      }
      
      if (!code) {
        // POST 요청인 경우를 대비하여 폼 데이터 확인
        // 실제 구현에서는 서버 사이드에서 처리해야 함
        setLocalError('인증 정보가 없습니다.');
        return;
      }
      
      try {
        console.log('Apple OAuth callback processing:', { code: code.substring(0, 10) + '...' });
        
        // Store의 appleCallback 메서드 사용
        // user 정보는 첫 로그인 시에만 제공되므로, 여기서는 code만 전달
        const success = await appleCallback(code);
        
        if (success) {
          // 성공 시 메인 페이지로 리디렉션
          router.push('/my');
        }
        // 실패 시 에러는 store의 error 상태에서 처리됨
      } catch (err: any) {
        console.error('Apple OAuth error:', err);
        
        // 서버에서 받은 detail 메시지가 있으면 그것을 사용
        if (err.response?.data?.detail) {
          setLocalError(err.response.data.detail);
        } else if (err.detail) {
          setLocalError(err.detail);
        } else if (err.message) {
          setLocalError(err.message);
        } else {
          setLocalError('Apple 로그인 처리 중 오류가 발생했습니다.');
        }
      }
    };

    handleAppleCallback();
  }, [appleCallback, clearError, router]);

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

          {/* Apple Button with Loading State */}
          <button
            disabled
            className="w-2/3 mx-auto flex items-center justify-center gap-3 bg-black text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 mb-6 cursor-not-allowed opacity-75"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span className="font-pretendard">로그인 중...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span className="font-pretendard">Apple로 계속하기</span>
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

