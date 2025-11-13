import { create } from 'zustand';
import { persist, PersistStorage } from 'zustand/middleware';
import type { UserInfo } from '@prometheus-fe/types';
import type { AuthApi } from '@prometheus-fe/api';

export interface AuthState {
  user: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;

  // Auth methods
  isAuthenticated: () => boolean;
  getUserGrant: () => string | null;
  getUserGrantWeight: () => number;
  canAccessMember: () => boolean;
  canAccessAdministrator: () => boolean;
  canAccessSuper: () => boolean;
  canAccessRoot: () => boolean;
  
  // Token management
  setTokens: (access: string, refresh: string) => void;
  clearTokens: () => void;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  
  // User management
  setUser: (user: UserInfo | null) => void;
  refreshUserInfo: () => Promise<void>;
  
  // API instance management
  initApi: (authApi: AuthApi) => void;
  
  // Authentication flows
  getGoogleAuthUrl: (state?: string) => Promise<{ auth_url: string; state?: string | null } | null>;
  getAppleAuthUrl: (state?: string) => Promise<{ auth_url: string; state?: string | null } | null>;
  googleCallback: (code: string) => Promise<boolean>;
  appleCallback: (code: string, user?: { name?: { firstName?: string; lastName?: string }; email?: string }) => Promise<boolean>;
  appleLogin: (idToken: string, user?: { name?: { firstName?: string; lastName?: string }; email?: string }) => Promise<boolean>;
  tempLogin: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  
  // Error management
  clearError: () => void;
}

// SSR 안전 스토리지 생성 함수
const createSafeStorage = (): PersistStorage<Partial<AuthState>> => {
  // 서버 사이드 환경 체크
  if (typeof window === 'undefined') {
    // 메모리 스토리지 (서버 사이드용)
    const memoryStorage: Record<string, any> = {};
    return {
      getItem: async (name: string) => memoryStorage[name] || null,
      setItem: async (name: string, value: any) => {
        memoryStorage[name] = value;
      },
      removeItem: async (name: string) => {
        delete memoryStorage[name];
      },
    };
  }
  
  // React Native 환경 체크
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return {
        getItem: async (name: string) => {
          try {
            const value = await AsyncStorage.getItem(name);
            return value ? JSON.parse(value) : null;
          } catch (error) {
            console.warn('AsyncStorage getItem error:', error);
            return null;
          }
        },
        setItem: async (name: string, value: any) => {
          try {
            await AsyncStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            console.warn('AsyncStorage setItem error:', error);
          }
        },
        removeItem: async (name: string) => {
          try {
            await AsyncStorage.removeItem(name);
          } catch (error) {
            console.warn('AsyncStorage removeItem error:', error);
          }
        },
      };
    } catch (error) {
      console.warn('AsyncStorage not available:', error);
      // fallback to memory storage
      const memoryStorage: Record<string, any> = {};
      return {
        getItem: async (name: string) => memoryStorage[name] || null,
        setItem: async (name: string, value: any) => {
          memoryStorage[name] = value;
        },
        removeItem: async (name: string) => {
          delete memoryStorage[name];
        },
      };
    }
  }
  
  // 브라우저 환경에서 localStorage 사용
  return {
    getItem: async (name: string) => {
      try {
        const value = window.localStorage.getItem(name);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.warn('localStorage getItem error:', error);
        return null;
      }
    },
    setItem: async (name: string, value: any) => {
      try {
        window.localStorage.setItem(name, JSON.stringify(value));
      } catch (error) {
        console.warn('localStorage setItem error:', error);
      }
    },
    removeItem: async (name: string) => {
      try {
        window.localStorage.removeItem(name);
      } catch (error) {
        console.warn('localStorage removeItem error:', error);
      }
    },
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      // AuthApi 인스턴스 보관을 위한 변수
      let authApiInstance: AuthApi | null = null;

      return {
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
        error: null,

        // API 인스턴스 초기화 함수
        initApi: (authApi: AuthApi) => {
          authApiInstance = authApi;
        },

        // Auth methods
        isAuthenticated: () => {
          const { user, accessToken } = get();
          return !!(user && accessToken);
        },

        getUserGrant: () => {
          const { user } = get();
          return user?.grant || null;
        },

  getUserGrantWeight: () => {
          const grant = get().getUserGrant();
    const grantWeights = {
            Root: 4,
            Super: 3,
            Administrator: 2,
            Member: 1,
          } as const;
          return grantWeights[grant as keyof typeof grantWeights] || 0;
  },

  canAccessMember: () => {
          return get().getUserGrantWeight() >= 1; // Member 이상
  },

  canAccessAdministrator: () => {
          return get().getUserGrantWeight() >= 2; // Administrator 이상
  },

  canAccessSuper: () => {
          return get().getUserGrantWeight() >= 3; // Super 이상
  },

  canAccessRoot: () => {
          return get().getUserGrantWeight() >= 4; // Root만
        },

        // Token management
        setTokens: (access: string, refresh: string) => {
    set({ accessToken: access, refreshToken: refresh });
  },

  clearTokens: () => {
    set({ accessToken: null, refreshToken: null, user: null });
  },

        getAccessToken: () => {
          return get().accessToken;
        },

        getRefreshToken: () => {
          return get().refreshToken;
        },

        // User management
        setUser: (user: UserInfo | null) => {
          set({ user });
        },

        refreshUserInfo: async () => {
          if (!authApiInstance) {
            console.error('AuthApi가 초기화되지 않았습니다.');
            return;
          }

          const { accessToken } = get();
          if (!accessToken) return;

          try {
            set({ isLoading: true, error: null });
            const user = await authApiInstance.verify();
            set({ user, isLoading: false });
          } catch (error: any) {
            console.error('사용자 정보 갱신 실패:', error);
            set({ 
              isLoading: false, 
              error: error?.message || '사용자 정보 갱신 실패' 
            });
            // 토큰이 유효하지 않으면 클리어
            if (error?.status === 401 || error?.status === 403) {
              get().clearTokens();
            }
          }
        },

        // Authentication flows
        getGoogleAuthUrl: async (state?: string) => {
          if (!authApiInstance) {
            set({ error: 'API가 초기화되지 않았습니다.' });
            return null;
          }

          try {
            const response = await authApiInstance.getGoogleAuthUrl(state);
            return response;
          } catch (error: any) {
            console.error('Google 인증 URL 가져오기 실패:', error);
            set({ error: 'Google 인증 URL을 가져올 수 없습니다.' });
            return null;
          }
        },

        getAppleAuthUrl: async (state?: string) => {
          if (!authApiInstance) {
            set({ error: 'API가 초기화되지 않았습니다.' });
            return null;
          }

          try {
            const response = await authApiInstance.getAppleAuthUrl(state);
            return response;
          } catch (error: any) {
            console.error('Apple 인증 URL 가져오기 실패:', error);
            set({ error: 'Apple 인증 URL을 가져올 수 없습니다.' });
            return null;
          }
        },

        googleCallback: async (code: string) => {
          if (!authApiInstance) {
            set({ error: 'API가 초기화되지 않았습니다.' });
            return false;
          }

          set({ isLoading: true, error: null });
          try {
            // 1. Google callback으로 토큰 받기
            const tokens = await authApiInstance.googleCallback({ code });
            
            // 2. 토큰 저장
            get().setTokens(tokens.access_token, tokens.refresh_token);
            
            // 3. 사용자 정보 조회
            const user = await authApiInstance.verify();
            
            // 4. 상태 일괄 업데이트
            set({
              user,
              isLoading: false,
              error: null,
            });

            return true;
          } catch (error: any) {
            console.error('Google 로그인 실패:', error);
            
            // 서버에서 받은 detail 메시지가 있으면 그것을 사용
            let errorMessage = '로그인 처리 중 오류가 발생했습니다.';
            
            if (error?.response?.data?.detail) {
              errorMessage = error.response.data.detail;
            } else if (error?.detail) {
              errorMessage = error.detail;
            } else if (error?.message) {
              errorMessage = error.message;
            }
            
            set({
              isLoading: false,
              error: errorMessage,
            });
            return false;
          }
        },

        appleCallback: async (code: string, user?: { name?: { firstName?: string; lastName?: string }; email?: string }) => {
          if (!authApiInstance) {
            set({ error: 'API가 초기화되지 않았습니다.' });
            return false;
          }

          set({ isLoading: true, error: null });
          try {
            // 1. Apple callback으로 토큰 받기
            const tokens = await authApiInstance.appleCallback({ 
              code,
              user: user ? {
                name: user.name ? {
                  firstName: user.name.firstName,
                  lastName: user.name.lastName,
                } : undefined,
                email: user.email,
              } : undefined,
            });
            
            // 2. 토큰 저장
            get().setTokens(tokens.access_token, tokens.refresh_token);
            
            // 3. 사용자 정보 조회
            const userInfo = await authApiInstance.verify();
            
            // 4. 상태 일괄 업데이트
            set({
              user: userInfo,
              isLoading: false,
              error: null,
            });

            return true;
          } catch (error: any) {
            console.error('Apple 로그인 실패:', error);
            
            // 서버에서 받은 detail 메시지가 있으면 그것을 사용
            let errorMessage = '로그인 처리 중 오류가 발생했습니다.';
            
            if (error?.response?.data?.detail) {
              errorMessage = error.response.data.detail;
            } else if (error?.detail) {
              errorMessage = error.detail;
            } else if (error?.message) {
              errorMessage = error.message;
            }
            
            set({
              isLoading: false,
              error: errorMessage,
            });
            return false;
          }
        },

        appleLogin: async (idToken: string, user?: { name?: { firstName?: string; lastName?: string }; email?: string }) => {
          console.log('[authStore] appleLogin called with:', {
            hasIdToken: !!idToken,
            idTokenLength: idToken?.length,
            hasUser: !!user,
          });

          if (!authApiInstance) {
            console.error('[authStore] AuthApi가 초기화되지 않았습니다.');
            set({ error: 'API가 초기화되지 않았습니다.' });
            return false;
          }

          set({ isLoading: true, error: null });
          try {
            // 1. Apple ID 토큰으로 로그인
            console.log('[authStore] Calling authApiInstance.appleLogin...');
            const payload = {
              id_token: idToken,
              user: user ? {
                name: user.name ? {
                  firstName: user.name.firstName,
                  lastName: user.name.lastName,
                } : undefined,
                email: user.email,
              } : undefined,
            };
            console.log('[authStore] Payload:', {
              hasIdToken: !!payload.id_token,
              hasUser: !!payload.user,
            });

            const tokens = await authApiInstance.appleLogin(payload);
            console.log('[authStore] Tokens received:', {
              hasAccessToken: !!tokens?.access_token,
              hasRefreshToken: !!tokens?.refresh_token,
            });
            
            // 2. 토큰 저장
            get().setTokens(tokens.access_token, tokens.refresh_token);
            console.log('[authStore] Tokens saved');
            
            // 3. 사용자 정보 조회
            console.log('[authStore] Calling verify to get user info...');
            const userInfo = await authApiInstance.verify();
            console.log('[authStore] User info received:', {
              hasUser: !!userInfo,
              userId: userInfo?.id,
              userEmail: userInfo?.email,
            });
            
            // 4. 상태 일괄 업데이트
            set({
              user: userInfo,
              isLoading: false,
              error: null,
            });

            console.log('[authStore] Apple login completed successfully');
            return true;
          } catch (error: any) {
            console.error('[authStore] Apple 로그인 실패:', error);
            console.error('[authStore] Error details:', {
              message: error?.message,
              status: error?.status,
              response: error?.response?.data,
              stack: error?.stack,
            });
            
            // 서버에서 받은 detail 메시지가 있으면 그것을 사용
            let errorMessage = '로그인 처리 중 오류가 발생했습니다.';
            
            if (error?.response?.data?.detail) {
              errorMessage = error.response.data.detail;
            } else if (error?.detail) {
              errorMessage = error.detail;
            } else if (error?.message) {
              errorMessage = error.message;
            }
            
            set({
              isLoading: false,
              error: errorMessage,
            });
            return false;
          }
        },

        tempLogin: async (username: string, password: string) => {
          if (!authApiInstance) {
            set({ error: 'API가 초기화되지 않았습니다.' });
            return false;
          }

          set({ isLoading: true, error: null });
          try {
            // 1. 임시 로그인으로 토큰 받기
            const tokens = await authApiInstance.tempLogin({ username, password });
            
            // 2. 토큰 저장
            get().setTokens(tokens.access_token, tokens.refresh_token);
            
            // 3. 사용자 정보 조회
            const user = await authApiInstance.verify();
            
            // 4. 상태 일괄 업데이트
            set({
              user,
              isLoading: false,
              error: null,
            });

            return true;
          } catch (error: any) {
            console.error('임시 로그인 실패:', error);
            
            // 서버에서 받은 detail 메시지가 있으면 그것을 사용
            let errorMessage = '로그인 처리 중 오류가 발생했습니다.';
            
            if (error?.response?.data?.detail) {
              errorMessage = error.response.data.detail;
            } else if (error?.detail) {
              errorMessage = error.detail;
            } else if (error?.message) {
              errorMessage = error.message;
            }
            
            set({
              isLoading: false,
              error: errorMessage,
            });
            return false;
          }
        },

        logout: async () => {
          set({ isLoading: true });
          try {
            // 토큰과 사용자 정보 클리어
            get().clearTokens();
            set({ 
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            console.error('로그아웃 실패:', error);
            set({ 
              isLoading: false,
              error: error?.message || '로그아웃 실패',
            });
          }
        },

        refreshAccessToken: async () => {
          if (!authApiInstance) {
            console.error('AuthApi가 초기화되지 않았습니다.');
            return false;
          }

          const { refreshToken } = get();
          if (!refreshToken) {
            console.error('Refresh token이 없습니다.');
            return false;
          }

          try {
            set({ isLoading: true });
            const tokens = await authApiInstance.refresh(refreshToken);
            
            // 새로운 토큰 저장 (리프레시 토큰이 새로 발급된 경우 업데이트)
            const newRefreshToken = tokens.refresh_token || refreshToken;
            get().setTokens(tokens.access_token, newRefreshToken);
            
            set({ isLoading: false });
            console.log('Access token refreshed successfully');
            return true;
          } catch (error: any) {
            console.error('Token refresh failed:', error);
            set({ isLoading: false });
            
            // Refresh token도 유효하지 않으면 로그아웃
            if (error?.status === 401 || error?.status === 403) {
              get().clearTokens();
            }
            
            return false;
          }
        },

        // Error management
        clearError: () => {
          set({ error: null });
        },
      };
    },
    {
      name: 'auth-store',
      storage: createSafeStorage(), // 플랫폼별 스토리지 사용
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);


