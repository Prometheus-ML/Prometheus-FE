import { ApiClient, ApiClientOptions, AuthCallbacks } from './apiClient';
import { AuthApi } from './authApi';
import { UserApi } from './userApi';
import { AdminApi } from './adminApi';
import { CoffeeChatApi } from './coffeeChatApi';
import { ProjectApi } from './projectApi';
import { SchedulesApi } from './schedulesApi';
import { SponsorshipApi } from './sponsorshipApi';
import { StorageApi } from './storageApi';
import { CommunityApi } from './communityApi';
import { GroupApi } from './groupApi';

// API 클라이언트 옵션 생성 함수
export const createApiClientOptions = (): ApiClientOptions => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URI ||
    process.env.EXPO_PUBLIC_API_URI ||
    '';
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
export const createUserApi = (apiClient: ApiClient) => new UserApi(apiClient);
export const createAdminApi = (apiClient: ApiClient) => new AdminApi(apiClient);
export const createCoffeeChatApi = (apiClient: ApiClient) => new CoffeeChatApi(apiClient);
export const createProjectApi = (apiClient: ApiClient) => new ProjectApi(apiClient);
export const createSchedulesApi = (apiClient: ApiClient) => new SchedulesApi(apiClient);
export const createSponsorshipApi = (apiClient: ApiClient) => new SponsorshipApi(apiClient);
export const createStorageApi = (apiClient: ApiClient) => new StorageApi(apiClient);
export const createCommunityApi = (apiClient: ApiClient) => new CommunityApi(apiClient);
export const createGroupApi = (apiClient: ApiClient) => new GroupApi(apiClient);

// API 클래스 타입 export
export type { 
  AuthApi, 
  UserApi, 
  AdminApi, 
  CoffeeChatApi, 
  ProjectApi, 
  SchedulesApi, 
  SponsorshipApi, 
  StorageApi, 
  CommunityApi, 
  GroupApi 
};

export type { ApiClientOptions, AuthCallbacks };


