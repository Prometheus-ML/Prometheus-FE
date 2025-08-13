'use client';

import React, { createContext, useContext, useMemo } from 'react';
import {
  createApiClient,
  createAdminApi,
  createAuthApi,
  createUserApi,
  createCoffeeChatApi,
  createProjectsApi,
  createSchedulesApi,
  createSponsorshipApi,
  createStorageApi,
  createCommunityApi,
  ApiClient,
  AuthApi,
  UserApi,
  CoffeeChatApi,
  ProjectsApi,
  SchedulesApi,
  SponsorshipApi,
  StorageApi,
  CommunityApi,
} from '@prometheus-fe/api';
import { useAuthStore } from '@prometheus-fe/stores';

type ApiInstances = {
  client: ApiClient;
  auth: AuthApi;
  user: UserApi;
  admin: ReturnType<typeof createAdminApi>;
  coffeeChat: CoffeeChatApi;
  projects: ProjectsApi;
  schedules: SchedulesApi;
  sponsorship: SponsorshipApi;
  storage: StorageApi;
  community: CommunityApi;
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
      getAccessToken: () => useAuthStore.getState().accessToken ?? undefined,
      onRefreshFailed: () => {
        useAuthStore.getState().clearTokens();
      },
    });

    return {
      client,
      auth: createAuthApi(client),
      user: createUserApi(client),
      admin: createAdminApi(client),
      coffeeChat: createCoffeeChatApi(client),
      projects: createProjectsApi(client),
      schedules: createSchedulesApi(client),
      sponsorship: createSponsorshipApi(client),
      storage: createStorageApi(client),
      community: createCommunityApi(client),
    } as const as ApiInstances;
  }, []);

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};
