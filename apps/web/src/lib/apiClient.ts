"use client";
import { ApiClient, createAdminApi, createAuthApi, createUserApi, createCoffeeChatApi, createProjectsApi, createSchedulesApi, createSponsorshipApi, createStorageApi, createCommunityApi } from '../../../../packages/api/src';
import { useAuthStore } from '../../../../packages/store/src';

// Create a singleton API client with token injection and refresh handling
let singleton: {
  client: ApiClient;
  auth: ReturnType<typeof createAuthApi>;
  user: ReturnType<typeof createUserApi>;
  admin: ReturnType<typeof createAdminApi>;
  coffeeChat: ReturnType<typeof createCoffeeChatApi>;
  projects: ReturnType<typeof createProjectsApi>;
  schedules: ReturnType<typeof createSchedulesApi>;
  sponsorship: ReturnType<typeof createSponsorshipApi>;
  storage: ReturnType<typeof createStorageApi>;
  community: ReturnType<typeof createCommunityApi>;
} | null = null;

export function getApi() {
  if (singleton) return singleton;

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api/v1';

  const client = new ApiClient({
    baseUrl,
    getAccessToken: () => useAuthStore.getState().accessToken ?? undefined,
    onUnauthorized: () => {
      useAuthStore.getState().clearTokens();
      // Do not redirect here to avoid unwanted redirects inside fetch logic
    },
    onRefreshToken: async () => {
      const { refreshToken, setTokens } = useAuthStore.getState();
      if (!refreshToken) return undefined;
      // Use a temporary client without hooks to avoid recursion
      const temp = new ApiClient({ baseUrl });
      const tokens = await createAuthApi(temp).refresh(refreshToken);
      setTokens(tokens.access_token, tokens.refresh_token);
      return tokens.access_token;
    },
  });

  const auth = createAuthApi(client);
  const user = createUserApi(client);
  const admin = createAdminApi(client);
  const coffeeChat = createCoffeeChatApi(client);
  const projects = createProjectsApi(client);
  const schedules = createSchedulesApi(client);
  const sponsorship = createSponsorshipApi(client);
  const storage = createStorageApi(client);
  const community = createCommunityApi(client);

  singleton = { client, auth, user, admin, coffeeChat, projects, schedules, sponsorship, storage, community };
  return singleton;
}


