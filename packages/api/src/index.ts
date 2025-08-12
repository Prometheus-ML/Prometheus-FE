export * from './apiClient';
export * from './apiInstances';
export * from './authApi';
export * from './userApi';
export * from './coffeeChatApi';
export * from './projectsApi';
export * from './schedulesApi';
export * from './sponsorshipApi';
export * from './storageApi';
export * from './communityApi';

// Factory helpers to align with app usage
import { ApiClient } from './apiClient';
import { AuthApi } from './authApi';
import { UserApi } from './userApi';
import { AdminApi } from './adminApi';
import { CoffeeChatApi } from './coffeeChatApi';
import { ProjectsApi } from './projectsApi';
import { SchedulesApi } from './schedulesApi';
import { SponsorshipApi } from './sponsorshipApi';
import { StorageApi } from './storageApi';
import { CommunityApi } from './communityApi';

export const createAuthApi = (client: ApiClient) => new AuthApi(client);
export const createUserApi = (client: ApiClient) => new UserApi(client);
export const createAdminApi = (client: ApiClient) => new AdminApi(client);
export const createCoffeeChatApi = (client: ApiClient) => new CoffeeChatApi(client);
export const createProjectsApi = (client: ApiClient) => new ProjectsApi(client);
export const createSchedulesApi = (client: ApiClient) => new SchedulesApi(client);
export const createSponsorshipApi = (client: ApiClient) => new SponsorshipApi(client);
export const createStorageApi = (client: ApiClient) => new StorageApi(client);
export const createCommunityApi = (client: ApiClient) => new CommunityApi(client);


