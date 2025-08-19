import { useApi } from '@prometheus-fe/context';
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
      // 백엔드에서 배열을 직접 반환하는 경우 처리
      if (Array.isArray(data)) {
        setGroups(data);
      } else {
        setGroups(data.items || []);
      }
      console.log('groups data:', data);
    } catch (error) {
      console.error('그룹 목록 조회 실패:', error);
      setGroups([]);
    } finally {
      setIsLoadingGroups(false);
    }
  }, [group]);

  // 특정 그룹 조회
  const fetchGroup = useCallback(async (groupId: number | string) => {
    if (!group) {
      console.warn('group is not available. Ensure useGroup is used within ApiProvider.');
      return;
    }
    try {
      setIsLoadingGroup(true);
      const data = await group.getGroup(groupId);
      setSelectedGroup(data);
    } catch (error) {
      console.error(`그룹 ${groupId} 조회 실패:`, error);
      setSelectedGroup(null);
    } finally {
      setIsLoadingGroup(false);
    }
  }, [group]);

  // 그룹 생성
  const createGroup = useCallback(async (groupData: any) => {
    if (!group) {
      console.warn('group is not available. Ensure useGroup is used within ApiProvider.');
      return null;
    }
    try {
      setIsCreatingGroup(true);
      const newGroup = await group.createGroup(groupData);
      // 새 그룹을 목록에 추가하기 위해 목록을 다시 불러옴
      await fetchGroups();
    } catch (error) {
      console.error('그룹 생성 실패:', error);
      throw error;
    } finally {
      setIsCreatingGroup(false);
    }
  }, [group, fetchGroups]);

  // 그룹 가입 요청
  const requestJoinGroup = useCallback(async (groupId: number | string) => {
    if (!group) {
      console.warn('group is not available. Ensure useGroup is used within ApiProvider.');
      return null;
    }
    try {
      const result = await group.requestJoinGroup(groupId);
    } catch (error) {
      console.error(`그룹 ${groupId} 가입 요청 실패:`, error);
      throw error;
    }
  }, [group]);

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

  // 가입 요청 목록 조회
  const fetchJoinRequests = useCallback(async (groupId: number | string) => {
    if (!group) {
      console.warn('group is not available. Ensure useGroup is used within ApiProvider.');
      return;
    }
    try {
      setIsLoadingJoinRequests(true);
      const data = await group.listJoinRequests(groupId);
      setJoinRequests(data || []);
    } catch (error) {
      console.error(`그룹 ${groupId} 가입 요청 목록 조회 실패:`, error);
      setJoinRequests([]);
    } finally {
      setIsLoadingJoinRequests(false);
    }
  }, [group]);

  // 멤버 승인
  const approveMember = useCallback(async (groupId: number | string, memberId: string) => {
    if (!group) {
      console.warn('group is not available. Ensure useGroup is used within ApiProvider.');
      return;
    }
    try {
      await group.approveMember(groupId, memberId);
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

  // 멤버 거절
  const rejectMember = useCallback(async (groupId: number | string, memberId: string) => {
    if (!group) {
      console.warn('group is not available. Ensure useGroup is used within ApiProvider.');
      return;
    }
    try {
      await group.rejectMember(groupId, memberId);
      // 가입 요청 목록을 다시 불러옴
      await fetchJoinRequests(groupId);
    } catch (error) {
      console.error(`멤버 ${memberId} 거절 실패:`, error);
      throw error;
    }
  }, [group, fetchJoinRequests]);

  // 그룹에서 멤버 제거
  const removeMember = useCallback(async (groupId: number | string, memberId: string) => {
    if (!group) {
      console.warn('group is not available. Ensure useGroup is used within ApiProvider.');
      return;
    }
    try {
      await group.removeMember(groupId, memberId);
      // 멤버 목록을 다시 불러옴
      await fetchGroupMembers(groupId);
    } catch (error) {
      console.error(`멤버 ${memberId} 제거 실패:`, error);
      throw error;
    }
  }, [group, fetchGroupMembers]);

  // 그룹 노트 생성
  const createGroupNote = useCallback(async (groupId: number | string, noteData: any) => {
    if (!group) {
      console.warn('group is not available. Ensure useGroup is used within ApiProvider.');
      return null;
    }
    try {
      setIsCreatingNote(true);
      const newNote = await group.createGroupNote(groupId, noteData);
    } catch (error) {
      console.error('그룹 노트 생성 실패:', error);
      throw error;
    } finally {
      setIsCreatingNote(false);
    }
  }, [group]);

  // 그룹 좋아요 토글
  const toggleGroupLike = useCallback(async (groupId: number | string) => {
    if (!group) {
      console.warn('group is not available. Ensure useGroup is used within ApiProvider.');
      return null;
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

      return result;
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
      return liked;
    } catch (error) {
      console.error(`그룹 ${groupId} 사용자 좋아요 상태 확인 실패:`, error);
      return false;
    }
  }, [group]);

  // 카테고리별 그룹 필터링
  const filterGroupsByCategory = useCallback((category?: 'STUDY' | 'CASUAL') => {
    if (category) {
      const filtered = groups.filter(g => g.category === category);
      setGroups(filtered);
    } else {
      fetchGroups({ page: 1, size: 20 });
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
  const handleGroupSelect = (selectedGroup: Group) => {
    setSelectedGroup(selectedGroup);
  };

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
    
    // API 함수들
    fetchGroups,
    fetchGroup,
    createGroup,
    requestJoinGroup,
    fetchGroupMembers,
    fetchJoinRequests,
    approveMember,
    rejectMember,
    removeMember,
    createGroupNote,
    toggleGroupLike,
    fetchGroupLikes,
    checkUserLikedGroup,
    filterGroupsByCategory,
    
    // 핸들러들
    handleGroupSelect,
    handleGroupDeselect,
    
    // 유틸리티
    clearGroups,
    clearSelectedGroup,
    clearMembers,
    clearJoinRequests,
  };
}
