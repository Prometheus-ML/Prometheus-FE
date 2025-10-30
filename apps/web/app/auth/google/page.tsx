"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@prometheus-fe/stores";
// TODO: authApi import 추가
// import { authApi } from "@prometheus-fe/api";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAccessToken, setRefreshToken } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");

      // OAuth 에러 처리
      if (error) {
        router.push(`/auth/login?error=${error}`);
        return;
      }

      if (!code) {
        router.push("/auth/login?error=no_code");
        return;
      }

      try {
        // state에서 temp_token 확인 (전화번호 인증 플로우)
        let parsedState: { temp_token?: string; action?: string } = {};
        if (state) {
          try {
            parsedState = JSON.parse(state);
          } catch (e) {
            console.error("Failed to parse state:", e);
          }
        }

        // 전화번호 인증 후 계정 연결 플로우
        if (parsedState.temp_token && parsedState.action === 'link') {
          // TODO: Google 코드를 ID 토큰으로 교환
          // const googleTokenResponse = await fetch(...);
          // const { id_token } = googleTokenResponse;

          // TODO: 계정 연결 API 호출
          // const response = await authApi.linkGoogleAccount({
          //   temp_token: parsedState.temp_token,
          //   id_token: id_token
          // });

          // Mock 처리 (개발용)
          await new Promise(resolve => setTimeout(resolve, 1000));
          const mockResponse = {
            access_token: "mock_access_token",
            refresh_token: "mock_refresh_token",
            token_type: "Bearer",
            message: "계정이 성공적으로 연결되었습니다",
            previous_email: "[email protected]",
            new_email: "[email protected]"
          };

          setAccessToken(mockResponse.access_token);
          setRefreshToken(mockResponse.refresh_token);
          
          // 성공 메시지와 함께 메인으로 이동
          router.push("/?linked=success");
          return;
        }

        // 일반 Google 로그인 플로우
        // TODO: 기존 googleCallback API 호출
        // const response = await authApi.googleCallback({ code, state });
        
        // Mock 처리 (개발용)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 계정이 등록되지 않은 경우 시뮬레이션
        const isRegistered = false; // TODO: 실제로는 API 응답으로 판단
        
        if (!isRegistered) {
          router.push("/auth/login?error=account_not_found");
          return;
        }

        const mockResponse = {
          access_token: "mock_access_token",
          refresh_token: "mock_refresh_token",
          token_type: "Bearer"
        };

        setAccessToken(mockResponse.access_token);
        setRefreshToken(mockResponse.refresh_token);
        router.push("/");
        
      } catch (error: any) {
        console.error("Google callback error:", error);
        
        // 에러 타입별 처리
        if (error.response?.data?.error_code === 'ACCOUNT_NOT_FOUND') {
          router.push("/auth/login?error=account_not_found");
        } else if (error.response?.data?.error_code === 'ACCOUNT_DISABLED') {
          router.push("/auth/login?error=account_disabled");
        } else {
          router.push("/auth/login?error=unknown");
        }
      }
    };

    handleCallback();
  }, [searchParams, router, setAccessToken, setRefreshToken]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white font-pretendard">로그인 처리 중...</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}