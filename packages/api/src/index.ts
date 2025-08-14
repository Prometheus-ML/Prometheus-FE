export * from './apiClient';
export * from './apiInstances';
export * from './authApi';
export * from './userApi';
export * from './adminApi';
export * from './coffeeChatApi';
export * from './projectApi';
export * from './schedulesApi';
export * from './sponsorshipApi';
export * from './storageApi';
export * from './communityApi';
export * from './groupApi';

// Factory helpers to align with app usage
import { ApiClient } from './apiClient';
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

export const createAuthApi = (client: ApiClient) => new AuthApi(client);
export const createUserApi = (client: ApiClient) => new UserApi(client);
export const createAdminApi = (client: ApiClient) => new AdminApi(client);
export const createCoffeeChatApi = (client: ApiClient) => new CoffeeChatApi(client);
export const createProjectApi = (client: ApiClient) => new ProjectApi(client);
export const createSchedulesApi = (client: ApiClient) => new SchedulesApi(client);
export const createSponsorshipApi = (client: ApiClient) => new SponsorshipApi(client);
export const createStorageApi = (client: ApiClient) => new StorageApi(client);
export const createCommunityApi = (client: ApiClient) => new CommunityApi(client);
export const createGroupApi = (client: ApiClient) => new GroupApi(client);

// Default API instances for common usage
import { createApiClient } from './apiInstances';

const defaultClient = createApiClient();
export const authApi = createAuthApi(defaultClient);
export const userApi = createUserApi(defaultClient);
export const adminApi = createAdminApi(defaultClient);
export const coffeeChatApi = createCoffeeChatApi(defaultClient);
export const projectsApi = createProjectApi(defaultClient);
export const schedulesApi = createSchedulesApi(defaultClient);
export const sponsorshipApi = createSponsorshipApi(defaultClient);
export const storageApi = createStorageApi(defaultClient);
export const communityApi = createCommunityApi(defaultClient);
export const groupApi = createGroupApi(defaultClient);


