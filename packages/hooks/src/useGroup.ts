import { useApi } from '@prometheus-fe/context';
import { 
  GroupResponse, 
  GroupCreateRequest, 
  GroupMemberResponse, 
  GroupJoinRequestResponse,
  GroupNoteCreateRequest,
  GroupNoteCreateResponse 
} from '@prometheus-fe/types';
import { useState, useCallback } from 'react';

export function useGroup() {
  const { group } = useApi();
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupResponse | null>(null);
  const [members, setMembers] = useState<GroupMemberResponse[]>([]);
  const [joinRequests, setJoinRequests] = useState<GroupJoinRequestResponse[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isLoadingGroup, setIsLoadingGroup] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isLoadingJoinRequests, setIsLoadingJoinRequests] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  // 그룹 목록 조회
  const fetchGroups = useCallback(async (params?: { page?: number; size?: number }) => {
    if (!group) {
      console.warn('group is not available. Ensure useGroup is used within ApiProvider.');
      setIsLoadingGroups(false);
      return;
    }
    try {
      setIsLoadingGroups(true);
      const data = await group.listGroups(params);
      setGroups(data || []);
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
  const createGroup = useCallback(async (groupData: GroupCreateRequest) => {
    if (!group) {
      console.warn('group is not available. Ensure useGroup is used within ApiProvider.');
      return null;
    }
    try {
      setIsCreatingGroup(true);
      const newGroup = await group.createGroup(groupData);
      // 새 그룹을 목록에 추가하기 위해 목록을 다시 불러옴
      await fetchGroups();
      return newGroup;
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
      return result;
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

  // 그룹 노트 생성
  const createGroupNote = useCallback(async (groupId: number | string, noteData: GroupNoteCreateRequest) => {
    if (!group) {
      console.warn('group is not available. Ensure useGroup is used within ApiProvider.');
      return null;
    }
    try {
      setIsCreatingNote(true);
      const newNote = await group.createGroupNote(groupId, noteData);
      return newNote;
    } catch (error) {
      console.error('그룹 노트 생성 실패:', error);
      throw error;
    } finally {
      setIsCreatingNote(false);
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

  return {
    // 상태
    groups,
    selectedGroup,
    members,
    joinRequests,
    isLoadingGroups,
    isLoadingGroup,
    isLoadingMembers,
    isLoadingJoinRequests,
    isCreatingGroup,
    isCreatingNote,
    
    // 액션
    fetchGroups,
    fetchGroup,
    createGroup,
    requestJoinGroup,
    fetchGroupMembers,
    fetchJoinRequests,
    approveMember,
    rejectMember,
    createGroupNote,
    filterGroupsByCategory,
    
    // 유틸리티
    clearGroups,
    clearSelectedGroup,
    clearMembers,
    clearJoinRequests,
  };
}
