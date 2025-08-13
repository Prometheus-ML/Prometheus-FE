import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserInfo } from '@prometheus-fe/types';

export interface AuthState {
  user: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;

  isAuthenticated: () => boolean;
  getUserGrant: () => string | null;
  getUserGrantWeight: () => number;
  canAccessMember: () => boolean;
  canAccessManager: () => boolean;
  canAccessAdministrator: () => boolean;
  canAccessSuper: () => boolean;
  canAccessRoot: () => boolean;
  setTokens: (access: string, refresh: string) => void;
  clearTokens: () => void;
  setUser: (user: UserInfo | null) => void;
  refreshUserInfo: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

  isAuthenticated: () => !!get().accessToken,
  getUserGrant: () => get().user?.grant || null,
  getUserGrantWeight: () => {
    const grantWeights = {
      'Root': 1,
      'Super': 2,
      'Administrator': 3,
      'Manager': 4,
      'Member': 5
    };
    const grant = get().user?.grant;
    return grant ? grantWeights[grant as keyof typeof grantWeights] || 999 : 999;
  },

  canAccessMember: () => {
    if (!get().isAuthenticated()) {
      // 인증이 안 되어 있으면 사용자 정보 다시 요청
      get().refreshUserInfo();
      return false;
    }
    return true;
  },

  canAccessManager: () => {
    if (!get().isAuthenticated()) {
      get().refreshUserInfo();
      return false;
    }
    return get().getUserGrantWeight() <= 4; // Manager 이상
  },

  canAccessAdministrator: () => {
    if (!get().isAuthenticated()) {
      get().refreshUserInfo();
      return false;
    }
    return get().getUserGrantWeight() <= 3; // Administrator 이상
  },

  canAccessSuper: () => {
    if (!get().isAuthenticated()) {
      get().refreshUserInfo();
      return false;
    }
    return get().getUserGrantWeight() <= 2; // Super 이상
  },

  canAccessRoot: () => {
    if (!get().isAuthenticated()) {
      get().refreshUserInfo();
      return false;
    }
    return get().getUserGrantWeight() <= 1; // Root만
  },

  refreshUserInfo: async () => {
    const { accessToken } = get();
    if (!accessToken) return;

    try {
      set({ isLoading: true });
      // 실제 API 호출은 ApiProvider나 별도 서비스에서 처리
      // 여기서는 사용자 정보 갱신 로직을 트리거
      console.log('사용자 정보 갱신 필요');
    } catch (error) {
      console.error('사용자 정보 갱신 실패:', error);
      get().clearTokens();
    } finally {
      set({ isLoading: false });
    }
  },

  setTokens: (access, refresh) => {
    set({ accessToken: access, refreshToken: refresh });
  },

  clearTokens: () => {
    set({ accessToken: null, refreshToken: null, user: null });
  },

  setUser: (user) => set({ user }),
    }),
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


