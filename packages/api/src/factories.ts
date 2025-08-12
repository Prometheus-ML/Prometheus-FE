import { ApiClient, ApiClientOptions, AuthCallbacks } from './apiClient';
import { createApiClientOptions } from './apiInstances';
import { AuthApi } from './authApi';
import { UserApi } from './userApi';
import { CoffeeChatApi } from './coffeeChatApi';
import { ProjectsApi } from './projectsApi';
import { SchedulesApi } from './schedulesApi';
import { SponsorshipApi } from './sponsorshipApi';
import { StorageApi } from './storageApi';
import { CommunityApi } from './communityApi';

export const createApiClient = (authCallbacks: AuthCallbacks = {}) => {
  const options = createApiClientOptions();
  return new ApiClient(options, authCallbacks);
};

export const createApis = (client: ApiClient) => ({
  auth: new AuthApi(client),
  users: new UserApi(client),
  coffeeChat: new CoffeeChatApi(client),
  projects: new ProjectsApi(client),
  schedules: new SchedulesApi(client),
  sponsorship: new SponsorshipApi(client),
  storage: new StorageApi(client),
  community: new CommunityApi(client),
});

export type { ApiClientOptions, AuthCallbacks };


