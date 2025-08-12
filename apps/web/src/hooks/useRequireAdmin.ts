"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../../packages/store/src';
import { getApi } from '../lib/apiClient';

const grantWeights: Record<string, number> = {
  Super: 0,
  Administrator: 1,
  Manager: 2,
  Member: 3,
};

export function useRequireAdmin() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ensure = async () => {
      if (!isAuthenticated) {
        router.replace('/auth/login');
        return;
      }
      let currentUser = user;
      if (!currentUser) {
        try {
          currentUser = await getApi().auth.me();
          setUser(currentUser);
        } catch {
          router.replace('/auth/login');
          return;
        }
      }
      const weight = currentUser?.grant ? grantWeights[currentUser.grant] ?? 999 : 999;
      if (weight > 2) {
        router.replace('/');
        return;
      }
      setReady(true);
    };
    ensure();
  }, [isAuthenticated, user, setUser, router]);

  return { ready };
}


