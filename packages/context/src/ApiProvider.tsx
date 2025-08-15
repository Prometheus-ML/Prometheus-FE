'use client';

import React, { createContext, useContext, useMemo } from 'react';
import {
  ApiClient,
  createApiClient,
  createAuthApi,
  createMemberApi,
  createCoffeeChatApi,
  createProjectApi,
  createSponsorshipApi,
  createStorageApi,
  createCommunityApi,
  createGroupApi,
  createEventApi,
  AuthApi,
  MemberApi,
  CoffeeChatApi,
  ProjectApi,
  SponsorshipApi,
  StorageApi,
  CommunityApi,
  GroupApi,
  EventApi
} from '@prometheus-fe/api';
import { useAuthStore } from '@prometheus-fe/stores';

type ApiInstances = {
  client: ApiClient;
  auth: AuthApi;
  member: MemberApi;
  coffeeChat: CoffeeChatApi;
  project: ProjectApi;
  sponsorship: SponsorshipApi;
  storage: StorageApi;
  community: CommunityApi;
  group: GroupApi;
  event: EventApi;
};

const ApiContext = createContext<ApiInstances | null>(null);

export const useApi = (): ApiInstances => {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error('useApi must be used within ApiProvider');
  return ctx;
};

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
  const api = useMemo<ApiInstances>(() => {
    const client = createApiClient({
      onUnauthorized: () => {
        useAuthStore.getState().clearTokens();
      },
      onForbidden: () => {
        console.log('403 Forbidden - Access denied');
      },
      getAccessToken: () => useAuthStore.getState().getAccessToken() ?? undefined,
      getRefreshToken: () => useAuthStore.getState().getRefreshToken() ?? undefined,
      refreshAccessToken: async () => {
        return await useAuthStore.getState().refreshAccessToken();
      },
      onRefreshFailed: () => {
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
      sponsorship: createSponsorshipApi(client),
      storage: createStorageApi(client),
      community: createCommunityApi(client),
      group: createGroupApi(client),
      event: createEventApi(client),
    } as const as ApiInstances;
  }, []);

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};
