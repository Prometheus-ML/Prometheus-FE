'use client';

import { useState, useEffect, useMemo } from 'react';
import { useGroup } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';
import GlassCard from '../../src/components/GlassCard';
import RedButton from '../../src/components/RedButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUsers, faEye, faUserPlus, faCheck, faTimes, faSearch, faUndo } from '@fortawesome/free-solid-svg-icons';

const CATEGORIES = [
  { value: 'STUDY', label: '스터디 그룹' },
  { value: 'CASUAL', label: '취미 그룹' },
] as const;

interface GroupFilters {
  search: string;
  category_filter: string;
}

export default function GroupPage() {
  const {
    groups,
    selectedGroup,
    members,
    joinRequests,
    isLoadingGroups,
    isLoadingGroup,
    isLoadingMembers,
    isLoadingJoinRequests,
    isCreatingGroup,
    fetchGroups,
    fetchGroup,
    createGroup,
    requestJoinGroup,
    fetchGroupMembers,
    fetchJoinRequests,
    approveMember,
    rejectMember,
    filterGroupsByCategory,
  } = useGroup();

  const { user } = useAuthStore();
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<GroupFilters>({
    search: '',
    category_filter: ''
  });
  const [appliedFilters, setAppliedFilters] = useState<GroupFilters>({
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

  // 초기 그룹 목록 로드
  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setError('');
      const params = { page: 1, size: 20, ...appliedFilters };
      await fetchGroups(params);
    } catch (err) {
      console.error('그룹 목록 로드 실패:', err);
      setError('그룹 목록을 불러오지 못했습니다.');
    }
  };

  // 검색 및 필터 적용
  const applyFilters = () => {
    setAppliedFilters(filters);
    loadGroups();
  };

  // 필터 초기화
  const clearFilters = () => {
    const emptyFilters: GroupFilters = {
      search: '',
      category_filter: ''
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    loadGroups();
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
      await loadGroups();
    } catch (err) {
      console.error('그룹 생성 실패:', err);
      setError('그룹 생성에 실패했습니다.');
    }
  };

  const handleGroupClick = async (groupId: number) => {
    try {
      await fetchGroup(groupId);
      setSelectedGroupId(groupId);
      setShowGroupDetail(true);
    } catch (err) {
      console.error('그룹 상세 정보 로드 실패:', err);
      setError('그룹 상세 정보를 불러오지 못했습니다.');
    }
  };

  const handleJoinGroup = async (groupId: number) => {
    try {
      await requestJoinGroup(groupId);
      alert('가입 신청이 완료되었습니다.');
    } catch (err) {
      console.error('그룹 가입 신청 실패:', err);
      setError('그룹 가입 신청에 실패했습니다.');
    }
  };

  const handleApproveMember = async (requestId: number) => {
    try {
      const request = joinRequests.find(r => r.id === requestId);
      if (!request || !selectedGroupId) return;
      
      await approveMember(selectedGroupId, request.member_id);
      await fetchJoinRequests(selectedGroupId);
      await fetchGroupMembers(selectedGroupId);
    } catch (err) {
      console.error('멤버 승인 실패:', err);
      setError('멤버 승인에 실패했습니다.');
    }
  };

  const handleRejectMember = async (requestId: number) => {
    try {
      const request = joinRequests.find(r => r.id === requestId);
      if (!request || !selectedGroupId) return;
      
      await rejectMember(selectedGroupId, request.member_id);
      await fetchJoinRequests(selectedGroupId);
    } catch (err) {
      console.error('멤버 거절 실패:', err);
      setError('멤버 거절에 실패했습니다.');
    }
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      STUDY: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      CASUAL: 'bg-green-500/20 text-green-300 border-green-500/30',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  // 검색 결과 수 계산
  const searchResultCount = groups.length;

  return (
    <div className="py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <FontAwesomeIcon icon={faUsers} className="mr-2" />
            그룹
          </h1>
          <p className="text-sm text-gray-300 mt-1">프로메테우스 그룹 목록</p>
        </div>
        
        {user && (
          <RedButton
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center text-sm font-medium"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
            그룹 만들기
          </RedButton>
        )}
      </div>

      {/* 검색 및 필터 */}
      <GlassCard className="p-6 mb-6">
        <div className="flex gap-4 items-end">
          {/* 검색 */}
          <div className="flex-1">
            <input
              id="search"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              type="text"
              placeholder="그룹명, 설명을 검색해보세요!"
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
      </GlassCard>

      {/* 검색 결과 수 */}
      {appliedFilters.search && (
        <div className="mb-4 text-sm text-gray-300">
          검색 결과: {searchResultCount}개
        </div>
      )}

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
            {groups.map((group: any) => (
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
                        멤버 수는 상세보기에서 확인 가능
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
                    {user && user.id !== group.owner_id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinGroup(group.id);
                        }}
                        className="text-green-400 hover:text-green-300 text-sm px-2 py-1 rounded hover:bg-green-500/20 transition-colors"
                      >
                        <FontAwesomeIcon icon={faUserPlus} className="mr-1" />
                        가입신청
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      {/* 빈 상태 */}
      {!isLoadingGroups && groups.length === 0 && (
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center">
            <FontAwesomeIcon icon={faUsers} className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="mt-2 text-sm font-medium text-white">그룹이 없습니다.</h3>
            <p className="mt-1 text-sm text-gray-300">
              {appliedFilters.search ? '검색 결과가 없습니다.' : '아직 등록된 그룹이 없습니다.'}
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
                onClick={() => setShowGroupDetail(false)}
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(selectedGroup.category)}`}>
                  {getCategoryLabel(selectedGroup.category)}
                </span>
              </div>
              
              {selectedGroup.description && (
                <p className="text-gray-300">{selectedGroup.description}</p>
              )}
              
              <div className="text-sm text-gray-300">
                <p>소유자: {selectedGroup.owner_name} ({selectedGroup.owner_gen}기)</p>
                <p>멤버 수: {members.length}명</p>
                {selectedGroup.max_members && (
                  <p>최대 인원: {selectedGroup.max_members}명</p>
                )}
              </div>
            </div>

            {/* 멤버 목록 */}
            {isLoadingMembers ? (
              <div className="mt-6 flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
              </div>
            ) : (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">멤버 목록</h3>
                <div className="space-y-2">
                  {members.map((member: any) => (
                    <div key={member.member_id} className="flex items-center justify-between p-2 bg-white/10 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{member.name}</span>
                        <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded">
                          {member.gen}기
                        </span>
                        <span className="text-gray-300 text-sm">({member.member_id})</span>
                      </div>
                      <span className="text-gray-300 text-sm">역할: {member.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 가입 신청 목록 */}
            {user && user.id === selectedGroup.owner_id && (
              <>
                {isLoadingJoinRequests ? (
                  <div className="mt-6 flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
                  </div>
                ) : (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-3">가입 신청</h3>
                    <div className="space-y-2">
                      {joinRequests.map((request: any) => (
                        <div key={request.id} className="flex items-center justify-between p-2 bg-white/10 rounded">
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">{request.name}</span>
                            <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded">
                              {request.gen}기
                            </span>
                            <span className="text-gray-300 text-sm">({request.member_id})</span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApproveMember(request.id)}
                              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              <FontAwesomeIcon icon={faCheck} className="mr-1" />
                              승인
                            </button>
                            <button
                              onClick={() => handleRejectMember(request.id)}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              <FontAwesomeIcon icon={faTimes} className="mr-1" />
                              거절
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
