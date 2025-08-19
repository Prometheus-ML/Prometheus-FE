'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@prometheus-fe/stores';
import { useGroup } from '@prometheus-fe/hooks';
import GlassCard from '../../../src/components/GlassCard';
import RedButton from '../../../src/components/RedButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUsers, faUserGraduate, faCheck, faTimes, faEye, faHeart, faSearch, faUndo } from '@fortawesome/free-solid-svg-icons';

const CATEGORIES = [
  { value: 'STUDY', label: '스터디 그룹' },
  { value: 'CASUAL', label: '취미 그룹' },
] as const;

interface GroupFilters {
  search: string;
  category_filter: string;
}

export default function AdminGroupPage() {
  const canAccessManager = useAuthStore((s) => s.canAccessManager);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  const {
    groups,
    selectedGroup,
    members,
    joinRequests,
    groupLikes,
    isLoadingGroups,
    isLoadingGroup,
    isLoadingMembers,
    isLoadingJoinRequests,
    isCreatingGroup,
    fetchGroups,
    fetchGroup,
    createGroup,
    fetchGroupMembers,
    fetchJoinRequests,
    approveMember,
    rejectMember,
    removeMember,
    filterGroupsByCategory,
    fetchGroupLikes,
  } = useGroup();

  // Hydration 완료 상태 관리
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<GroupFilters>({
    search: '',
    category_filter: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [showGroupDetail, setShowGroupDetail] = useState(false);
  const [newGroup, setNewGroup] = useState<any>({
    name: '',
    description: '',
    category: 'STUDY',
    max_members: undefined,
    thumbnail_url: '',
  });

  // Hydration 완료 감지
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 권한 체크 (hydration 완료 후에만)
  useEffect(() => {
    if (!isMounted) return;

    if (!isAuthenticated()) {
      alert('로그인이 필요합니다.');
      window.location.href = '/auth/login';
      return;
    }

    if (!canAccessManager()) {
      alert('관리자가 아닙니다.');
      window.location.href = '/';
      return;
    }
  }, [isMounted, isAuthenticated, canAccessManager]);

  // 초기 그룹 목록 로드
  useEffect(() => {
    if (isMounted && isAuthenticated() && canAccessManager()) {
      loadGroups();
    }
  }, [isMounted, isAuthenticated, canAccessManager]);

  const loadGroups = async () => {
    try {
      setError('');
      await fetchGroups({ page: 1, size: 50 });
    } catch (err) {
      console.error('그룹 목록 로드 실패:', err);
      setError('그룹 목록을 불러오지 못했습니다.');
    }
  };

  // 클라이언트 사이드 필터링
  const filteredGroups = useMemo(() => {
    return groups.filter((group: any) => {
      // 검색어 필터링
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          group.name.toLowerCase().includes(searchLower) ||
          (group.description && group.description.toLowerCase().includes(searchLower)) ||
          group.owner_name.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // 카테고리 필터링
      if (filters.category_filter && group.category !== filters.category_filter) {
        return false;
      }

      return true;
    });
  }, [groups, filters]);

  const handleCategoryFilter = (category: string) => {
    setFilters(prev => ({ ...prev, category_filter: category }));
  };

  // 검색 및 필터 적용
  const applyFilters = () => {
    // 클라이언트 사이드에서만 필터링하므로 별도 API 호출 불필요
    // filters 상태는 이미 filteredGroups에 반영됨
  };

  // 필터 초기화
  const clearFilters = () => {
    const emptyFilters: GroupFilters = {
      search: '',
      category_filter: ''
    };
    setFilters(emptyFilters);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGroup.name.trim()) {
      setError('그룹 이름을 입력해주세요.');
      return;
    }

    try {
      setError('');
      await createGroup(newGroup);
      setNewGroup({
        name: '',
        description: '',
        category: 'STUDY',
        max_members: undefined,
        thumbnail_url: '',
      });
      setShowCreateForm(false);
    } catch (err) {
      console.error('그룹 생성 실패:', err);
      setError('그룹 생성에 실패했습니다.');
    }
  };

  const handleGroupClick = async (groupId: number) => {
    setSelectedGroupId(groupId);
    setShowGroupDetail(true);
    
    try {
      await Promise.all([
        fetchGroup(groupId),
        fetchGroupMembers(groupId),
        fetchJoinRequests(groupId).catch(() => {}),
        fetchGroupLikes(groupId).catch(() => {})
      ]);
    } catch (err) {
      console.error('그룹 상세 정보 로드 실패:', err);
    }
  };

  const handleCloseDetail = () => {
    setShowGroupDetail(false);
    setSelectedGroupId(null);
  };

  const handleApproveMember = async (memberId: string) => {
    if (!selectedGroupId) return;
    
    try {
      await approveMember(selectedGroupId, memberId);
    } catch (err) {
      console.error('멤버 승인 실패:', err);
      setError('멤버 승인에 실패했습니다.');
    }
  };

  const handleRejectMember = async (memberId: string) => {
    if (!selectedGroupId) return;
    
    try {
      await rejectMember(selectedGroupId, memberId);
    } catch (err) {
      console.error('멤버 거절 실패:', err);
      setError('멤버 거절에 실패했습니다.');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedGroupId) return;

    if (!confirm('정말 이 멤버를 그룹에서 제거하시겠습니까?')) {
      return;
    }

    try {
      await removeMember(selectedGroupId, memberId);
    } catch (err) {
      console.error('멤버 제거 실패:', err);
      setError('멤버 제거에 실패했습니다.');
    }
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      STUDY: 'bg-blue-100 text-blue-800',
      CASUAL: 'bg-green-100 text-green-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Hydration이 완료되지 않았거나 권한이 없는 경우
  if (!isMounted || !isAuthenticated() || !canAccessManager()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">
          {!isMounted ? '로딩 중...' : '권한 확인 중...'}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">그룹 관리</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-300">
            총 {filteredGroups.length}개의 그룹
          </div>
          <RedButton
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
            그룹 만들기
          </RedButton>
        </div>
      </div>

      {/* 그룹 생성 폼 */}
      {showCreateForm && (
        <GlassCard className="mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">새 그룹 만들기</h3>
            <form onSubmit={handleCreateGroup}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    그룹 이름
                  </label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup((prev: any) => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white/20 text-black border border-white/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="그룹 이름을 입력하세요"
                    maxLength={200}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    카테고리
                  </label>
                  <select
                    value={newGroup.category}
                    onChange={(e) => setNewGroup((prev: any) => ({ ...prev, category: e.target.value as 'STUDY' | 'CASUAL' }))}
                    className="w-full bg-white/20 text-white border border-white/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    {CATEGORIES.map(category => (
                      <option key={category.value} value={category.value} className="bg-gray-800 text-white">
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-white mb-1">
                  그룹 설명
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup((prev: any) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-white/20 text-black border border-white/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="그룹에 대한 설명을 입력하세요"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-white mb-1">
                  최대 인원
                </label>
                <input
                  type="number"
                  value={newGroup.max_members || ''}
                  onChange={(e) => setNewGroup((prev: any) => ({ 
                    ...prev, 
                    max_members: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className="w-full bg-white/20 text-black border border-white/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="최대 인원 (선택사항)"
                  min="1"
                />
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <RedButton type="submit" disabled={isCreatingGroup}>
                  {isCreatingGroup ? '생성 중...' : '그룹 만들기'}
                </RedButton>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewGroup({
                      name: '',
                      description: '',
                      category: 'STUDY',
                      max_members: undefined,
                      thumbnail_url: '',
                    });
                  }}
                  className="px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </GlassCard>
      )}

      {/* 검색 및 필터 */}
      <GlassCard className="mb-6">
        <div className="p-6">
          <div className="flex gap-4 items-end">
            {/* 검색 */}
            <div className="flex-1">
              <input
                id="search"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                type="text"
                placeholder="그룹명, 설명, 소유자명을 검색해보세요!"
                className="block w-full px-3 py-2 text-sm text-black placeholder-gray-300 focus:outline-none bg-white/20 border border-white/30 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* 카테고리 필터 */}
            <div className="flex-1">
              <select
                id="category"
                value={filters.category_filter}
                onChange={(e) => setFilters(prev => ({ ...prev, category_filter: e.target.value }))}
                className="block w-full px-3 py-2 text-sm bg-white/20 text-white border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="" className="bg-gray-800 text-white">카테고리</option>
                {CATEGORIES.map(category => (
                  <option key={category.value} value={category.value} className="bg-gray-800 text-white">
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 필터 초기화 버튼 */}
            <RedButton onClick={clearFilters} className="inline-flex items-center">
              <FontAwesomeIcon icon={faUndo} className="mr-2 h-4 w-4" />
              초기화
            </RedButton>

            {/* 검색 버튼 */}
            <RedButton onClick={applyFilters} className="inline-flex items-center">
              <FontAwesomeIcon icon={faSearch} className="mr-2 h-4 w-4" />
              검색
            </RedButton>
          </div>
        </div>
      </GlassCard>



      {/* 검색 결과 수 */}
      {filters.search && (
        <div className="mb-4 text-sm text-gray-300">
          검색 결과: {filteredGroups.length}개
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-400">
          {error}
        </div>
      )}

      {/* 그룹 목록 */}
      {isLoadingGroups ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
        </div>
      ) : (
        <GlassCard className="overflow-hidden">
          <ul className="divide-y divide-white/10">
            {filteredGroups.map((group: any) => (
              <li 
                key={group.id} 
                className="px-4 py-4 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-b-0"
                onClick={() => handleGroupClick(group.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{group.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(group.category)}`}>
                        {getCategoryLabel(group.category)}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-300">
                        {group.owner_gen}기 {group.owner_name}
                      </span>
                    </div>
                    {group.description && (
                      <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                        {group.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                      <span className="flex items-center">
                        <FontAwesomeIcon icon={faUsers} className="mr-1" />
                        멤버: {group.member_count || 0}명
                      </span>
                      <span className="flex items-center">
                        <FontAwesomeIcon icon={faHeart} className="mr-1" />
                        좋아요: {group.like_count || 0}개
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGroupClick(group.id);
                      }}
                      className="text-blue-400 hover:text-blue-300 text-sm px-2 py-1 rounded hover:bg-blue-500/20 transition-colors"
                    >
                      <FontAwesomeIcon icon={faEye} className="mr-1" />
                      상세보기
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      {!isLoadingGroups && filteredGroups.length === 0 && (
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-white">그룹이 없습니다.</h3>
            <p className="mt-1 text-sm text-gray-300">
              {filters.search ? '검색 결과가 없습니다.' : '아직 등록된 그룹이 없습니다.'}
            </p>
          </div>
        </div>
      )}

      {/* 그룹 상세 모달 */}
      {showGroupDetail && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{selectedGroup.name}</h2>
              <button
                onClick={handleCloseDetail}
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(selectedGroup.category)}`}>
                {getCategoryLabel(selectedGroup.category)}
              </span>
            </div>
            
            {selectedGroup.description && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-white">설명</h3>
                <p className="text-gray-300">{selectedGroup.description}</p>
              </div>
            )}
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-white">멤버 ({members.length}명)</h3>
              {isLoadingMembers ? (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
                </div>
              ) : (
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.member_id} className="flex items-center justify-between p-2 bg-white/10 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{member.name}</span>
                        <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded">
                          {member.gen}기
                        </span>
                        <span className="text-gray-300 text-sm">({member.member_id})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          member.role === 'owner' 
                            ? 'bg-yellow-500/20 text-yellow-300' 
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {member.role === 'owner' ? '소유자' : '멤버'}
                        </span>
                        {/* 소유자가 아닌 멤버만 제거 가능 */}
                        {member.role !== 'owner' && (
                          <button
                            onClick={() => handleRemoveMember(member.member_id)}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            <FontAwesomeIcon icon={faTimes} className="mr-1" />
                            제거
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 좋아요 정보 */}
            {groupLikes[selectedGroup.id] && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-white">
                  좋아요 ({groupLikes[selectedGroup.id].like_count}개)
                </h3>
                <div className="space-y-2">
                  {groupLikes[selectedGroup.id].recent_likers.slice(0, 5).map((liker, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-white/10 rounded">
                      <span className="text-white font-medium">{liker.name}</span>
                      <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded">
                        {liker.gen}기
                      </span>
                      <span className="text-gray-300 text-sm">({liker.member_id})</span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {new Date(liker.liked_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 가입 요청 관리 */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-white">가입 요청 ({joinRequests.length}개)</h3>
              {isLoadingJoinRequests ? (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
                </div>
              ) : joinRequests.length === 0 ? (
                <div className="text-gray-300">가입 요청이 없습니다.</div>
              ) : (
                <div className="space-y-2">
                  {joinRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-2 bg-white/10 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{request.name}</span>
                        <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded">
                          {request.gen}기
                        </span>
                        <span className="text-gray-300 text-sm">({request.member_id})</span>
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleApproveMember(request.member_id)}
                          className="px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700 transition-colors"
                        >
                          <FontAwesomeIcon icon={faCheck} className="mr-1" />
                          승인
                        </button>
                        <button
                          onClick={() => handleRejectMember(request.member_id)}
                          className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                        >
                          <FontAwesomeIcon icon={faTimes} className="mr-1" />
                          거절
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
