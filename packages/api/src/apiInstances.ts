import { ApiClient, ApiClientOptions, AuthCallbacks } from './apiClient';

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

export const createApiClient = (authCallbacks: AuthCallbacks = {}) => {
  const options = createApiClientOptions();
  return new ApiClient(options, authCallbacks);
};

export type { ApiClientOptions, AuthCallbacks };


