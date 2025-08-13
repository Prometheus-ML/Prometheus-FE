'use client';

import { ApiProvider } from '@prometheus-fe/context';
import { ReactNode } from 'react';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * 애플리케이션 전체에 사용되는 모든 Provider를 통합 관리하는 컴포넌트
 * Provider의 중첩 순서가 중요합니다. 의존성 순서에 맞게 배치해야 합니다.
 */
export const AppProviders = ({ children }: AppProvidersProps) => {
  return <ApiProvider>{children}</ApiProvider>;
};
