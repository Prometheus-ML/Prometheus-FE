"use client";
import { useEffect, useState } from 'react';
import { getApi } from '../src/lib/apiClient';
import { useAuthStore } from '../../../packages/store/src';

export default function Page() {
  const isAuthenticated = useAuthStore((s: any) => s.isAuthenticated());
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    getApi().auth
      .me()
      .then(setMe)
      .catch(() => setMe(null));
  }, [isAuthenticated]);

  return (
    <div style={{ padding: 24 }}>
      <h1>Prometheus Web (Next.js)</h1>
      {isAuthenticated ? (
        <pre>{JSON.stringify(me ?? {}, null, 2)}</pre>
      ) : (
        <a href="/auth/login">로그인</a>
      )}
    </div>
  );
}

