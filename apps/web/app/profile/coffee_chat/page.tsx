'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@prometheus-fe/stores';
import { useImage, useCoffeeChat } from '@prometheus-fe/hooks';
import TabBar from '@/src/components/TabBar';
import { 
  CoffeeChatMember,
  CoffeeChatRequest,
  CoffeeChatCreateRequest,
  CoffeeChatRespondRequest,
  CoffeeChatStatus
} from '@prometheus-fe/types';

// 커피챗 요청 모달 컴포넌트
interface CoffeeChatRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: CoffeeChatMember | null;
  onSendRequest: (message: string) => void;
  isRequesting: boolean;
}

function CoffeeChatRequestModal({
  isOpen,
  onClose,
  target,
  onSendRequest,
  isRequesting
}: CoffeeChatRequestModalProps) {
  const [requestMessage, setRequestMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRequestMessage('');
    }
  }, [isOpen]);

  if (!isOpen || !target) return null;

  const handleSendRequest = () => {
    onSendRequest(requestMessage);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          ✕
        </button>
        
        <h3 className="text-lg font-semibold mb-3">커피챗 요청</h3>
        <p className="text-sm text-gray-700 mb-2">대상: {target.name}</p>
        <textarea 
          value={requestMessage} 
          onChange={(e) => setRequestMessage(e.target.value)}
          rows={4} 
          maxLength={300} 
          placeholder="메시지 (선택)" 
          className="w-full border rounded px-3 py-2"
        />
        <button 
          onClick={handleSendRequest} 
          disabled={isRequesting} 
          className="mt-4 w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 disabled:opacity-50 cursor-pointer"
        >
          {isRequesting ? '요청 중...' : '보내기'}
        </button>
      </div>
    </div>
  );
}

export default function CoffeeChatPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { 
    getAvailableMembers, 
    createRequest, 
    getSentRequests, 
    getReceivedRequests, 
    respondToRequest, 
    getContactInfo 
  } = useCoffeeChat();
  const { getThumbnailUrl } = useImage();

  // 탭 상태
  const [tab, setTab] = useState<'available' | 'sent' | 'received'>('available');

  // 가능한 사용자 상태
  const [availableUsers, setAvailableUsers] = useState<CoffeeChatMember[]>([]);
  const [availableTotal, setAvailableTotal] = useState(0);
  const [availablePage, setAvailablePage] = useState(1);
  const [availableSize] = useState(12);
  const [availableFilters, setAvailableFilters] = useState({ search: '', gen_filter: null as number | null });
  const [loadingAvailable, setLoadingAvailable] = useState(false);

  // 요청 상태
  const [sentRequests, setSentRequests] = useState<CoffeeChatRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<CoffeeChatRequest[]>([]);
  const [sentStatus, setSentStatus] = useState<CoffeeChatStatus | ''>('');
  const [receivedStatus, setReceivedStatus] = useState<CoffeeChatStatus | ''>('');
  const [loadingSent, setLoadingSent] = useState(false);
  const [loadingReceived, setLoadingReceived] = useState(false);

  // 모달 상태
  const [showRequest, setShowRequest] = useState(false);
  const [requestTarget, setRequestTarget] = useState<CoffeeChatMember | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  // 계산된 값들
  const availableTotalPages = Math.max(1, Math.ceil(availableTotal / availableSize));

  // 유틸리티 함수들
  const getFirstLetter = useCallback((name: string) => {
    return name && name.length ? name.trim().charAt(0) : 'U';
  }, []);

  // 가능한 사용자 조회
  const fetchAvailableUsers = useCallback(async () => {
    try {
      setLoadingAvailable(true);
      const params = {
        page: availablePage,
        size: availableSize,
        ...(availableFilters.search && { search: availableFilters.search }),
        ...(availableFilters.gen_filter !== null && { gen_filter: availableFilters.gen_filter })
      };
      const res = await getAvailableMembers(params);
      setAvailableUsers(res.members || []);
      setAvailableTotal(res.total || res.members?.length || 0);
    } catch (err) {
      console.error('Failed to load available users:', err);
      setAvailableUsers([]);
      setAvailableTotal(0);
    } finally {
      setLoadingAvailable(false);
    }
  }, [availablePage, availableSize, availableFilters, getAvailableMembers]);

  // 보낸 요청 조회
  const fetchSent = useCallback(async () => {
    try {
      setLoadingSent(true);
      const params = {
        page: 1,
        size: 20,
        ...(sentStatus && { status_filter: sentStatus })
      };
      const res = await getSentRequests(params);
      setSentRequests(res.requests || []);
    } catch (err) {
      console.error('Failed to load sent requests:', err);
      setSentRequests([]);
    } finally {
      setLoadingSent(false);
    }
  }, [sentStatus, getSentRequests]);

  // 받은 요청 조회
  const fetchReceived = useCallback(async () => {
    try {
      setLoadingReceived(true);
      const params = {
        page: 1,
        size: 20,
        ...(receivedStatus && { status_filter: receivedStatus })
      };
      const res = await getReceivedRequests(params);
      setReceivedRequests(res.requests || []);
    } catch (err) {
      console.error('Failed to load received requests:', err);
      setReceivedRequests([]);
    } finally {
      setLoadingReceived(false);
    }
  }, [receivedStatus, getReceivedRequests]);

  // 페이지 이동
  const prevAvailable = useCallback(() => {
    if (availablePage > 1) {
      setAvailablePage(availablePage - 1);
    }
  }, [availablePage]);

  const nextAvailable = useCallback(() => {
    if (availablePage < availableTotalPages) {
      setAvailablePage(availablePage + 1);
    }
  }, [availablePage, availableTotalPages]);

  // 요청 모달 관련
  const openRequest = useCallback((user: CoffeeChatMember) => {
    setRequestTarget(user);
    setShowRequest(true);
  }, []);

  const closeRequest = useCallback(() => {
    setShowRequest(false);
    setRequestTarget(null);
  }, []);

  const handleCreateRequest = useCallback(async (message: string) => {
    if (!requestTarget) return;
    
    // 자기 자신에게 요청하는지 확인
    if (user && requestTarget.id === user.id) {
      alert('자기 자신에게는 커피챗을 요청할 수 없습니다.');
      return;
    }
    
    try {
      setIsRequesting(true);
      const payload: CoffeeChatCreateRequest = {
        recipient_id: requestTarget.id,
        message: message || ''
      };
      await createRequest(payload);
      alert('요청을 보냈습니다.');
      closeRequest();
      fetchSent();
    } catch (err) {
      console.error('Failed to create request:', err);
      alert('요청 실패. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsRequesting(false);
    }
  }, [requestTarget, user, createRequest, closeRequest, fetchSent]);

  // 요청 응답
  const respond = useCallback(async (req: CoffeeChatRequest, status: 'accepted' | 'rejected') => {
    try {
      const payload: CoffeeChatRespondRequest = { 
        status,
        response_message: ''
      };
      await respondToRequest(req.id, payload);
      fetchReceived();
      // 수락/거절 성공 메시지 표시
      if (status === 'accepted') {
        alert('커피챗 요청을 수락했습니다.');
      } else {
        alert('커피챗 요청을 거절했습니다.');
      }
    } catch (err) {
      console.error('Failed to respond request:', err);
      alert('처리 실패');
    }
  }, [respondToRequest, fetchReceived]);

  // 연락처 조회
  const viewContact = useCallback(async (req: CoffeeChatRequest) => {
    try {
      const res = await getContactInfo(req.id);
      alert(`연락처: ${res?.requester_kakao_id || res?.requester_instagram_id || '제공되지 않음'}`);
    } catch (err) {
      console.error('Failed to get contact info:', err);
      alert('연락처 조회 실패');
    }
  }, [getContactInfo]);

  // 헬퍼 함수들
  const getRecipientName = useCallback((r: CoffeeChatRequest) => r.recipient_name || '', []);
  const getRecipientGen = useCallback((r: CoffeeChatRequest) => r.recipient_gen, []);
  const getRecipientSchool = useCallback((r: CoffeeChatRequest) => r.recipient_school || '', []);
  const getRecipientMajor = useCallback((r: CoffeeChatRequest) => r.recipient_major || '', []);

  const getRequesterName = useCallback((r: CoffeeChatRequest) => r.requester_name || '', []);
  const getRequesterGen = useCallback((r: CoffeeChatRequest) => r.requester_gen, []);
  const getRequesterSchool = useCallback((r: CoffeeChatRequest) => r.requester_school || '', []);
  const getRequesterMajor = useCallback((r: CoffeeChatRequest) => r.requester_major || '', []);

  // 초기 로드
  useEffect(() => {
    if (isAuthenticated()) {
      fetchAvailableUsers();
      fetchSent();
      fetchReceived();
    }
  }, [isAuthenticated, fetchAvailableUsers, fetchSent, fetchReceived]);

  // 페이지 변경 시 다시 로드
  useEffect(() => {
    if (tab === 'available') {
      fetchAvailableUsers();
    }
  }, [tab, fetchAvailableUsers]);

  return (
    <div className="px-6 py-6">
      {/* 커피챗 탭 네비게이션 */}
      <div className="mb-6">
        <TabBar
          tabs={[
            { id: 'available', label: '가능 사용자' },
            { id: 'sent', label: '보낸 요청' },
            { id: 'received', label: '받은 요청' }
          ]}
          activeTab={tab}
          onTabChange={(tabId) => {
            setTab(tabId as 'available' | 'sent' | 'received');
          }}
        />
      </div>

      {/* 가능 사용자 */}
      {tab === 'available' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input 
              value={availableFilters.search} 
              onChange={(e) => setAvailableFilters(prev => ({ ...prev, search: e.target.value }))}
              type="text" 
              placeholder="검색" 
              className="border rounded px-3 py-2" 
            />
            <select 
              value={availableFilters.gen_filter || ''} 
              onChange={(e) => setAvailableFilters(prev => ({ 
                ...prev, 
                gen_filter: e.target.value ? parseInt(e.target.value) : null 
              }))}
              className="border rounded px-3 py-2"
            >
              <option value="">기수 전체</option>
              {Array.from({ length: 20 }, (_, i) => i + 1).map((g) => (
                <option key={g} value={g}>{g}기</option>
              ))}
            </select>
            <button 
              onClick={fetchAvailableUsers} 
              className="bg-blue-600 text-white px-3 py-2 rounded cursor-pointer"
            >
              검색
            </button>
          </div>
          
          {loadingAvailable ? (
            <div className="py-8 text-center">불러오는 중...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableUsers.map((user) => (
                <div key={user.id} className="border rounded p-4 flex items-center gap-4">
                  <div className="relative w-12 h-12">
                    {user.profile_image_url ? (
                      <Image
                        src={getThumbnailUrl(user.profile_image_url, 96)}
                        alt={user.name}
                        fill
                        className="rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-medium">
                        {getFirstLetter(user.name)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {user.name} 
                      {user.gen !== null && user.gen !== undefined && (
                        <span className="text-xs text-gray-500">
                          · {user.gen === 0 ? '창립멤버' : `${user.gen}기`}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{user.school} {user.major}</div>
                    {user.mbti && <div className="text-xs text-gray-500">MBTI: {user.mbti}</div>}
                  </div>
                  <button 
                    onClick={() => openRequest(user)} 
                    className="bg-yellow-500 text-white px-3 py-1 rounded cursor-pointer"
                  >
                    요청
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {availableTotalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button 
                onClick={prevAvailable} 
                disabled={availablePage === 1} 
                className="px-2 py-1 border rounded disabled:opacity-50 cursor-pointer"
              >
                이전
              </button>
              <span className="text-sm text-gray-600">{availablePage}/{availableTotalPages}</span>
              <button 
                onClick={nextAvailable} 
                disabled={availablePage === availableTotalPages} 
                className="px-2 py-1 border rounded disabled:opacity-50 cursor-pointer"
              >
                다음
              </button>
            </div>
          )}
        </div>
      )}

      {/* 보낸 요청 */}
      {tab === 'sent' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <select 
              value={sentStatus} 
              onChange={(e) => setSentStatus(e.target.value as CoffeeChatStatus | '')} 
              className="border rounded px-3 py-2"
            >
              <option value="">전체</option>
              <option value="pending">대기</option>
              <option value="accepted">수락</option>
              <option value="rejected">거절</option>
            </select>
            <button 
              onClick={fetchSent} 
              className="bg-blue-600 text-white px-3 py-2 rounded cursor-pointer"
            >
              조회
            </button>
          </div>
          
          {loadingSent ? (
            <div className="py-8 text-center">불러오는 중...</div>
          ) : (
            <div>
              {sentRequests.map((request) => (
                <div key={request.id} className="border rounded p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {getRecipientName(request)}
                        {getRecipientGen(request) !== null && getRecipientGen(request) !== undefined && (
                          <span className="text-xs text-gray-500">
                            · {getRecipientGen(request) === 0 ? '창립멤버' : `${getRecipientGen(request)}기`}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">
                        {getRecipientSchool(request)} {getRecipientMajor(request)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">상태: {request.status}</div>
                      <div className="text-sm text-gray-700">메시지: {request.message || '없음'}</div>
                    </div>
                    {request.status === 'accepted' && (
                      <button 
                        onClick={() => viewContact(request)} 
                        className="text-blue-600 text-sm cursor-pointer"
                      >
                        연락처 보기
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 받은 요청 */}
      {tab === 'received' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <select 
              value={receivedStatus} 
              onChange={(e) => setReceivedStatus(e.target.value as CoffeeChatStatus | '')} 
              className="border rounded px-3 py-2"
            >
              <option value="">전체</option>
              <option value="pending">대기</option>
              <option value="accepted">수락</option>
              <option value="rejected">거절</option>
            </select>
            <button 
              onClick={fetchReceived} 
              className="bg-blue-600 text-white px-3 py-2 rounded cursor-pointer"
            >
              조회
            </button>
          </div>
          
          {loadingReceived ? (
            <div className="py-8 text-center">불러오는 중...</div>
          ) : (
            <div>
              {receivedRequests.map((request) => (
                <div key={request.id} className="border rounded p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {getRequesterName(request)}
                        {getRequesterGen(request) !== null && getRequesterGen(request) !== undefined && (
                          <span className="text-xs text-gray-500">
                            · {getRequesterGen(request) === 0 ? '창립멤버' : `${getRequesterGen(request)}기`}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">
                        {getRequesterSchool(request)} {getRequesterMajor(request)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">상태: {request.status}</div>
                      <div className="text-sm text-gray-700">메시지: {request.message || '없음'}</div>
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => respond(request, 'accepted')} 
                          className="bg-green-600 text-white px-3 py-1 rounded cursor-pointer"
                        >
                          수락
                        </button>
                        <button 
                          onClick={() => respond(request, 'rejected')} 
                          className="bg-red-600 text-white px-3 py-1 rounded cursor-pointer"
                        >
                          거절
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 요청 모달 */}
      <CoffeeChatRequestModal
        isOpen={showRequest}
        onClose={closeRequest}
        target={requestTarget}
        onSendRequest={handleCreateRequest}
        isRequesting={isRequesting}
      />
    </div>
  );
}
