import { ApiClient, ApiClientOptions, AuthCallbacks } from './apiClient';
import { AuthApi } from './authApi';
import { MemberApi } from './memberApi';
import { CoffeeChatApi } from './coffeeChatApi';
import { ProjectApi } from './projectApi';
import { LandingApi } from './landingApi';
import { StorageApi } from './storageApi';
import { CommunityApi } from './communityApi';
import { GroupApi } from './groupApi';
import { EventApi } from './eventApi';
import { DashboardApi } from './dashboardApi';

// API 클라이언트 옵션 생성 함수
export const createApiClientOptions = (): ApiClientOptions => {
  let baseUrl =
    process.env.NEXT_PUBLIC_API_URI ||
    process.env.EXPO_PUBLIC_API_URI ||
    '';
  // Mixed content 방지: HTTPS 페이지에서 http API URL이면 https로 치환 (배포 환경)
  if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    baseUrl.startsWith('http://')
  ) {
    baseUrl = baseUrl.replace(/^http:\/\//i, 'https://');
  }
  return {
    baseUrl,
    defaultHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };
};

// API 클라이언트 생성 함수
export const createApiClient = (authCallbacks: AuthCallbacks = {}) => {
  const options = createApiClientOptions();
  return new ApiClient(options, authCallbacks);
};

// API 서비스 생성 함수
export const createAuthApi = (apiClient: ApiClient) => new AuthApi(apiClient);
export const createMemberApi = (apiClient: ApiClient) => new MemberApi(apiClient);
export const createCoffeeChatApi = (apiClient: ApiClient) => new CoffeeChatApi(apiClient);
export const createProjectApi = (apiClient: ApiClient) => new ProjectApi(apiClient);
export const createLandingApi = (apiClient: ApiClient) => new LandingApi(apiClient);
export const createStorageApi = (apiClient: ApiClient) => new StorageApi(apiClient);
export const createCommunityApi = (apiClient: ApiClient) => new CommunityApi(apiClient);
export const createGroupApi = (apiClient: ApiClient) => new GroupApi(apiClient);
export const createEventApi = (apiClient: ApiClient) => new EventApi(apiClient);
export const createDashboardApi = (apiClient: ApiClient) => new DashboardApi(apiClient);
// API 클래스 타입 export
export type { 
  AuthApi, 
  MemberApi, 
  CoffeeChatApi, 
  ProjectApi, 
  LandingApi,
  StorageApi, 
  CommunityApi, 
  GroupApi,
  EventApi,
  DashboardApi
};

export type { ApiClientOptions, AuthCallbacks };


