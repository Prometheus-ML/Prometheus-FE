'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useGroup } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';
import GlassCard from '../../src/components/GlassCard';
import GroupModal from '../../src/components/GroupModal';
import RedButton from '../../src/components/RedButton';
import QueryBar from '../../src/components/QueryBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUsers, faEye, faUserPlus, faCheck, faTimes, faSearch, faUndo, faHeart, faHeartBroken, faArrowLeft, faImage, faClock, faTrash, faCircle } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

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
    isLoadingGroups,
    fetchGroups,
    requestJoinGroup,
    filterGroupsByCategory,
    toggleGroupLike,
    handleGroupSelect,
  } = useGroup();

  const { user } = useAuthStore();

  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<GroupFilters>({
    search: '',
    category_filter: ''
  });
  const [showGroupDetail, setShowGroupDetail] = useState(false);

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

  // 초기 로딩 및 필터 변경 시 목록 다시 로드
  useEffect(() => {
    loadGroups();
  }, [filters.search, filters.category_filter]);

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

  const handleGroupClick = async (groupId: number) => {
    try {
      // 그룹을 선택된 그룹으로 설정
      const group = groups.find(g => g.id === groupId);
      if (group) {
        handleGroupSelect(group);
        setShowGroupDetail(true);
      }
    } catch (err) {
      console.error('그룹 선택 실패:', err);
      setError('그룹을 선택할 수 없습니다.');
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

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-400">
          {error}
        </div>
      )}

      {/* 그룹 목록 */}
      {isLoadingGroups ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white/10 rounded-lg p-4 border border-white/20 animate-pulse">
              <div className="space-y-3">
                {/* 썸네일 */}
                <div className="w-full h-32 bg-gray-600 rounded-lg"></div>
                
                {/* 제목과 기수 */}
                <div className="flex items-center gap-2">
                  <div className="w-24 h-6 bg-gray-600 rounded flex-1"></div>
                  <div className="w-16 h-5 bg-gray-600 rounded-full"></div>
                </div>

                {/* 카테고리와 상태 */}
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-5 bg-gray-600 rounded"></div>
                  <div className="w-12 h-5 bg-gray-600 rounded"></div>
                </div>

                {/* 설명 */}
                <div className="h-10">
                  <div className="w-full h-4 bg-gray-600 rounded mb-2"></div>
                  <div className="w-3/4 h-4 bg-gray-600 rounded"></div>
                </div>

                {/* 통계 정보 */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-4 bg-gray-600 rounded"></div>
                  <div className="w-12 h-4 bg-gray-600 rounded"></div>
                  <div className="w-16 h-4 bg-gray-600 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group: any) => (
            <div 
              key={group.id}
              className="bg-white/10 rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-colors cursor-pointer group"
              onClick={() => handleGroupClick(group.id)}
            >
              <div className="space-y-3">
                {/* 썸네일 */}
                <div className="w-full h-32 rounded-lg overflow-hidden bg-white/10">
                  {group.thumbnail_url ? (
                    <Image
                      src={group.thumbnail_url}
                      alt={group.name}
                      width={300}
                      height={128}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== group.thumbnail_url && group.thumbnail_url) {
                          target.src = group.thumbnail_url;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faUsers} className="text-white/30 text-4xl" />
                    </div>
                  )}
                </div>
                
                {/* 제목과 기수 */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <FontAwesomeIcon icon={faCircle} className="w-2 h-2 text-[#3FFF4F] flex-shrink-0" />
                    <h3 className="text-lg font-semibold text-white line-clamp-2 flex-1">
                      {group.name}
                    </h3>
                    <span className="px-1.5 py-0.5 text-xs rounded-full font-medium bg-[#8B0000] text-[#ffa282] flex-shrink-0">
                      {group.owner_gen}기
                    </span>
                  </div>
                </div>

                {/* 카테고리와 상태 */}
                <div className="flex items-center space-x-2">
                  <span className="px-1.5 py-0.5 bg-gray-500/20 text-gray-300 text-xs rounded">
                    {group.category === 'STUDY' ? '스터디 그룹' : '취미 그룹'}
                  </span>
                  <span className={`px-1.5 py-0.5 text-xs rounded ${
                    group.deadline ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-[#3FFF4F]'
                  }`}>
                    {group.deadline ? '마감됨' : '진행중'}
                  </span>
                </div>

                {/* 설명 (두 줄 고정) */}
                <div className="h-10">
                  {group.description ? (
                    <p className="text-gray-300 text-sm line-clamp-2">
                      {group.description}
                    </p>
                  ) : (
                    <div className="h-10"></div>
                  )}
                </div>

                {/* 통계 정보 */}
                <div className="space-y-2 text-sm text-white/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <FontAwesomeIcon icon={faUsers} className="mr-1 w-4 h-4" />
                        {group.current_member_count || 0}
                        {group.max_members ? `/${group.max_members}` : ''}명
                      </span>
                      <span className="flex items-center">
                        <FontAwesomeIcon icon={faHeart} className="mr-1 w-4 h-4" />
                        {group.like_count || 0}개
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
                    <span>{group.deadline ? new Date(group.deadline).toLocaleDateString() : '무기한'}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    운영자: {group.owner_name}
                  </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={(e) => handleLikeToggle(group.id, e)}
                    className="flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors text-gray-400 hover:text-gray-300 bg-white/10 hover:bg-white/20"
                  >
                    <FontAwesomeIcon icon={faHeart} className="w-3 h-3" />
                    <span className="text-xs">좋아요</span>
                  </button>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGroupClick(group.id);
                      }}
                      className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded hover:bg-blue-500/20 transition-colors"
                    >
                      <FontAwesomeIcon icon={faEye} className="mr-1 w-3 h-3" />
                      상세보기
                    </button>
                    {user && user.id !== group.owner_id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinGroup(group.id);
                        }}
                        className="text-green-400 hover:text-green-300 text-xs px-2 py-1 rounded hover:bg-green-500/20 transition-colors"
                      >
                        <FontAwesomeIcon icon={faUserPlus} className="mr-1 w-3 h-3" />
                        가입
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 빈 상태 */}
      {!isLoadingGroups && filteredGroups.length === 0 && (
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-white">그룹이 없습니다.</h3>
            <p className="mt-1 text-sm text-gray-300">
                {(filters.search || filters.category_filter) ? '검색 결과가 없습니다.' : '아직 등록된 그룹이 없습니다.'}
            </p>
          </div>
        </div>
      )}

      {/* 그룹 상세 모달 */}
      {showGroupDetail && selectedGroup && (
        <GroupModal
          isOpen={showGroupDetail}
          onClose={() => setShowGroupDetail(false)}
          group={selectedGroup}
        />
      )}
      </div>
    </div>
  );
}
