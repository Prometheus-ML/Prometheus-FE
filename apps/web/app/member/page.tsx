'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@prometheus-fe/stores';
import { useImage, useMember } from '@prometheus-fe/hooks';
import GlassCard from '@/src/components/GlassCard';
import RedButton from '@/src/components/RedButton';
import ProfileModal from '@/src/components/member/ProfileModal';
import QueryBar from '@/src/components/QueryBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faCoffee, 
  faCircle,
} from '@fortawesome/free-solid-svg-icons';

import { 
  MemberDetailResponse,
  MemberPublicListItem,
  MemberPrivateListItem
} from '@prometheus-fe/types';

export default function MemberPage() {
  const { user } = useAuthStore();
  const { getPublicMembers, getPrivateMembers, getMemberDetail, isLoadingMembers, isLoadingMember } = useMember();
  const { getThumbnailUrl } = useImage();

  // 상태 관리
  const [members, setMembers] = useState<(MemberPublicListItem | MemberPrivateListItem)[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalAll, setTotalAll] = useState<number>(0); // 전체 멤버 수 (필터링과 무관)
  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(21);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // 검색 상태
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGen, setSelectedGen] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [appliedSearchTerm, setAppliedSearchTerm] = useState<string>('');
  const [appliedGen, setAppliedGen] = useState<string>('all');
  const [appliedStatus, setAppliedStatus] = useState<string>('all');

  // 모달 상태
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<MemberDetailResponse | null>(null);

  // 계산된 값들
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / size)), [total, size]);
  const isPrivate = useMemo(() => !!user, [user]);
  
  // 현재 기수 계산 (2022년 3월부터 6개월 단위)
  const getCurrentGen = useCallback(() => {
    const startDate = new Date('2022-03-01');
    const now = new Date();
    const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
    return Math.floor(monthsDiff / 6) + 1;
  }, []);
  
  // 기수별 탭 생성
  const genTabs = useMemo(() => {
    const currentGen = getCurrentGen();
    const tabs = [];
    
    // 전체 탭 추가
    tabs.push({
      id: 'all',
      label: '전체'
    });
    
    // 최신 기수부터 1기까지 (내림차순)
    for (let i = currentGen; i >= 1; i--) {
      tabs.push({
        id: i.toString(),
        label: `${i}기`
      });
    }
    
    // 0기(창립멤버) 추가
    tabs.push({
      id: '0',
      label: '창립멤버'
    });
    
    return tabs;
  }, [getCurrentGen]);

  // 유틸리티 함수들
  const getFirstLetter = useCallback((name: string) => {
    return name && name.length ? name.trim().charAt(0) : 'U';
  }, []);

  const handleImageError = useCallback((memberId: string) => {
    setImageErrors(prev => ({ ...prev, [memberId]: true }));
  }, []);

  // 전체 멤버 수 조회 (필터링과 무관)
  const fetchTotalCount = useCallback(async () => {
    try {
      let params: any = { page: 1, size: 1 }; // 최소한의 데이터만 요청
      let response;
      if (isPrivate) {
        response = await getPrivateMembers(params);
      } else {
        response = await getPublicMembers(params);
      }
      setTotalAll(response.total || 0);
    } catch (err) {
      console.error('Failed to fetch total count:', err);
      setTotalAll(0);
    }
  }, [isPrivate, getPublicMembers, getPrivateMembers]);

  // 사용자 목록 조회
  const fetchMembers = useCallback(async (isSearch = false) => {
    try {
      if (isSearch) {
        setIsSearchLoading(true);
      } else {
        setIsLoading(true);
      }
      
      let params: any = {
        page,
        size
      };

      // 검색어 필터 적용
      if (appliedSearchTerm.trim()) {
        params.search = appliedSearchTerm.trim();
      }

      // 기수 필터 적용 (전체가 아닐 때만)
      if (appliedGen !== 'all') {
        params.gen = parseInt(appliedGen);
      }

      // 상태 필터 적용 (전체가 아닐 때만)
      if (appliedStatus !== 'all') {
        params.status = appliedStatus;
      }

      let response;
      if (isPrivate) {
        response = await getPrivateMembers(params);
      } else {
        response = await getPublicMembers(params);
      }

      setMembers(response.members || []);
      setTotal(response.total || 0);
      setImageErrors({});
    } catch (err) {
      console.error('Failed to fetch members:', err);
      setMembers([]);
      setTotal(0);
    } finally {
      if (isSearch) {
        setIsSearchLoading(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [page, size, appliedSearchTerm, appliedGen, appliedStatus, isPrivate, getPublicMembers, getPrivateMembers]);

  // 페이지 이동
  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  }, [page, totalPages]);

  // 카드 클릭 핸들러
  const onCardClick = useCallback(async (member: MemberPublicListItem | MemberPrivateListItem) => {
    if (!isPrivate) return;
    
    // MemberPrivateListItem에만 id가 있음
    if ('id' in member) {
      try {
        const memberDetail = await getMemberDetail(member.id);
        setSelectedMember(memberDetail);
        setShowDetail(true);
      } catch (err) {
        console.error('Failed to get member details:', err);
        alert('사용자 정보를 불러오는 중 오류가 발생했습니다.');
      }
    }
  }, [isPrivate, getMemberDetail]);

  // 모달 닫기
  const closeDetail = useCallback(() => {
    setShowDetail(false);
    setSelectedMember(null);
  }, []);

  // 필터 변경 핸들러
  const handleFilterChange = useCallback((key: string, value: string | number | boolean | null) => {
    // setFilters(prev => ({ ...prev, [key]: value })); // This line was removed
  }, []);

  // 초기 로딩 시 전체 멤버 수 조회
  useEffect(() => {
    fetchTotalCount();
  }, [fetchTotalCount]);

  // 초기 로딩 및 페이지 변경 시 목록 다시 로드
  useEffect(() => {
    fetchMembers();
  }, [page, appliedSearchTerm, appliedGen, appliedStatus, fetchMembers]);

  // 검색 핸들러
  const handleSearch = useCallback(() => {
    setAppliedSearchTerm(searchTerm);
    setAppliedGen(selectedGen);
    setAppliedStatus(selectedStatus);
    setPage(1);
    fetchMembers(true);
  }, [searchTerm, selectedGen, selectedStatus, fetchMembers]);

  // 초기화 핸들러
  const handleReset = useCallback(() => {
    setSearchTerm('');
    setSelectedGen('all');
    setSelectedStatus('all');
    setAppliedSearchTerm('');
    setAppliedGen('all');
    setAppliedStatus('all');
    setPage(1);
    fetchMembers(true);
  }, [fetchMembers]);

  // Skeleton UI Component
  const SkeletonCard = () => (
    <div className="p-4 flex flex-col items-center animate-pulse">
      <div className="relative mb-3">
        <div className="w-16 h-16 bg-gray-600 rounded-full"></div>
      </div>
      <div className="w-20 h-5 bg-gray-600 rounded mb-2"></div>
      <div className="w-32 h-4 bg-gray-600 rounded"></div>
    </div>
  );

  // Loading state
  if (isLoading && !appliedSearchTerm && appliedGen === 'all' && appliedStatus === 'all') {
  return (
      <div className="md:max-w-6xl max-w-lg mx-auto min-h-screen font-pretendard">
        {/* Header */}
        <header className="mx-4 px-6 py-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.history.back()}
                className="w-10 h-10 flex items-center justify-center text-[#FFFFFF] hover:text-[#e0e0e0] transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-kimm-bold text-[#FFFFFF]">멤버</h1>
                <p className="text-sm font-pretendard text-[#e0e0e0]">프로메테우스 멤버 목록</p>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 py-6">
          {/* Member Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <GlassCard key={index} className="animate-pulse">
                <SkeletonCard />
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="md:max-w-6xl max-w-xl mx-auto min-h-screen font-pretendard">
      {/* 헤더 */}
      <header className="mx-4 px-4 md:px-6 py-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.history.back()}
              className="w-10 h-10 flex items-center justify-center text-[#FFFFFF] hover:text-[#e0e0e0] transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-kimm-bold text-[#FFFFFF]">멤버</h1>
              <p className="text-sm font-pretendard text-[#e0e0e0]">프로메테우스 멤버 목록</p>
            </div>
          </div>
           <div className="text-right">
             <p className="text-sm text-[#e0e0e0]">전체 <span className="text-[#ffa282] font-bold">{totalAll}</span>명</p>
           </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* 검색 및 필터 - 로그인 상태에서만 표시 */}
        {isPrivate && (
          <div className="mb-6 space-y-4">
            {/* 검색 바 */}
            <QueryBar
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              selects={[
                {
                  id: 'gen',
                  value: selectedGen,
                  onChange: setSelectedGen,
                  options: [
                    { value: 'all', label: '전체 기수' },
                    ...Array.from({ length: getCurrentGen() }, (_, i) => getCurrentGen() - i).map(gen => ({
                      value: gen.toString(),
                      label: `${gen}기`
                    })),
                    { value: '0', label: '창립멤버' }
                  ]
                },
                {
                  id: 'status',
                  value: selectedStatus,
                  onChange: setSelectedStatus,
                  options: [
                    { value: 'all', label: '활동 상태' },
                    { value: 'active', label: '활동중' },
                    { value: 'alumni', label: '알럼나이' }
                  ]
                }
              ]}
              onSearch={handleSearch}
              onReset={handleReset}
              isLoading={isSearchLoading}
              placeholder="이름, 학교를 검색해보세요!"
            />
          </div>
        )}
        
        {/* 멤버 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member, index) => (
            <GlassCard
              key={'id' in member ? member.id : index}
              className={`relative p-4 text-center transition-transform duration-200 hover:scale-105 ${
                isPrivate ? 'cursor-pointer' : 'cursor-default'
              }`}
              onClick={() => onCardClick(member)}
            >
                <div className="flex flex-col items-center">
                  <div className="relative mb-3">
                    {member.profile_image_url && !imageErrors['id' in member ? member.id : index] ? (
                      <div className="relative w-16 h-16">
                        <Image
                          src={getThumbnailUrl(member.profile_image_url, 128)}
                          alt={member.name}
                          fill
                          className="rounded-full object-cover"
                          onError={() => handleImageError('id' in member ? member.id : index.toString())}
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#404040] flex items-center justify-center text-[#e0e0e0] font-medium">
                        {getFirstLetter(member.name)}
                      </div>
                    )}
                  </div>
                  
                  {/* 이름 */}
                  <h3 className="text-lg font-semibold text-[#FFFFFF] mb-2">{member.name}</h3>
                  
                  {/* 기수와 커피챗 아이콘 */}
                  <div className="flex items-center gap-2 mb-2">
                    {'gen' in member && (
                      <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium flex items-center gap-1 ${
                        'status' in member && member.status === 'active' 
                          ? 'bg-[#8B0000] text-[#ffa282]' 
                          : 'bg-gray-500/20 text-gray-300'
                      }`}>
                        {'status' in member && member.status === 'active' && (
                          <FontAwesomeIcon icon={faCircle} className="w-1 h-1" />
                        )}
                        {member.gen === 0 ? '창립멤버' : `${member.gen}기`}
                      </span>
                    )}
                    {isPrivate && 'coffee_chat_enabled' in member && member.coffee_chat_enabled && (
                      <div className="w-6 h-6 bg-[#00654D] rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faCoffee} className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* 학력사항 */}
                  <div className="flex flex-wrap gap-0.5 justify-center">
                    {!isPrivate ? (
                      <>
                        {member.school && (
                           <span className="px-0.5 py-0.5 rounded-full text-[#e0e0e0] text-xs">
                             {member.school}
                           </span>
                         )}
                        {member.major && (
                          <span className="py-0.5 rounded-full text-[#e0e0e0] text-xs">
                            {member.major}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        {member.school && (
                           <span className="px-0.5 py-0.5 text-[#e0e0e0] text-xs rounded-full">
                             {member.school}
                           </span>
                         )}
                        {member.major && (
                          <span className="py-0.5 text-[#e0e0e0] text-xs rounded-full">
                            {member.major}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

        {!isLoading && !isSearchLoading && members.length === 0 && (
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-white">멤버가 없습니다.</h3>
            </div>
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center space-x-2">
            <RedButton onClick={prevPage} disabled={page === 1} className="px-3 py-1 text-sm disabled:opacity-50">
              이전
            </RedButton>
            <span className="text-sm text-[#FFFFFF]">
              {page} / {totalPages}
            </span>
            <RedButton onClick={nextPage} disabled={page === totalPages} className="px-3 py-1 text-sm disabled:opacity-50">
              다음
            </RedButton>
          </div>
        )}
      </div>

      {/* 프로필 모달 */}
      <ProfileModal
        isOpen={showDetail}
        onClose={closeDetail}
        member={selectedMember}
      />
    </div>
  );
}