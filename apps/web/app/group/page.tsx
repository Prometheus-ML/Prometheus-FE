'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useGroup } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';
import GlassCard from '../../src/components/GlassCard';
import RedButton from '../../src/components/RedButton';
import QueryBar from '../../src/components/QueryBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUsers, faEye, faUserPlus, faCheck, faTimes, faSearch, faUndo, faHeart, faHeartBroken, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const CATEGORIES = [
  { value: 'STUDY', label: '스터디 그룹' },
  { value: 'CASUAL', label: '취미 그룹' },
] as const;

// 탭 아이템 정의
const TAB_ITEMS = [
  { id: 'all', label: '전체' },
  { id: 'STUDY', label: '스터디 그룹' },
  { id: 'CASUAL', label: '취미 그룹' },
];

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
    groupLikes,
    userLikedGroups,
    isLoadingGroups,
    isLoadingGroup,
    isLoadingMembers,
    isLoadingJoinRequests,
    isCreatingGroup,
    isTogglingLike,
    fetchGroups,
    fetchGroup,
    createGroup,
    requestJoinGroup,
    fetchGroupMembers,
    fetchJoinRequests,
    approveMember,
    rejectMember,
    removeMember,
    filterGroupsByCategory,
    toggleGroupLike,
    fetchGroupLikes,
    checkUserLikedGroup,
    canViewJoinRequests,
  } = useGroup();

  const { user } = useAuthStore();
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
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

  // 탭 변경 핸들러 (기존 필터에 추가하고 바로 검색 실행)
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const category = tabId === 'all' ? '' : tabId;
    const newFilters = {
      ...filters,
      category_filter: category
    };
    setFilters(newFilters);
  };

  // 초기 그룹 목록 로드
  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setError('');
      await fetchGroups({ page: 1, size: 50 });
    } catch (err) {
      console.error('그룹 목록 로드 실패:', err);
      setError('그룹 목록을 불러오지 못했습니다.');
    }
  };

  // 그룹 목록이 로드된 후 사용자의 좋아요 상태 확인
  useEffect(() => {
    if (groups.length > 0 && user) {
      const checkAllGroupLikes = async () => {
        const likeChecks = groups.map(group => checkUserLikedGroup(group.id).catch(() => false));
        await Promise.all(likeChecks);
      };
      checkAllGroupLikes();
    }
  }, [groups, user, checkUserLikedGroup]);

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
    setActiveTab('all');
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
      // 기본적으로 모든 사용자가 볼 수 있는 정보들
      await Promise.all([
        fetchGroup(groupId),
        fetchGroupMembers(groupId),
        fetchGroupLikes(groupId).catch(() => {}),
        checkUserLikedGroup(groupId).catch(() => {})
      ]);

      // 권한이 있는 경우에만 가입 요청 목록 조회
      // fetchJoinRequests 내부에서 권한 체크를 수행함
      fetchJoinRequests(groupId).catch(() => {});

      setSelectedGroupId(groupId);
      setShowGroupDetail(true);
    } catch (err) {
      console.error('그룹 상세 정보 로드 실패:', err);
      setError('그룹 상세 정보를 불러오지 못했습니다.');
    }
  };

  const handleLikeToggle = async (groupId: number, e?: React.MouseEvent) => {
    // 이벤트가 있을 때만 stopPropagation 호출 (그룹 목록에서만)
    if (e) {
      e.stopPropagation();
    }
    try {
      await toggleGroupLike(groupId);
    } catch (err) {
      console.error('좋아요 토글 실패:', err);
      setError('좋아요 처리에 실패했습니다.');
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

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedGroupId) return;
    
    if (!confirm('정말 이 멤버를 그룹에서 제거하시겠습니까?')) {
      return;
    }
    
    try {
      await removeMember(selectedGroupId, memberId);
      await fetchGroupMembers(selectedGroupId);
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
      STUDY: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      CASUAL: 'bg-green-500/20 text-green-300 border-green-500/30',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  return (
    <div className="md:max-w-6xl max-w-xl mx-auto min-h-screen font-pretendard">
      {/* 헤더 */}
      <header className="mx-4 px-6 py-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-10 h-10 flex items-center justify-center text-[#FFFFFF] hover:text-[#e0e0e0] transition-colors">
              <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
            </Link>
        <div>
              <h1 className="text-xl font-kimm-bold text-[#FFFFFF]">그룹</h1>
              <p className="text-sm font-pretendard text-[#e0e0e0]">프로메테우스 그룹 목록</p>
            </div>
        </div>
          <div className="text-right">
        {user && (
          <RedButton
            onClick={() => setShowCreateForm(!showCreateForm)}
                className="inline-flex items-center text-sm font-medium mb-2"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
            그룹 만들기
          </RedButton>
        )}
            <p className="text-sm text-[#e0e0e0]">전체 <span className="text-[#ffa282] font-bold">{groups.length}</span>개</p>
          </div>
      </div>
      </header>

      <div className="px-4 py-6">
      {/* 검색 및 필터 */}
        <div className="mb-6 space-y-4">
          <QueryBar
            searchTerm={filters.search}
            onSearchTermChange={(term) => setFilters(prev => ({ ...prev, search: term }))}
            tabs={TAB_ITEMS}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            selects={[
              {
                id: 'category',
                value: filters.category_filter,
                onChange: (value) => setFilters(prev => ({ ...prev, category_filter: value })),
                options: [
                  { value: '', label: '전체 카테고리' },
                  ...CATEGORIES.map(category => ({
                    value: category.value,
                    label: category.label
                  }))
                ]
              }
            ]}
            onSearch={applyFilters}
            onReset={clearFilters}
            isLoading={isLoadingGroups}
              placeholder="그룹명, 설명을 검색해보세요!"
            />
          </div>

      {/* 검색 결과 수 */}
        {(filters.search || filters.category_filter) && (
          <div className="mb-4 text-sm text-[#e0e0e0]">
          검색 결과: {filteredGroups.length}개
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
          <div className="space-y-4">
            {filteredGroups.map((group: any) => (
              <GlassCard 
                key={group.id} 
                className="p-4 hover:bg-white/20 transition-colors cursor-pointer border border-white/20"
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
                      <span className="flex items-center">
                        <FontAwesomeIcon icon={faHeart} className="mr-1" />
                        {group.like_count || 0}개
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {/* 좋아요 버튼 */}
                    <button
                      onClick={(e) => handleLikeToggle(group.id, e)}
                      disabled={isTogglingLike}
                      className={`flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors ${
                        userLikedGroups[group.id]
                          ? 'text-red-400 hover:text-red-300 bg-red-500/20'
                          : 'text-gray-400 hover:text-gray-300 bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <FontAwesomeIcon 
                        icon={userLikedGroups[group.id] ? faHeart : faHeartBroken} 
                        className="mr-1" 
                      />
                      {userLikedGroups[group.id] ? '좋아요' : '좋아요'}
                    </button>
                    
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
              </GlassCard>
            ))}
          </div>
      )}

      {/* 빈 상태 */}
      {!isLoadingGroups && filteredGroups.length === 0 && (
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center">
            <FontAwesomeIcon icon={faUsers} className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="mt-2 text-sm font-medium text-white">그룹이 없습니다.</h3>
            <p className="mt-1 text-sm text-gray-300">
                {(filters.search || filters.category_filter) ? '검색 결과가 없습니다.' : '아직 등록된 그룹이 없습니다.'}
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
                <p>소유자: {selectedGroup.owner_gen}기 {selectedGroup.owner_name}</p>
                <p>멤버 수: {members.length}명</p>
                {selectedGroup.max_members && (
                  <p>최대 인원: {selectedGroup.max_members}명</p>
                )}
                <p>좋아요: {selectedGroup.like_count || 0}개</p>
              </div>

              {/* 좋아요 버튼 */}
              <div className="mt-4">
                <button
                  onClick={(e) => handleLikeToggle(selectedGroup.id, e)}
                  disabled={isTogglingLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    userLikedGroups[selectedGroup.id]
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                      : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
                  }`}
                >
                  <FontAwesomeIcon 
                    icon={userLikedGroups[selectedGroup.id] ? faHeart : faHeartBroken} 
                    className="mr-2" 
                  />
                  <span>
                    {userLikedGroups[selectedGroup.id] ? '좋아요 취소' : '좋아요'}
                  </span>
                </button>
              </div>

              {/* 좋아요한 멤버 목록 */}
              {groupLikes[selectedGroup.id] && groupLikes[selectedGroup.id].recent_likers.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-white mb-3">최근 좋아요한 멤버</h3>
                  <div className="space-y-2">
                    {groupLikes[selectedGroup.id].recent_likers.slice(0, 5).map((liker, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-white/10 rounded">
                        <span className="text-white font-medium">{liker.name}</span>
                        <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded">
                          {liker.gen}기
                        </span>
                        <span className="text-gray-300 text-sm">({liker.member_id})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                        <span className={`px-2 py-1 text-xs rounded ${
                          member.role === 'owner' 
                            ? 'bg-yellow-500/20 text-yellow-300' 
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {member.role === 'owner' ? '소유자' : '멤버'}
                        </span>
                      </div>
                      {/* 소유자가 아닌 멤버만 제거 가능 */}
                      {user && user.id === selectedGroup.owner_id && member.role !== 'owner' && (
                        <button
                          onClick={() => handleRemoveMember(member.member_id)}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          <FontAwesomeIcon icon={faTimes} className="mr-1" />
                          제거
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 가입 신청 목록 */}
            {canViewJoinRequests(selectedGroup) && (
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
    </div>
  );
}
