import { create } from 'zustand';

export interface AuthState {
  user: {
    id: number;
    email: string;
    name: string;
    grant?: string;
    grant_weight?: number;
  } | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;

  isAuthenticated: () => boolean;
  setTokens: (access: string, refresh: string) => void;
  clearTokens: () => void;
  setUser: (user: AuthState['user']) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,

  isAuthenticated: () => !!get().accessToken,
  setTokens: (access, refresh) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    }
    set({ accessToken: access, refreshToken: refresh });
  },
  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    set({ accessToken: null, refreshToken: null, user: null });
  },
  setUser: (user) => set({ user }),
}));


