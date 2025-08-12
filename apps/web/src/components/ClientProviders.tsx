'use client';

import React from 'react';
import { useAuthHydration } from '../hooks/useAuthHydration';
import { ApiProvider } from '../contexts/ApiProvider';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  useAuthHydration();
  return <ApiProvider>{children}</ApiProvider>;
}


