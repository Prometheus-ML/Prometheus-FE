import { useApi } from '@prometheus-fe/context';
import { useState, useCallback } from 'react';

export function useMember() {
  const { member } = useApi();
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [memberStats, setMemberStats] = useState<any | null>(null);
  const [myProfile, setMyProfile] = useState<any | null>(null);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isLoadingMember, setIsLoadingMember] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // 1. 멤버 목록 조회
  const getMemberList = useCallback(async (params?: any) => {
    if (!member) {
      console.warn('member is not available. Ensure useMember is used within ApiProvider.');
      setIsLoadingMembers(false);
      return { members: [], total: 0, page: 1, size: 21 };
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
  const createMember = useCallback(async (data: any) => {
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
  const updateMember = useCallback(async (memberId: string, data: any) => {
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
  const bulkCreateMembers = useCallback(async (data: any) => {
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
  const bulkUpdateMembers = useCallback(async (data: any) => {
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
  const fetchMemberStats = useCallback(async () => {
    if (!member) {
      console.warn('member is not available. Ensure useMember is used within ApiProvider.');
      return;
    }
    try {
      setIsLoadingStats(true);
      const data = await member.getMemberStats();
      setMemberStats(data);
    } catch (error) {
      console.error('멤버 통계 조회 실패:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, [member]);

  // 9. 내 프로필 조회
  const getMyProfile = useCallback(async () => {
    if (!member) {
      throw new Error('member is not available');
    }
    try {
      setIsLoadingProfile(true);
      const data = await member.me();
      setMyProfile(data);
      return data;
    } catch (error) {
      console.error('내 프로필 조회 실패:', error);
      setMyProfile(null);
      throw error;
    } finally {
      setIsLoadingProfile(false);
    }
  }, [member]);

  // 10. 내 프로필 수정
  const updateMyProfile = useCallback(async (payload: any) => {
    if (!member) {
      throw new Error('member is not available');
    }
    try {
      setIsLoadingProfile(true);
      const data = await member.updateMe(payload);
      setMyProfile(data);
      return data;
    } catch (error) {
      console.error('내 프로필 수정 실패:', error);
      throw error;
    } finally {
      setIsLoadingProfile(false);
    }
  }, [member]);

  // 11. 멤버 검색 (공개)
  const searchMembers = useCallback(async (params?: any) => {
    if (!member) {
      console.warn('member is not available. Ensure useMember is used within ApiProvider.');
      return [];
    }
    try {
      const data = await member.searchMembers(params);
      return data;
    } catch (error) {
      console.error('멤버 검색 실패:', error);
      return [];
    }
  }, [member]);

  // 12. 공개 멤버 목록 조회
  const getPublicMembers = useCallback(async (params?: any) => {
    if (!member) {
      console.warn('member is not available. Ensure useMember is used within ApiProvider.');
      return { members: [], total: 0, page: 1, size: 21 };
    }
    try {
      const data = await member.getPublicMembers(params);
      return data;
    } catch (error) {
      console.error('공개 멤버 목록 조회 실패:', error);
      return { members: [], total: 0, page: 1, size: 21 };
    }
  }, [member]);

  // 13. 인증된 사용자용 멤버 목록 조회
  const getPrivateMembers = useCallback(async (params?: any) => {
    if (!member) {
      console.warn('member is not available. Ensure useMember is used within ApiProvider.');
      return { members: [], total: 0, page: 1, size: 21 };
    }
    try {
      const data = await member.getPrivateMembers(params);
      return data;
    } catch (error) {
      console.error('인증된 사용자용 멤버 목록 조회 실패:', error);
      return { members: [], total: 0, page: 1, size: 21 };
    }
  }, [member]);

  // 14. 멤버 상세 정보 조회 (일반 사용자용)
  const getMemberDetail = useCallback(async (memberId: string) => {
    if (!member) {
      throw new Error('member is not available');
    }
    try {
      const data = await member.getMemberDetail(memberId);
      return data;
    } catch (error) {
      console.error(`멤버 ${memberId} 상세 정보 조회 실패:`, error);
      throw error;
    }
  }, [member]);

  // 15. 멤버 프로젝트 목록 조회
  const getMemberProjects = useCallback(async (memberId: string) => {
    if (!member) {
      throw new Error('member is not available');
    }
    try {
      const data = await member.getMemberProjects(memberId);
      return data;
    } catch (error) {
      console.error(`멤버 ${memberId} 프로젝트 목록 조회 실패:`, error);
      throw error;
    }
  }, [member]);

  // 16. 멤버 게시글 목록 조회
  const getMemberPosts = useCallback(async (memberId: string) => {
    if (!member) {
      throw new Error('member is not available');
    }
    try {
      const data = await member.getMemberPosts(memberId);
      return data;
    } catch (error) {
      console.error(`멤버 ${memberId} 게시글 목록 조회 실패:`, error);
      throw error;
    }
  }, [member]);

  return {
    // 상태
    members: allMembers,
    selectedMember,
    memberStats,
    myProfile,
    isLoadingMembers,
    isLoadingMember,
    isLoadingStats,
    isLoadingProfile,
    
    // API 함수들
    getMemberList,
    getMember,
    createMember,
    updateMember,
    deleteMember,
    bulkCreateMembers,
    bulkUpdateMembers,
    fetchMemberStats,
    getMyProfile,
    updateMyProfile,
    searchMembers,
    getPublicMembers,
    getPrivateMembers,
    getMemberDetail,
    getMemberProjects,
    getMemberPosts,
    
    // 핸들러들
    handleMemberSelect: useCallback((member: any) => setSelectedMember(member), []),
    handleMemberDeselect: useCallback(() => setSelectedMember(null), []),
  };
};
