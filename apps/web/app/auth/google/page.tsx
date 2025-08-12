"use client";
import { useEffect, useState } from 'react';
import { createApiClient, createAuthApi } from '@prometheus-fe/api';
import { useAuthStore } from '@prometheus-fe/store';

export default function GoogleCallbackPage() {
  const [error, setError] = useState<string | null>(null);
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const errorParam = params.get('error');
      if (errorParam) {
        setError('Google 로그인이 취소되었거나 실패했습니다.');
        return;
      }
      if (!code) {
        setError('인증 정보가 없습니다.');
        return;
      }

      const client = createApiClient({
        getAccessToken: () => useAuthStore.getState().accessToken ?? undefined,
      });
      const authApi = createAuthApi(client);
      try {
        const tokens = await authApi.googleCallback({ code });
        setTokens(tokens.access_token, tokens.refresh_token);
        const user = await authApi.me();
        setUser(user);
        window.location.replace('/');
      } catch (e) {
        console.error(e);
        setError('로그인 처리 중 오류가 발생했습니다.');
      }
    };
    run();
  }, [setTokens, setUser]);

  if (error) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <div>
          <p>{error}</p>
          <a href="/auth/login">다시 시도</a>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
      <p>로그인 처리 중...</p>
    </div>
  );
}


