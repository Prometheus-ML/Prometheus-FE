import { useApi } from '@prometheus-fe/context';
import { useState, useCallback } from 'react';
import type {
  MemberListRequest,
  MemberListResponse,
  MemberSummaryResponse,
  MemberResponse,
  MemberCreateRequest,
  MemberUpdateRequest,
  MemberDeleteResponse,
  BulkMemberCreateRequest,
  BulkMemberCreateResponse,
  BulkMemberUpdateRequest,
  BulkMemberUpdateResponse,
  MemberStatsResponse
} from '@prometheus-fe/types';

export const useMember = () => {
  const { member } = useApi();
  const [allMembers, setAllMembers] = useState<MemberSummaryResponse[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberResponse | null>(null);
  const [memberStats, setMemberStats] = useState<MemberStatsResponse | null>(null);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isLoadingMember, setIsLoadingMember] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // 1. 멤버 목록 조회
  const getMemberList = useCallback(async (params?: MemberListRequest) => {
    if (!member) {
      console.warn('member is not available. Ensure useMember is used within ApiProvider.');
      setIsLoadingMembers(false);
      return { members: [], total: 0, page: 1, size: 20 };
    }
    try {
      setIsLoadingMembers(true);
      const data = await member.getMemberList(params);
      setAllMembers(data.members || []);
      return data;
    } catch (error) {
      console.error('멤버 목록 조회 실패:', error);
      setAllMembers([]);
      throw error;
    } finally {
      setIsLoadingMembers(false);
    }
  }, [member]);

  // 2. 멤버 상세 정보 조회
  const getMember = useCallback(async (memberId: string) => {
    if (!member) {
      throw new Error('member is not available');
    }
    try {
      setIsLoadingMember(true);
      const data = await member.getMember(memberId);
      setSelectedMember(data);
      return data;
    } catch (error) {
      console.error(`멤버 ${memberId} 조회 실패:`, error);
      throw error;
    } finally {
      setIsLoadingMember(false);
    }
  }, [member]);

  // 3. 멤버 생성
  const createMember = useCallback(async (data: MemberCreateRequest) => {
    if (!member) {
      throw new Error('member is not available');
    }
    try {
      const response = await member.createMember(data);
      await getMemberList(); // 목록 갱신
      return response;
    } catch (error) {
      console.error('멤버 생성 실패:', error);
      throw error;
    }
  }, [member, getMemberList]);

  // 4. 멤버 정보 업데이트
  const updateMember = useCallback(async (memberId: string, data: MemberUpdateRequest) => {
    if (!member) {
      throw new Error('member is not available');
    }
    try {
      const response = await member.updateMember(memberId, data);
      if (selectedMember?.id === memberId) {
        setSelectedMember(response);
      }
      await getMemberList(); // 목록 갱신
      return response;
    } catch (error) {
      console.error(`멤버 ${memberId} 수정 실패:`, error);
      throw error;
    }
  }, [member, selectedMember, getMemberList]);

  // 5. 멤버 삭제
  const deleteMember = useCallback(async (memberId: string) => {
    if (!member) {
      throw new Error('member is not available');
    }
    try {
      const response = await member.deleteMember(memberId);
      if (selectedMember?.id === memberId) {
        setSelectedMember(null);
      }
      await getMemberList(); // 목록 갱신
      return response;
    } catch (error) {
      console.error(`멤버 ${memberId} 삭제 실패:`, error);
      throw error;
    }
  }, [member, selectedMember, getMemberList]);

  // 6. 대량 멤버 생성
  const bulkCreateMembers = useCallback(async (data: BulkMemberCreateRequest) => {
    if (!member) {
      throw new Error('member is not available');
    }
    try {
      const response = await member.bulkCreateMembers(data);
      await getMemberList(); // 목록 갱신
      return response;
    } catch (error) {
      console.error('대량 멤버 생성 실패:', error);
      throw error;
    }
  }, [member, getMemberList]);

  // 7. 대량 멤버 업데이트
  const bulkUpdateMembers = useCallback(async (data: BulkMemberUpdateRequest) => {
    if (!member) {
      throw new Error('member is not available');
    }
    try {
      const response = await member.bulkUpdateMembers(data);
      await getMemberList(); // 목록 갱신
      return response;
    } catch (error) {
      console.error('대량 멤버 업데이트 실패:', error);
      throw error;
    }
  }, [member, getMemberList]);

  // 8. 멤버 통계 조회
  const getMemberStats = useCallback(async () => {
    if (!member) {
      console.warn('member is not available. Ensure useMember is used within ApiProvider.');
      return null;
    }
    try {
      setIsLoadingStats(true);
      const data = await member.getMemberStats();
      setMemberStats(data);
      return data;
    } catch (error) {
      console.error('멤버 통계 조회 실패:', error);
      setMemberStats(null);
      throw error;
    } finally {
      setIsLoadingStats(false);
    }
  }, [member]);

  // 멤버 선택 핸들러
  const handleMemberSelect = (member: MemberResponse) => {
    setSelectedMember(member);
  };

  // 멤버 선택 해제 핸들러
  const handleMemberDeselect = () => {
    setSelectedMember(null);
  };

  return {
    // 상태
    members: allMembers,
    selectedMember,
    memberStats,
    isLoadingMembers,
    isLoadingMember,
    isLoadingStats,
    
    // API 함수들
    getMemberList,
    getMember,
    createMember,
    updateMember,
    deleteMember,
    bulkCreateMembers,
    bulkUpdateMembers,
    getMemberStats,
    
    // 핸들러들
    handleMemberSelect,
    handleMemberDeselect,
  };
};
