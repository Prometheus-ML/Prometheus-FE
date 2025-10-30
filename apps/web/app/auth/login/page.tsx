"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import PhoneVerificationModal from "@/src/components/auth/PhoneVerificationModal";

export default function LoginPage() {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [isChangingAccount, setIsChangingAccount] = useState(false);
  const [newGoogleEmail, setNewGoogleEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // URL에서 에러 파라미터 확인
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    
    if (error === 'account_not_found') {
      setLoginError('등록되지 않은 Google 계정입니다.');
    } else if (error === 'account_disabled') {
      setLoginError('비활성화된 계정입니다. 관리자에게 문의하세요.');
    } else if (error) {
      setLoginError('로그인 중 오류가 발생했습니다.');
    }
  }, []);

  const handleGoogleLogin = () => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const frontUri = process.env.NEXT_PUBLIC_FRONT_URI;
    const redirectUri = `${frontUri}/auth/google`;
    
    if (!googleClientId) {
      alert("Google Client ID가 설정되지 않았습니다.");
      return;
    }

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=email%20profile`;
    window.location.href = googleAuthUrl;
  };

  const handlePhoneVerified = (token: string, userId: string) => {
    setTempToken(token);
    setLoginError(null);
    setIsChangingAccount(true);
  };

  const handleStartPhoneVerification = () => {
    setShowPhoneModal(true);
    setLoginError(null);
  };

  const handleSubmitAccountChange = async () => {
    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newGoogleEmail)) {
      alert('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    // Gmail 체크 (선택사항)
    if (!newGoogleEmail.endsWith('@gmail.com')) {
      const confirm = window.confirm('Gmail 계정이 아닙니다. 계속하시겠습니까?');
      if (!confirm) return;
    }

    setIsSubmitting(true);

    try {
      // TODO: 실제 API 호출
      // const response = await authApi.requestAccountChange({
      //   temp_token: tempToken!,
      //   new_google_email: newGoogleEmail
      // });

      // Mock 처리 (개발용)
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockResponse = {
        message: '계정 변경 요청이 제출되었습니다',
        request_id: 'REQ-' + Date.now(),
        status: 'pending' as const
      };

      setRequestSubmitted(true);
      setLoginError(null);
    } catch (error: any) {
      alert(error.response?.data?.message || '요청 제출에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetFlow = () => {
    setIsChangingAccount(false);
    setTempToken(null);
    setNewGoogleEmail('');
    setLoginError(null);
    setRequestSubmitted(false);
  };

  return (
    <div className="min-h-screen">
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

          {/* 요청 제출 완료 */}
          {requestSubmitted ? (
            <div className="space-y-6">
              <div className="p-6 bg-green-900/30 border border-green-500/50 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <h2 className="text-xl font-kimm-bold text-white">요청이 제출되었습니다</h2>
                </div>
                <p className="text-green-200 text-sm font-pretendard mb-2">
                  계정 변경 요청이 정상적으로 제출되었습니다.
                </p>
                <p className="text-gray-300 text-sm font-pretendard">
                  승인 완료 시 <span className="font-semibold text-white">{newGoogleEmail}</span>로 안내 메일이 발송됩니다.
                </p>
              </div>

              <div className="text-center space-y-4">
                <Link 
                  href="/" 
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-pretendard py-3 rounded-lg transition-colors"
                >
                  메인으로 이동
                </Link>
                <button
                  onClick={handleResetFlow}
                  className="text-gray-400 hover:text-white font-pretendard text-sm transition-colors"
                >
                  다른 계정으로 요청하기
                </button>
              </div>
            </div>
          ) : isChangingAccount ? (
            /* 계정 변경 폼 */
            <div className="space-y-6">
              {/* 인증 완료 안내 */}
              <div className="p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-blue-200 text-sm font-pretendard font-semibold">
                    전화번호 인증이 완료되었습니다
                  </p>
                </div>
                <p className="text-gray-300 text-sm font-pretendard leading-relaxed">
                  이제 연결하고 싶은 Google 계정을 입력해주세요. 승인 후 메일로 안내 메일 발송 예정입니다.
                </p>
                <p className="text-gray-400 text-xs font-pretendard mt-2">
                  * 승인까지는 다소 시간이 소요될 수 있습니다.
                </p>
              </div>

              {/* 이메일 입력 */}
              <div>
                <label className="block text-sm font-pretendard text-gray-300 mb-2">
                  Google 계정 (Gmail)
                </label>
                <input
                  type="email"
                  value={newGoogleEmail}
                  onChange={(e) => setNewGoogleEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 font-pretendard focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
              </div>

              {/* 제출 버튼 */}
              <button
                onClick={handleSubmitAccountChange}
                disabled={isSubmitting || !newGoogleEmail}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-pretendard py-3 rounded-lg transition-colors"
              >
                {isSubmitting ? '제출 중...' : '계정 변경 요청하기'}
              </button>

              {/* 취소 버튼 */}
              <button
                onClick={handleResetFlow}
                disabled={isSubmitting}
                className="w-full text-gray-400 hover:text-white font-pretendard text-sm transition-colors"
              >
                취소하고 다시 시작
              </button>
            </div>
          ) : (
            /* 일반 로그인 화면 */
            <>
              {/* 에러 메시지 */}
              {loginError && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
                  <p className="text-red-200 text-sm font-pretendard mb-2">
                    {loginError}
                  </p>
                  {loginError.includes('등록되지 않은') && (
                    <p className="text-gray-300 text-xs font-pretendard">
                      단체 회원이시라면 아래 '구글 계정 변경하기'를 이용해주세요.
                    </p>
                  )}
                </div>
              )}

              {/* Google 로그인 버튼 */}
              <button
                onClick={handleGoogleLogin}
                className="w-2/3 mx-auto flex items-center justify-center gap-3 bg-white text-gray-800 hover:bg-gray-100 hover:shadow-lg hover:scale-105 font-semibold py-3 px-6 rounded-lg transition-all duration-300 mb-6"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-pretendard">Google 계정으로 계속하기</span>
              </button>

              {/* 계정 변경 링크 */}
              <div className="text-center mb-8">
                <button
                  onClick={handleStartPhoneVerification}
                  className="text-gray-400 hover:text-white text-sm font-pretendard underline underline-offset-4 transition-colors"
                >
                  구글 계정 변경하기
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center mb-6">
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
            </>
          )}
        </div>
      </div>

      {/* 전화번호 인증 모달 */}
      <PhoneVerificationModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onVerified={handlePhoneVerified}
      />
    </div>
  );
}