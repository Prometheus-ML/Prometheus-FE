"use client";
import { useEffect } from 'react';
import { useAuthStore } from '@prometheus-fe/stores';

export function useAuthHydration() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const access = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    if (access && refresh) {
      setTokens(access, refresh);
    }
    setHydrated(true);
  }, [setTokens]);
}
