'use client';

import React, { createContext, useContext, useMemo } from 'react';
import {
  ApiClient,
  createApiClient,
  createAuthApi,
  createUserApi,
  createAdminApi,
  createCoffeeChatApi,
  createProjectApi,
  createSchedulesApi,
  createSponsorshipApi,
  createStorageApi,
  createCommunityApi,
  createGroupApi,
  AuthApi,
  UserApi,
  AdminApi,
  CoffeeChatApi,
  ProjectApi,
  SchedulesApi,
  SponsorshipApi,
  StorageApi,
  CommunityApi,
  GroupApi,
} from '@prometheus-fe/api';
import { useAuthStore } from '@prometheus-fe/stores';

type ApiInstances = {
  client: ApiClient;
  auth: AuthApi;
  user: UserApi;
  admin: AdminApi;
  coffeeChat: CoffeeChatApi;
  project: ProjectApi;
  schedules: SchedulesApi;
  sponsorship: SponsorshipApi;
  storage: StorageApi;
  community: CommunityApi;
  group: GroupApi;
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
      getAccessToken: () => useAuthStore.getState().getAccessToken() ?? undefined,
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
      user: createUserApi(client),
      admin: createAdminApi(client),
      coffeeChat: createCoffeeChatApi(client),
      project: createProjectApi(client),
      schedules: createSchedulesApi(client),
      sponsorship: createSponsorshipApi(client),
      storage: createStorageApi(client),
      community: createCommunityApi(client),
      group: createGroupApi(client),
    } as const as ApiInstances;
  }, []);

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};
