'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@prometheus-fe/stores';
import { useImage, useUser } from '@prometheus-fe/hooks';
import { 
  UserDetailResponse,
  UserPublicListItem,
  UserPrivateListItem
} from '@prometheus-fe/types';

// 멤버 상세 모달 컴포넌트
interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: UserDetailResponse | null;
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
                {member.history.map((h, i) => (
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
  const { getPublicUsers, getPrivateUsers, getUser, createCoffeeChatRequest, isLoadingPublic, isLoadingPrivate, isLoadingUser } = useUser();
  const { getThumbnailUrl } = useImage();

  // 상태 관리
  const [users, setUsers] = useState<(UserPublicListItem | UserPrivateListItem)[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(20);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [isRequesting, setIsRequesting] = useState<boolean>(false);

  // 필터 상태
  const [filters, setFilters] = useState({
    search: '',
    executive: false,
    gen: null as number | null
  });

  // 기수별 탭 상태 (외부인용)
  const [selectedGenTab, setSelectedGenTab] = useState<number | 'executive' | 'all'>('all');

  // 모달 상태
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserDetailResponse | null>(null);

  // 계산된 값들
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / size)), [total, size]);
  const isPrivate = useMemo(() => isAuthenticated(), [isAuthenticated]);

  // 유틸리티 함수들
  const getFirstLetter = useCallback((name: string) => {
    return name && name.length ? name.trim().charAt(0) : 'U';
  }, []);

  const handleImageError = useCallback((userId: string) => {
    setImageErrors(prev => ({ ...prev, [userId]: true }));
  }, []);

  // 사용자 목록 조회
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      
      let params: any = {
        page,
        size
      };

      if (isPrivate) {
        // 로그인 사용자: 기존 필터 사용
        params = {
          ...params,
          ...(filters.search && { search: filters.search }),
          ...(filters.executive && { executive: filters.executive }),
          ...(filters.gen !== null && { gen: filters.gen })
        };
      } else {
        // 외부인: 기수별 탭 사용
        if (selectedGenTab === 'executive') {
          params.executive = true;
        } else if (selectedGenTab !== 'all') {
          params.gen = selectedGenTab;
        }
      }

      let response;
      if (isPrivate) {
        response = await getPrivateUsers(params);
      } else {
        response = await getPublicUsers(params);
      }

      setUsers(response.users || []);
      setTotal(response.total || 0);
      setImageErrors({});
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUsers([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, size, filters, selectedGenTab, isPrivate, getPublicUsers, getPrivateUsers]);

  // 필터 적용
  const applyFilters = useCallback(() => {
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ search: '', executive: false, gen: null });
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
  const onCardClick = useCallback(async (user: UserPublicListItem | UserPrivateListItem) => {
    if (!isPrivate) return;
    
    // UserPrivateListItem에만 id가 있음
    if ('id' in user) {
      try {
        const userDetail = await getUser(user.id);
        setSelectedUser(userDetail);
        setShowDetail(true);
      } catch (err) {
        console.error('Failed to get user details:', err);
        alert('사용자 정보를 불러오는 중 오류가 발생했습니다.');
      }
    }
  }, [isPrivate, getUser]);

  // 모달 닫기
  const closeDetail = useCallback(() => {
    setShowDetail(false);
    setSelectedUser(null);
  }, []);

  // 커피챗 요청
  const sendCoffeeChat = useCallback(async (message: string) => {
    if (!selectedUser) return;
    
    try {
      setIsRequesting(true);
      
      // 커피챗 API 호출
      await createCoffeeChatRequest({
        recipient_id: selectedUser.id,
        message: message || undefined
      });
      
      alert('커피챗 요청을 보냈습니다.');
      closeDetail();
    } catch (err) {
      console.error('Failed to send coffee chat request:', err);
      alert('요청에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsRequesting(false);
    }
  }, [selectedUser, closeDetail, createCoffeeChatRequest]);

  // 필터 변경 핸들러
  const handleFilterChange = useCallback((key: string, value: string | number | boolean | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // 페이지 변경 시 목록 다시 로드
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 기수별 탭 변경 시 데이터 다시 로드 (외부인용)
  useEffect(() => {
    if (!isPrivate) {
      setPage(1); // 페이지 초기화
      fetchUsers();
    }
  }, [selectedGenTab, isPrivate, fetchUsers]);

  return (
    <div className="min-h-screen prometheus-bg">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg relative z-10">
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">멤버</h1>
              <p className="text-sm text-gray-600 mt-1">프로메테우스 멤버 목록</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">{total}</div>
              <div className="text-xs text-gray-500">총 멤버</div>
            </div>
          </div>
          {isPrivate && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                로그인 전용 상세보기 활성화
              </span>
            </div>
          )}
        </div>

        <div className="px-6 py-6">
          {/* 기수별 탭 (외부인용) */}
          {!isPrivate && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedGenTab('all')}
                  className={`px-3 py-2 text-sm rounded-md cursor-pointer ${
                    selectedGenTab === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setSelectedGenTab('executive')}
                  className={`px-3 py-2 text-sm rounded-md cursor-pointer ${
                    selectedGenTab === 'executive'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  운영진
                </button>
                {Array.from({ length: 20 }, (_, i) => i).map((gen) => (
                  <button
                    key={gen}
                    onClick={() => setSelectedGenTab(gen)}
                    className={`px-3 py-2 text-sm rounded-md cursor-pointer ${
                      selectedGenTab === gen
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {gen}기
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 필터 (로그인 사용자용) */}
          {isPrivate && (
            <div className="bg-white border rounded-md p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  type="text"
                  placeholder="이름/이메일 검색"
                  className="border rounded-md px-3 py-2"
                />
                <select
                  value={filters.executive ? 'true' : 'false'}
                  onChange={(e) => handleFilterChange('executive', e.target.value === 'true')}
                  className="border rounded-md px-3 py-2"
                >
                  <option value="false">전체</option>
                  <option value="true">운영진만</option>
                </select>
                <select
                  value={filters.gen || ''}
                  onChange={(e) => handleFilterChange('gen', e.target.value ? parseInt(e.target.value) : null)}
                  className="border rounded-md px-3 py-2"
                >
                  <option value="">기수 전체</option>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((g) => (
                    <option key={g} value={g}>{g}기</option>
                  ))}
                </select>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={applyFilters}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 cursor-pointer"
                  >
                    검색
                  </button>
                  <button
                    onClick={resetFilters}
                    className="flex-1 bg-gray-200 text-gray-800 px-3 py-2 rounded-md hover:bg-gray-300 cursor-pointer"
                  >
                    초기화
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* 로딩 상태 */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          </div>
        ) : (
          /* 멤버 카드 그리드 */
          <div className="grid grid-cols-1 gap-4">
            {users.map((user, index) => (
              <div
                key={'id' in user ? user.id : index}
                className={`relative bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition ${
                  isPrivate ? 'cursor-pointer' : 'cursor-default'
                }`}
                onClick={() => onCardClick(user)}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {user.profile_image_url && !imageErrors['id' in user ? user.id : index] ? (
                      <div className="relative w-16 h-16">
                        <Image
                          src={getThumbnailUrl(user.profile_image_url, 128)}
                          alt={user.name}
                          fill
                          className="rounded-full object-cover"
                          onError={() => handleImageError('id' in user ? user.id : index.toString())}
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-medium">
                        {getFirstLetter(user.name)}
                      </div>
                    )}
                    {isPrivate && 'coffee_chat_enabled' in user && user.coffee_chat_enabled && (
                      <div className="absolute -top-1 -left-1 bg-yellow-500 text-white text-xs rounded-full px-2 py-0.5">
                        ☕
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                  
                  {!isPrivate ? (
                    <div className="mt-1 flex flex-wrap gap-1 text-xs">
                      {user.school && (
                        <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {user.school}
                        </span>
                      )}
                      {user.major && (
                        <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {user.major}
                        </span>
                      )}
                      
                    </div>
                  ) : (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {user.gen && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                          {user.gen}기
                        </span>
                      )}
                      {user.school && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {user.school}
                        </span>
                      )}
                      {user.major && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {user.major}
                        </span>
                      )}
                      
                    </div>
                  )}
                </div>

                {user.history && user.history.length > 0 && (
                  <div className="mt-2 text-xs text-gray-700 bg-gray-50 p-2 rounded">
                    <div className="font-medium mb-1">이력:</div>
                    <div className="space-y-0.5">
                      {user.history.slice(0, 3).map((h, idx) => (
                        <div key={idx}>• {h}</div>
                      ))}
                      {user.history.length > 3 && (
                        <div className="text-gray-500">+{user.history.length - 3}개 더...</div>
                      )}
                    </div>
                  </div>
                )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center space-x-2">
            <button
              onClick={prevPage}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
            >
              이전
            </button>
            <span className="text-sm text-gray-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      <MemberDetailModal
        isOpen={showDetail}
        onClose={closeDetail}
        member={selectedUser}
        onSendCoffeeChat={sendCoffeeChat}
        isRequesting={isRequesting}
      />
      </div>
    </div>
  );
}