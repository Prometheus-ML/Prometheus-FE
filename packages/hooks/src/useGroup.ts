import { useApi } from '@prometheus-fe/context';
import { useAuthStore } from '@prometheus-fe/stores';
import { 
  Group,
  GroupMember,
  GroupJoinRequest,
  GroupNote,
  GroupLikeInfo,
} from '@prometheus-fe/types';
import { useState, useCallback } from 'react';

export function useGroup() {
  const { group } = useApi();
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [joinRequests, setJoinRequests] = useState<GroupJoinRequest[]>([]);
  const [groupLikes, setGroupLikes] = useState<Record<number, GroupLikeInfo>>({});
  const [userLikedGroups, setUserLikedGroups] = useState<Record<number, boolean>>({});
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isLoadingGroup, setIsLoadingGroup] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isLoadingJoinRequests, setIsLoadingJoinRequests] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const [isLeavingGroup, setIsLeavingGroup] = useState(false);

  // 사용자가 가입 요청을 볼 수 있는 권한이 있는지 확인
  const canViewJoinRequests = useCallback((group?: Group | null) => {
    if (!user) return false;
    
    const targetGroup = group || selectedGroup;
    if (!targetGroup) return false;

    const isOwner = user.id === targetGroup.owner_id;
    const isSuperUser = user.grant === 'Super';

    return isOwner || isSuperUser;
  }, [user, selectedGroup]);

  // 사용자가 그룹을 삭제할 수 있는 권한이 있는지 확인
  const canDeleteGroup = useCallback((group?: Group | null) => {
    if (!user) return false;
    
    const targetGroup = group || selectedGroup;
    if (!targetGroup) return false;

    // 그룹 소유자만 삭제 가능
    return user.id === targetGroup.owner_id;
  }, [user, selectedGroup]);

  // 그룹 목록 조회
  const fetchGroups = useCallback(async (params?: any) => {
    if (!group) {
      console.warn('group is not available. Ensure useGroup is used within ApiProvider.');
      setIsLoadingGroups(false);
      return;
    }
    try {
      setIsLoadingGroups(true);
      const data = await group.listGroups(params);
      setGroups(data || []);
      console.log('groups data:', data);
    } catch (error) {
      console.error('그룹 목록 조회 실패:', error);
      setGroups([]);
    } finally {
      setIsLoadingGroups(false);
    }
  }, [group]);

  // 개별 그룹 조회
  const fetchGroup = useCallback(async (groupId: number | string) => {
    if (!group) {
      console.warn('group is not available. Ensure useGroup is used within ApiProvider.');
      return;
    }
    try {
      setIsLoadingGroup(true);
      const data = await group.getGroup(groupId);
      setSelectedGroup(data);
      return data;
    } catch (error) {
      console.error(`그룹 ${groupId} 조회 실패:`, error);
      throw error;
    } finally {
      setIsLoadingGroup(false);
    }
  }, [group]);

  // 그룹 생성 (관리자 전용)
  const createGroup = useCallback(async (groupData: {
    name: string;
    description?: string;
    category: 'STUDY' | 'CASUAL';
    max_members?: number;
    thumbnail_url?: string;
    deadline?: string;
  }) => {
    if (!group) {
      console.warn('group is not available. Ensure useGroup is used within ApiProvider.');
      return;
    }
    try {
      setIsCreatingGroup(true);
      await group.createGroup(groupData);
      // 새 그룹을 목록에 추가하기 위해 목록을 다시 불러옴
      await fetchGroups();
    } catch (error) {
      console.error('그룹 생성 실패:', error);
      throw error;
    } finally {
      setIsCreatingGroup(false);
    }
  }, [group, fetchGroups]);

  // 그룹 멤버 목록 조회
  const fetchGroupMembers = useCallback(async (groupId: number | string) => {
    if (!group) {
      console.warn('group is not available. Ensure useGroup is used within ApiProvider.');
      return;
    }
    try {
      setIsLoadingMembers(true);
      const data = await group.listGroupMembers(groupId);
      setMembers(data || []);
    } catch (error) {
      console.error(`그룹 ${groupId} 멤버 목록 조회 실패:`, error);
      setMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  }, [group]);

  // 가입 요청 목록 조회 (관리자 전용)
  const fetchJoinRequests = useCallback(async (groupId: number | string) => {
    if (!group) {
      console.warn('group is not available. Ensure useGroup is used within ApiProvider.');
      return;
    }

    try {
      setIsLoadingJoinRequests(true);
      const data = await group.listJoinRequestsAdmin(groupId);
      setJoinRequests(data || []);
    } catch (error) {
      console.error(`그룹 ${groupId} 가입 요청 목록 조회 실패:`, error);
      setJoinRequests([]);
    } finally {
      setIsLoadingJoinRequests(false);
    }
  }, [group]);

  // 멤버 승인 (관리자 전용)
  const approveMember = useCallback(async (groupId: number | string, memberId: string) => {
    if (!group) {
      console.warn('group is not available. Ensure useGroup is used within ApiProvider.');
      return;
    }
    try {
      await group.approveMemberAdmin(groupId, memberId);
      // 가입 요청 목록과 멤버 목록을 다시 불러옴
      await Promise.all([
        fetchJoinRequests(groupId),
        fetchGroupMembers(groupId)
      ]);
    } catch (error) {
      console.error(`멤버 ${memberId} 승인 실패:`, error);
      throw error;
    }
  }, [group, fetchJoinRequests, fetchGroupMembers]);

  // 멤버 거절 (관리자 전용)
  const rejectMember = useCallback(async (groupId: number | string, memberId: string) => {
    if (!group) {
      console.warn('group is not available. Ensure useGroup is used within ApiProvider.');
      return;
    }
    try {
      await group.rejectMemberAdmin(groupId, memberId);
      // 가입 요청 목록을 다시 불러옴
      await fetchJoinRequests(groupId);
    } catch (error) {
      console.error(`멤버 ${memberId} 거절 실패:`, error);
      throw error;
    }
  }, [group, fetchJoinRequests]);

  // 그룹에서 멤버 제거 (관리자 전용)
  const removeMember = useCallback(async (groupId: number | string, memberId: string) => {
    if (!group) {
      console.warn('group is not available. Ensure useGroup is used within ApiProvider.');
      return;
    }
    try {
      await group.removeMemberAdmin(groupId, memberId);
      // 멤버 목록을 다시 불러옴
      await fetchGroupMembers(groupId);
    } catch (error) {
      console.error(`멤버 ${memberId} 제거 실패:`, error);
      throw error;
    }
  }, [group, fetchGroupMembers]);

  // 그룹 삭제 (관리자 전용)
  const deleteGroup = useCallback(async (groupId: number | string) => {
    if (!group) {
      console.warn('group is not available. Ensure useGroup is used within ApiProvider.');
      return;
    }
    try {
      setIsDeletingGroup(true);
      await group.deleteGroupAdmin(groupId);
      
      // 삭제된 그룹을 목록에서 제거
      setGroups(prev => prev.filter(g => g.id !== groupId));
      
      // 현재 선택된 그룹이 삭제된 그룹인 경우 선택 해제
      if (selectedGroup && selectedGroup.id === groupId) {
        handleGroupDeselect();
      }
    } catch (error) {
      console.error(`그룹 ${groupId} 삭제 실패:`, error);
      throw error;
    } finally {
      setIsDeletingGroup(false);
    }
  }, [group, selectedGroup]);

  // 그룹 좋아요 토글
  const toggleGroupLike = useCallback(async (groupId: number | string) => {
    if (!group) {
      console.warn('group is not available. Ensure useGroup is used within ApiProvider.');
      return;
    }
    try {
      setIsTogglingLike(true);
      const result = await group.toggleGroupLike(groupId);
      
      // 좋아요 상태 업데이트
      setUserLikedGroups(prev => ({
        ...prev,
        [groupId]: result.liked
      }));

      // 그룹 목록의 좋아요 개수 업데이트
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, like_count: result.like_count }
          : g
      ));

      // 선택된 그룹의 좋아요 개수 업데이트
      if (selectedGroup && selectedGroup.id === groupId) {
        setSelectedGroup(prev => prev ? { ...prev, like_count: result.like_count } : null);
      }
    } catch (error) {
      console.error(`그룹 ${groupId} 좋아요 토글 실패:`, error);
      throw error;
    } finally {
      setIsTogglingLike(false);
    }
  }, [group, selectedGroup]);

  // 그룹 좋아요 정보 조회
  const fetchGroupLikes = useCallback(async (groupId: number | string) => {
    if (!group) {
      console.warn('group is not available. Ensure useGroup is used within ApiProvider.');
      return;
    }
    try {
      const likes = await group.getGroupLikes(groupId);
      setGroupLikes(prev => ({
        ...prev,
        [groupId]: likes
      }));
    } catch (error) {
      console.error(`그룹 ${groupId} 좋아요 정보 조회 실패:`, error);
    }
  }, [group]);

  // 사용자 좋아요 여부 확인
  const checkUserLikedGroup = useCallback(async (groupId: number | string) => {
    if (!group) {
      console.warn('group is not available. Ensure useGroup is used within ApiProvider.');
      return;
    }
    try {
      const liked = await group.checkUserLikedGroup(groupId);
      setUserLikedGroups(prev => ({
        ...prev,
        [groupId]: liked
      }));
    } catch (error) {
      console.error(`그룹 ${groupId} 사용자 좋아요 상태 확인 실패:`, error);
    }
  }, [group]);

  // 그룹 가입 요청
  const requestJoinGroup = useCallback(async (groupId: number | string) => {
    if (!group) {
      console.warn('group is not available. Ensure useGroup is used within ApiProvider.');
      return;
    }
    try {
      await group.requestJoinGroup(groupId);
    } catch (error) {
      console.error(`그룹 ${groupId} 가입 요청 실패:`, error);
      throw error;
    }
  }, [group]);

  // 카테고리별 그룹 필터링
  const filterGroupsByCategory = useCallback((category?: 'STUDY' | 'CASUAL') => {
    if (category) {
      const filtered = groups.filter(g => g.category === category);
      setGroups(filtered);
    } else {
      fetchGroups();
    }
  }, [groups, fetchGroups]);

  // 상태 초기화
  const clearGroups = useCallback(() => {
    setGroups([]);
  }, []);

  const clearSelectedGroup = useCallback(() => {
    setSelectedGroup(null);
  }, []);

  const clearMembers = useCallback(() => {
    setMembers([]);
  }, []);

  const clearJoinRequests = useCallback(() => {
    setJoinRequests([]);
  }, []);

  // 그룹 선택 핸들러
  const handleGroupSelect = useCallback(async (group: Group) => {
    setSelectedGroup(group);
  }, []);

  // 그룹 선택 해제 핸들러
  const handleGroupDeselect = () => {
    setSelectedGroup(null);
    setMembers([]);
    setJoinRequests([]);
  };

  return {
    // 상태
    groups,
    selectedGroup,
    members,
    joinRequests,
    groupLikes,
    userLikedGroups,
    isLoadingGroups,
    isLoadingGroup,
    isLoadingMembers,
    isLoadingJoinRequests,
    isCreatingGroup,
    isCreatingNote,
    isTogglingLike,
    isDeletingGroup,
    isLeavingGroup,
    
    // API 함수들
    fetchGroups,
    fetchGroup,
    createGroup,
    fetchGroupMembers,
    fetchJoinRequests,
    approveMember,
    rejectMember,
    removeMember,
    deleteGroup,
    toggleGroupLike,
    fetchGroupLikes,
    checkUserLikedGroup,
    requestJoinGroup,
    filterGroupsByCategory,
    
    // 핸들러들
    handleGroupSelect,
    handleGroupDeselect,
    
    // 유틸리티
    clearGroups,
    clearSelectedGroup,
    clearMembers,
    clearJoinRequests,
    canViewJoinRequests,
    canDeleteGroup,
  };
}
