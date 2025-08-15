'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@prometheus-fe/stores';
import { useImage, useMember, useCoffeeChat } from '@prometheus-fe/hooks';
import GlassCard from '../../src/components/GlassCard';
import TabBar from '../../src/components/TabBar';
import RedButton from '../../src/components/RedButton';
import { 
  MemberDetailResponse,
  MemberPublicListItem,
  MemberPrivateListItem
} from '@prometheus-fe/types';

// 멤버 상세 모달 컴포넌트
interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberDetailResponse | null;
  onSendCoffeeChat: (message: string) => void;
  isRequesting: boolean;
}

function MemberDetailModal({
  isOpen,
  onClose,
  member,
  onSendCoffeeChat,
  isRequesting
}: MemberDetailModalProps) {
  const [coffeeChatMessage, setCoffeeChatMessage] = useState('');
  const [modalImageError, setModalImageError] = useState(false);
  const { getThumbnailUrl } = useImage();

  useEffect(() => {
    if (isOpen) {
      setCoffeeChatMessage('');
      setModalImageError(false);
    }
  }, [isOpen]);

  if (!isOpen || !member) return null;

  const getFirstLetter = (name: string) => (name && name.length ? name.trim().charAt(0) : 'U');

  const handleSendCoffeeChat = () => {
    onSendCoffeeChat(coffeeChatMessage);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          ✕
        </button>
        
        <div className="text-center mb-6">
          {member.profile_image_url && !modalImageError ? (
            <div className="relative w-24 h-24 mx-auto">
              <Image
                src={getThumbnailUrl(member.profile_image_url, 192)}
                alt={member.name}
                fill
                className="rounded-full object-cover"
                onError={() => setModalImageError(true)}
                unoptimized
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto bg-gray-300 flex items-center justify-center text-gray-700 font-medium">
              {getFirstLetter(member.name)}
            </div>
          )}
          <h3 className="mt-3 text-xl font-semibold text-gray-900">{member.name}</h3>
          <p className="text-sm text-gray-600">
            {member.school} {member.major}
          </p>
        </div>

        <div className="space-y-3 text-sm text-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><span className="font-medium">상태:</span> {member.status}</div>
            <div><span className="font-medium">기수:</span> {member.gen ?? '-'}</div>
            <div><span className="font-medium">학교:</span> {member.school ?? '-'}</div>
            <div><span className="font-medium">전공:</span> {member.major ?? '-'}</div>
            <div><span className="font-medium">학번:</span> {member.student_id ?? '-'}</div>
            <div><span className="font-medium">MBTI:</span> {member.mbti ?? '-'}</div>
            {(member.github || member.notion || member.figma) && (
              <div className="md:col-span-2">
                <span className="font-medium">링크:</span>
                {member.github && (
                  <a 
                    href={member.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-blue-700"
                  >
                    GitHub
                  </a>
                )}
                {member.notion && (
                  <a 
                    href={member.notion} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-blue-700"
                  >
                    Notion
                  </a>
                )}
                {member.figma && (
                  <a 
                    href={member.figma} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-blue-700"
                  >
                    Figma
                  </a>
                )}
              </div>
            )}
          </div>
          
          {member.self_introduction && (
            <div className="pt-2">
              <span className="font-medium">자기소개:</span>
              <div className="mt-1 whitespace-pre-wrap text-gray-700">
                {member.self_introduction}
              </div>
            </div>
          )}
          
          {member.additional_career && (
            <div className="pt-2">
              <span className="font-medium">추가 경력:</span>
              <div className="mt-1 whitespace-pre-wrap text-gray-700">
                {member.additional_career}
              </div>
            </div>
          )}
          
          {member.active_gens && member.active_gens.length > 0 && (
            <div className="pt-2">
              <span className="font-medium">활동 기수:</span>
              <div className="mt-1 text-gray-700">
                {member.active_gens.join(', ')}
              </div>
            </div>
          )}
          
          {member.history && member.history.length > 0 && (
            <div className="pt-2">
              <span className="font-medium">이력:</span>
              <ul className="mt-1 list-disc list-inside text-gray-700">
                {member.history.map((h: string, i: number) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-3">
          {member.coffee_chat_enabled ? (
            <>
              <textarea
                value={coffeeChatMessage}
                onChange={(e) => setCoffeeChatMessage(e.target.value)}
                rows={3}
                maxLength={300}
                placeholder="커피챗 요청 메시지 (선택)"
                className="w-full border rounded-md px-3 py-2"
              />
              <button
                onClick={handleSendCoffeeChat}
                disabled={isRequesting}
                className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 disabled:opacity-50 cursor-pointer"
              >
                {isRequesting ? '요청 중...' : '커피챗 요청하기'}
              </button>
            </>
          ) : (
            <div className="text-sm text-gray-600 text-center">
              이 사용자는 커피챗을 받지 않습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MemberPage() {
  const { isAuthenticated } = useAuthStore();
  const { getPublicMembers, getPrivateMembers, getMemberDetail, isLoadingMembers, isLoadingMember } = useMember();
  const { createRequest } = useCoffeeChat();
  const { getThumbnailUrl } = useImage();

  // 상태 관리
  const [members, setMembers] = useState<(MemberPublicListItem | MemberPrivateListItem)[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(20);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [isRequesting, setIsRequesting] = useState<boolean>(false);

  // 필터 상태
  const [filters, setFilters] = useState({
    search: '',
    school: '',
    executive: false,
    gen: null as number | null
  });

  // 기수별 탭 상태
  const [selectedGenTab, setSelectedGenTab] = useState<number>(0); // 초기값은 0으로 설정하고 나중에 업데이트

  // 모달 상태
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<MemberDetailResponse | null>(null);

  // 계산된 값들
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / size)), [total, size]);
  const isPrivate = useMemo(() => isAuthenticated(), [isAuthenticated]);
  
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

  // 사용자 목록 조회
  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      
      let params: any = {
        page,
        size
      };

             if (isPrivate) {
         // 로그인 사용자: 검색 필터 + 탭 필터 조합
         params = {
           ...params,
           ...(filters.search && { search: filters.search }),
           ...(filters.school && { school: filters.school }),
           ...(filters.executive && { executive: filters.executive }),
           ...(filters.gen !== null && { gen: filters.gen })
         };
         
         // 탭 필터도 적용
         params.gen = selectedGenTab;
       } else {
         // 외부인: 기수별 탭만 사용
         params.gen = selectedGenTab;
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
      setIsLoading(false);
    }
  }, [page, size, filters, selectedGenTab, isPrivate, getPublicMembers, getPrivateMembers]);

  // 필터 적용
  const applyFilters = useCallback(() => {
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ search: '', school: '', executive: false, gen: null });
    setPage(1);
  }, []);

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

  // 커피챗 요청
  const sendCoffeeChat = useCallback(async (message: string) => {
    if (!selectedMember) return;
    
    try {
      setIsRequesting(true);
      
      // 커피챗 API 호출
      await createRequest({
        recipient_id: selectedMember.id,
        message: message || ''
      });
      
      alert('커피챗 요청을 보냈습니다.');
      closeDetail();
    } catch (err) {
      console.error('Failed to send coffee chat request:', err);
      alert('요청에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsRequesting(false);
    }
  }, [selectedMember, closeDetail, createRequest]);

  // 필터 변경 핸들러
  const handleFilterChange = useCallback((key: string, value: string | number | boolean | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // 페이지 변경 시 목록 다시 로드
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // 초기 기수 설정
  useEffect(() => {
    const currentGen = getCurrentGen();
    setSelectedGenTab(currentGen);
  }, [getCurrentGen]);

  // 기수별 탭 변경 시 데이터 다시 로드 (공통)
  useEffect(() => {
    if (selectedGenTab > 0) { // 0이 아닐 때만 실행 (초기 로딩 방지)
      setPage(1); // 페이지 초기화
      fetchMembers();
    }
  }, [selectedGenTab, fetchMembers]);

  return (
    <div className="min-h-screen">
        {/* 헤더 */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <GlassCard href="/" className="w-10 h-10 flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </GlassCard>
            <div>
                <h1 className="text-xl font-semibold text-white">멤버</h1>
                <p className="text-sm text-gray-300 mt-1">프로메테우스 멤버 목록</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-white">{total}</div>
              <div className="text-xs text-gray-300">총 멤버</div>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
                     {/* 기수별 탭 */}
           <GlassCard className="mb-6">
             <TabBar
               tabs={genTabs}
               activeTab={selectedGenTab.toString()}
               onTabChange={(tabId) => {
                 setSelectedGenTab(parseInt(tabId));
               }}
             />
           </GlassCard>

          {/* 필터 (로그인 사용자용) */}
          {isPrivate && (
            <GlassCard className="p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  type="text"
                  placeholder="이름/이메일 검색"
                  className="border rounded-md px-3 py-2 bg-white/90 text-gray-900"
                />
                <input
                  value={filters.school || ''}
                  onChange={(e) => handleFilterChange('school', e.target.value)}
                  type="text"
                  placeholder="학교 검색"
                  className="border rounded-md px-3 py-2 bg-white/90 text-gray-900"
                />
                <select
                  value={filters.executive ? 'true' : 'false'}
                  onChange={(e) => handleFilterChange('executive', e.target.value === 'true')}
                  className="border rounded-md px-3 py-2 bg-white/90 text-gray-900"
                >
                  <option value="false">전체</option>
                  <option value="true">운영진만</option>
                </select>
                <select
                  value={filters.gen || ''}
                  onChange={(e) => handleFilterChange('gen', e.target.value ? parseInt(e.target.value) : null)}
                  className="border rounded-md px-3 py-2 bg-white/90 text-gray-900"
                >
                  <option value="">기수 전체</option>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((g) => (
                    <option key={g} value={g}>{g}기</option>
                  ))}
                </select>
                <div className="flex items-center space-x-2">
                  <RedButton onClick={applyFilters} className="flex-1 px-3 py-2 text-sm">
                    검색
                  </RedButton>
                  <RedButton onClick={resetFilters} className="flex-1 px-3 py-2 text-sm">
                    초기화
                  </RedButton>
                </div>
              </div>
            </GlassCard>
          )}

        {/* 로딩 상태 */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          </div>
        ) : (
          /* 멤버 카드 그리드 */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member, index) => (
              <GlassCard
                key={'id' in member ? member.id : index}
                className={`relative p-4 text-center ${
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
                      <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-medium">
                        {getFirstLetter(member.name)}
                      </div>
                    )}
                    {isPrivate && 'coffee_chat_enabled' in member && member.coffee_chat_enabled && (
                      <div className="absolute -top-1 -left-1 bg-yellow-500 text-white text-xs rounded-full px-2 py-0.5">
                        ☕
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{member.name}</h3>
                  
                  <div className="flex flex-wrap gap-1 justify-center">
                    {!isPrivate ? (
                      <>
                        {member.school && (
                           <span className="px-1.5 py-0.5 rounded-full text-gray-300 text-xs">
                             {member.school}
                           </span>
                         )}
                        {member.major && (
                          <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
                            {member.major}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        {member.gen && (
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                            {member.gen}기
                          </span>
                        )}
                        {member.school && (
                           <span className="px-1.5 py-0.5 text-gray-300 text-xs rounded-full">
                             {member.school}
                           </span>
                         )}
                        {member.major && (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
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
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center space-x-2">
            <RedButton onClick={prevPage} disabled={page === 1} className="px-3 py-1 text-sm disabled:opacity-50">
              이전
            </RedButton>
            <span className="text-sm text-white">
              {page} / {totalPages}
            </span>
            <RedButton onClick={nextPage} disabled={page === totalPages} className="px-3 py-1 text-sm disabled:opacity-50">
              다음
            </RedButton>
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      <MemberDetailModal
        isOpen={showDetail}
        onClose={closeDetail}
        member={selectedMember}
        onSendCoffeeChat={sendCoffeeChat}
        isRequesting={isRequesting}
      />
    </div>
  );
}