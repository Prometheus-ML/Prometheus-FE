"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@prometheus-fe/store';
import { useApi } from '../contexts/ApiProvider';

export function useRequireAuth() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [ready, setReady] = useState(false);
  const { auth } = useApi();

  useEffect(() => {
    const ensure = async () => {
      if (!isAuthenticated) {
        router.replace('/auth/login');
        return;
      }
      if (!user) {
        try {
          const me = await auth.me();
          setUser(me);
        } catch {
          router.replace('/auth/login');
          return;
        }
      }
      setReady(true);
    };
    ensure();
  }, [isAuthenticated, user, setUser, router]);

  return { ready };
}


