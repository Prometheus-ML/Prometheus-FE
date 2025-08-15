import { useApi } from '@prometheus-fe/context';
import { useState, useCallback } from 'react';
import type {
  UserPublicListResponse,
  UserPrivateListResponse,
  UserDetailResponse,
  MyProfileResponse,
  MyProfileUpdateRequest,
  UserPublic,
} from '@prometheus-fe/types';
import { CoffeeChatRequestCreate, CoffeeChatResponseRequest } from '@prometheus-fe/types';

export const useUser = () => {
  const { user } = useApi();
  const [publicUsers, setPublicUsers] = useState<UserPublicListResponse['users']>([]);
  const [privateUsers, setPrivateUsers] = useState<UserPrivateListResponse['users']>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetailResponse | null>(null);
  const [myProfile, setMyProfile] = useState<MyProfileResponse | null>(null);
  const [isLoadingPublic, setIsLoadingPublic] = useState(false);
  const [isLoadingPrivate, setIsLoadingPrivate] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // 공개 사용자 목록 조회
  const getPublicUsers = useCallback(async (params?: {
    page?: number;
    size?: number;
    search?: string;
    executive?: boolean;
    gen?: number;
    mbti?: string;
    school?: string;
  }) => {
    if (!user) {
      console.warn('user is not available. Ensure useUser is used within ApiProvider.');
      setIsLoadingPublic(false);
      return { users: [], total: 0, page: 1, size: 20 };
    }
    try {
      setIsLoadingPublic(true);
      const data = await user.listPublic(params);
      setPublicUsers(data.users || []);
      return data;
    } catch (error) {
      console.error('공개 사용자 목록 조회 실패:', error);
      setPublicUsers([]);
      throw error;
    } finally {
      setIsLoadingPublic(false);
    }
  }, [user]);

  // 비공개 사용자 목록 조회 (인증 필요)
  const getPrivateUsers = useCallback(async (params?: {
    page?: number;
    size?: number;
    search?: string;
    executive?: boolean;
    gen?: number;
    mbti?: string;
    school?: string;
  }) => {
    if (!user) {
      console.warn('user is not available. Ensure useUser is used within ApiProvider.');
      setIsLoadingPrivate(false);
      return { users: [], total: 0, page: 1, size: 20 };
    }
    try {
      setIsLoadingPrivate(true);
      const data = await user.listPrivate(params);
      setPrivateUsers(data.users || []);
      return data;
    } catch (error) {
      console.error('비공개 사용자 목록 조회 실패:', error);
      setPrivateUsers([]);
      throw error;
    } finally {
      setIsLoadingPrivate(false);
    }
  }, [user]);

  // 사용자 검색 (공개)
  const searchUsers = useCallback(async (params?: { q?: string; limit?: number }) => {
    if (!user) {
      console.warn('user is not available. Ensure useUser is used within ApiProvider.');
      return [];
    }
    try {
      const data = await user.searchUsers(params);
      return data;
    } catch (error) {
      console.error('사용자 검색 실패:', error);
      return [];
    }
  }, [user]);

  // 사용자 상세 정보 조회
  const getUser = useCallback(async (userId: string) => {
    if (!user) {
      throw new Error('user is not available');
    }
    try {
      setIsLoadingUser(true);
      const data = await user.getUser(userId);
      setSelectedUser(data);
      return data;
    } catch (error) {
      console.error(`사용자 ${userId} 상세 정보 조회 실패:`, error);
      setSelectedUser(null);
      throw error;
    } finally {
      setIsLoadingUser(false);
    }
  }, [user]);

  // 내 프로필 조회
  const getMyProfile = useCallback(async () => {
    if (!user) {
      throw new Error('user is not available');
    }
    try {
      setIsLoadingProfile(true);
      const data = await user.me();
      setMyProfile(data);
      return data;
    } catch (error) {
      console.error('내 프로필 조회 실패:', error);
      setMyProfile(null);
      throw error;
    } finally {
      setIsLoadingProfile(false);
    }
  }, [user]);

  // 내 프로필 수정
  const updateMyProfile = useCallback(async (payload: MyProfileUpdateRequest) => {
    if (!user) {
      throw new Error('user is not available');
    }
    try {
      setIsLoadingProfile(true);
      const data = await user.updateMe(payload);
      setMyProfile(data);
      return data;
    } catch (error) {
      console.error('내 프로필 수정 실패:', error);
      throw error;
    } finally {
      setIsLoadingProfile(false);
    }
  }, [user]);

  // 사용자 정보 수정 (Manager 이상)
  const updateUser = useCallback(async (userId: string, payload: any) => {
    if (!user) {
      throw new Error('user is not available');
    }
    try {
      const data = await user.updateUser(userId, payload);
      if (selectedUser?.id === userId) {
        setSelectedUser(data);
      }
      return data;
    } catch (error) {
      console.error(`사용자 ${userId} 수정 실패:`, error);
      throw error;
    }
  }, [user, selectedUser]);

  // 사용자 삭제 (Manager 이상)
  const deleteUser = useCallback(async (userId: string) => {
    if (!user) {
      throw new Error('user is not available');
    }
    try {
      await user.deleteUser(userId);
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
      // 목록에서도 제거
      setPrivateUsers(prev => prev.filter(u => u.id !== userId));
      setPublicUsers(prev => prev.filter(u => 'id' in u && u.id !== userId));
    } catch (error) {
      console.error(`사용자 ${userId} 삭제 실패:`, error);
      throw error;
    }
  }, [user, selectedUser]);

  // 사용자 역할 변경 (Administrator 이상)
  const updateUserGrant = useCallback(async (userId: string, grant: string) => {
    if (!user) {
      throw new Error('user is not available');
    }
    try {
      const data = await user.updateGrant(userId, { grant });
      if (selectedUser?.id === userId) {
        setSelectedUser(data);
      }
      return data;
    } catch (error) {
      console.error(`사용자 ${userId} 역할 변경 실패:`, error);
      throw error;
    }
  }, [user, selectedUser]);

  // 사용자 상태 변경 (Manager 이상)
  const updateUserStatus = useCallback(async (userId: string, status: string) => {
    if (!user) {
      throw new Error('user is not available');
    }
    try {
      const data = await user.updateStatus(userId, { status });
      if (selectedUser?.id === userId) {
        setSelectedUser(data);
      }
      return data;
    } catch (error) {
      console.error(`사용자 ${userId} 상태 변경 실패:`, error);
      throw error;
    }
  }, [user, selectedUser]);

  // 사용자 프로젝트 목록 조회
  const getUserProjects = useCallback(async (userId: string) => {
    if (!user) {
      throw new Error('user is not available');
    }
    try {
      const data = await user.getUserProjects(userId);
      return data;
    } catch (error) {
      console.error(`사용자 ${userId} 프로젝트 목록 조회 실패:`, error);
      throw error;
    }
  }, [user]);

  // 사용자 게시글 목록 조회
  const getUserPosts = useCallback(async (userId: string) => {
    if (!user) {
      throw new Error('user is not available');
    }
    try {
      const data = await user.getUserPosts(userId);
      return data;
    } catch (error) {
      console.error(`사용자 ${userId} 게시글 목록 조회 실패:`, error);
      throw error;
    }
  }, [user]);

  // Coffee Chat APIs
  const getAvailableUsers = useCallback(async (params?: {
    page?: number;
    size?: number;
    search?: string;
    gen_filter?: number;
  }) => {
    if (!user) {
      throw new Error('user is not available');
    }
    try {
      const data = await user.getAvailableUsers(params);
      return data;
    } catch (error) {
      console.error('커피챗 가능 사용자 목록 조회 실패:', error);
      throw error;
    }
  }, [user]);

  const createCoffeeChatRequest = useCallback(async (payload: CoffeeChatRequestCreate) => {
    if (!user) {
      throw new Error('user is not available');
    }
    try {
      const data = await user.createCoffeeChatRequest(payload);
      return data;
    } catch (error) {
      console.error('커피챗 요청 생성 실패:', error);
      throw error;
    }
  }, [user]);

  const getSentRequests = useCallback(async (params?: {
    page?: number;
    size?: number;
    status_filter?: string;
  }) => {
    if (!user) {
      throw new Error('user is not available');
    }
    try {
      const data = await user.getSentRequests(params);
      return data;
    } catch (error) {
      console.error('보낸 커피챗 요청 목록 조회 실패:', error);
      throw error;
    }
  }, [user]);

  const getReceivedRequests = useCallback(async (params?: {
    page?: number;
    size?: number;
    status_filter?: string;
  }) => {
    if (!user) {
      throw new Error('user is not available');
    }
    try {
      const data = await user.getReceivedRequests(params);
      return data;
    } catch (error) {
      console.error('받은 커피챗 요청 목록 조회 실패:', error);
      throw error;
    }
  }, [user]);

  const respondToRequest = useCallback(async (requestId: number, payload: CoffeeChatResponseRequest) => {
    if (!user) {
      throw new Error('user is not available');
    }
    try {
      const data = await user.respondToRequest(requestId, payload);
      return data;
    } catch (error) {
      console.error('커피챗 요청 응답 실패:', error);
      throw error;
    }
  }, [user]);

  const getContactInfo = useCallback(async (requestId: number) => {
    if (!user) {
      throw new Error('user is not available');
    }
    try {
      const data = await user.getContactInfo(requestId);
      return data;
    } catch (error) {
      console.error('커피챗 연락처 정보 조회 실패:', error);
      throw error;
    }
  }, [user]);

  return {
    // 상태
    publicUsers,
    privateUsers,
    selectedUser,
    myProfile,
    isLoadingPublic,
    isLoadingPrivate,
    isLoadingUser,
    isLoadingProfile,

    // 함수들
    getPublicUsers,
    getPrivateUsers,
    searchUsers,
    getUser,
    getMyProfile,
    updateMyProfile,
    updateUser,
    deleteUser,
    updateUserGrant,
    updateUserStatus,
    getUserProjects,
    getUserPosts,

    // Coffee Chat 함수들
    getAvailableUsers,
    createCoffeeChatRequest,
    getSentRequests,
    getReceivedRequests,
    respondToRequest,
    getContactInfo,

    // 유틸리티
    clearSelectedUser: useCallback(() => setSelectedUser(null), []),
    clearMyProfile: useCallback(() => setMyProfile(null), []),
  };
};
