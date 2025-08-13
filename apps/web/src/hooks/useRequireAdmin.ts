"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@prometheus-fe/store';
import { useApi } from '../contexts/ApiProvider';

const grantWeights: Record<string, number> = {
  Root: 0,
  Super: 1,
  Administrator: 2,
  Manager: 3,
  Member: 4,
};

export function useRequireAdmin() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const hydrated = useAuthStore((s) => s.hydrated);
  const { auth } = useApi();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ensure = async () => {
      if (!hydrated) return;
      if (!isAuthenticated) {
        router.replace('/auth/login');
        return;
      }
      let currentUser = user;
      if (!currentUser) {
        try {
          currentUser = await auth.me();
          setUser(currentUser);
        } catch {
          router.replace('/auth/login');
          return;
        }
      }
      const weight = currentUser?.grant ? grantWeights[currentUser.grant] ?? 999 : 999;
      if (weight > 3) {
        router.replace('/');
        return;
      }
      setReady(true);
    };
    ensure();
  }, [hydrated, isAuthenticated, user, setUser, router]);

  return { ready };
}


