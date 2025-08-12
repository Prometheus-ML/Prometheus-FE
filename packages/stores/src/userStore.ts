import { create } from 'zustand';
import type { MyProfileResponse } from '@prometheus-fe/types';

export interface UserStoreState {
  profile: MyProfileResponse | null;
  isLoading: boolean;
  setProfile: (profile: MyProfileResponse | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useUserStore = create<UserStoreState>((set) => ({
  profile: null,
  isLoading: false,
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ profile: null, isLoading: false }),
}));


