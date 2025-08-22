import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  googleCallback: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  
  // Error management
  clearError: () => void;
}

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
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);


