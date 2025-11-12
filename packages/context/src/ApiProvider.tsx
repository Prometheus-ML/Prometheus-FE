'use client';

import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import {
  ApiClient,
  createApiClient,
  createAuthApi,
  createMemberApi,
  createCoffeeChatApi,
  createProjectApi,
  createLandingApi,
  createStorageApi,
  createCommunityApi,
  createGroupApi,
  createEventApi,
  createChatApi,
  createDashboardApi,
  AuthApi,
  MemberApi,
  CoffeeChatApi,
  ProjectApi,
  LandingApi,
  StorageApi,
  CommunityApi,
  GroupApi,
  EventApi,
  ChatApi,
  DashboardApi
} from '@prometheus-fe/api';
import { useAuthStore } from '@prometheus-fe/stores';

// 라우터 타입: 최소한의 push 메서드만 요구
export interface RouterLike {
  push: (...args: any[]) => void;
}

type ApiInstances = {
  client: ApiClient;
  auth: AuthApi;
  member: MemberApi;
  coffeeChat: CoffeeChatApi;
  project: ProjectApi;
  landing: LandingApi;
  storage: StorageApi;
  community: CommunityApi;
  group: GroupApi;
  event: EventApi;
  chat: ChatApi;
  dashboard: DashboardApi;
};

const ApiContext = createContext<ApiInstances | null>(null);

export const useApi = (): ApiInstances => {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error('useApi must be used within ApiProvider');
  return ctx;
};

// API Provider Props 타입 정의
interface ApiProviderProps {
  children: ReactNode;
  router?: RouterLike;
}

/**
 * ApiProvider는 라우터를 직접 import/use하지 않고,
 * 반드시 router prop으로만 받습니다.
 * router가 없으면 라우팅 없이 동작합니다.
 */
export const ApiProvider = ({ children, router }: ApiProviderProps) => {
  const api = useMemo<ApiInstances>(() => {
    const client = createApiClient({
      onUnauthorized: async (responseText: string) => {
        try {
          // 토큰 갱신 시도
          const refreshSuccess = await useAuthStore.getState().refreshAccessToken();
          if (refreshSuccess) {
            // 토큰 갱신 성공 시 재요청
            return;
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
        }
        
        // 토큰 갱신 실패 시에만 로그아웃
        useAuthStore.getState().clearTokens();
      },
      onForbidden: () => {
        console.log('403 Forbidden - Access denied, redirecting to main page');
        // 메인 페이지로 이동 (새로고침을 통해 확실하게 이동)
        //window.location.href = '/';
      },
      getAccessToken: () => useAuthStore.getState().getAccessToken() ?? undefined,
      getRefreshToken: () => useAuthStore.getState().getRefreshToken() ?? undefined,
      refreshAccessToken: async () => {
        return await useAuthStore.getState().refreshAccessToken();
      },
      onRefreshFailed: () => {
        console.log('Token refresh failed, redirecting to main page');
        // 토큰 클리어는 유지하되 메인 페이지로 이동 (구현 필요)
        useAuthStore.getState().clearTokens();
      },
    });

    const authApi = createAuthApi(client);

    // AuthStore에 AuthApi 인스턴스 초기화
    useAuthStore.getState().initApi(authApi);

    return {
      client,
      auth: authApi,
      member: createMemberApi(client),
      coffeeChat: createCoffeeChatApi(client),
      project: createProjectApi(client),
      landing: createLandingApi(client),
      storage: createStorageApi(client),
      community: createCommunityApi(client),
      group: createGroupApi(client),
      event: createEventApi(client),
      chat: createChatApi(client),
      dashboard: createDashboardApi(client),
    } as const as ApiInstances;
  }, []);

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};
