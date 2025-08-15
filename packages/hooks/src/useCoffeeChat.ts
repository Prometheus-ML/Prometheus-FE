import { useState, useCallback } from 'react';
import { useApi } from '@prometheus-fe/context';
import {
  CoffeeChatMember,
  CoffeeChatRequest,
  CoffeeChatContactInfo,
  CoffeeChatStatus,
  CoffeeChatListParams,
  CoffeeChatListResponse,
  CoffeeChatCreateRequest,
  CoffeeChatRespondRequest
} from '@prometheus-fe/types';

export const useCoffeeChat = () => {
  const { coffeeChat } = useApi();
  
  // 상태 관리
  const [availableMembers, setAvailableMembers] = useState<CoffeeChatMember[]>([]);
  const [sentRequests, setSentRequests] = useState<CoffeeChatRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<CoffeeChatRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<CoffeeChatRequest | null>(null);
  const [contactInfo, setContactInfo] = useState<CoffeeChatContactInfo | null>(null);
  
  // 로딩 상태
  const [isLoadingMembers, setIsLoadingMembers] = useState<boolean>(false);
  const [isLoadingSentRequests, setIsLoadingSentRequests] = useState<boolean>(false);
  const [isLoadingReceivedRequests, setIsLoadingReceivedRequests] = useState<boolean>(false);
  const [isLoadingContactInfo, setIsLoadingContactInfo] = useState<boolean>(false);
  
  // 페이지네이션 상태
  const [membersTotal, setMembersTotal] = useState<number>(0);
  const [sentRequestsTotal, setSentRequestsTotal] = useState<number>(0);
  const [receivedRequestsTotal, setReceivedRequestsTotal] = useState<number>(0);

  // 커피챗 가능 멤버 목록 조회
  const getAvailableMembers = useCallback(async (params?: CoffeeChatListParams): Promise<CoffeeChatListResponse> => {
    if (!coffeeChat) {
      throw new Error('Coffee chat API not available');
    }
    try {
      setIsLoadingMembers(true);
      const data = await coffeeChat.getAvailableMembers(params);
      setAvailableMembers(data.members || []);
      setMembersTotal(data.total || 0);
      return data;
    } catch (error) {
      console.error('Failed to fetch available members:', error);
      throw error;
    } finally {
      setIsLoadingMembers(false);
    }
  }, [coffeeChat]);

  // 커피챗 요청 생성
  const createRequest = useCallback(async (data: CoffeeChatCreateRequest): Promise<CoffeeChatRequest> => {
    if (!coffeeChat) {
      throw new Error('Coffee chat API not available');
    }
    try {
      const response = await coffeeChat.createRequest(data);
      return response;
    } catch (error) {
      console.error('Failed to create coffee chat request:', error);
      throw error;
    }
  }, [coffeeChat]);

  // 내가 보낸 커피챗 요청 목록
  const getSentRequests = useCallback(async (params?: CoffeeChatListParams): Promise<CoffeeChatListResponse> => {
    if (!coffeeChat) {
      throw new Error('Coffee chat API not available');
    }
    try {
      setIsLoadingSentRequests(true);
      const data = await coffeeChat.getSentRequests(params);
      setSentRequests(data.requests || []);
      setSentRequestsTotal(data.total || 0);
      return data;
    } catch (error) {
      console.error('Failed to fetch sent requests:', error);
      throw error;
    } finally {
      setIsLoadingSentRequests(false);
    }
  }, [coffeeChat]);

  // 내가 받은 커피챗 요청 목록
  const getReceivedRequests = useCallback(async (params?: CoffeeChatListParams): Promise<CoffeeChatListResponse> => {
    if (!coffeeChat) {
      throw new Error('Coffee chat API not available');
    }
    try {
      setIsLoadingReceivedRequests(true);
      const data = await coffeeChat.getReceivedRequests(params);
      setReceivedRequests(data.requests || []);
      setReceivedRequestsTotal(data.total || 0);
      return data;
    } catch (error) {
      console.error('Failed to fetch received requests:', error);
      throw error;
    } finally {
      setIsLoadingReceivedRequests(false);
    }
  }, [coffeeChat]);

  // 커피챗 요청 응답
  const respondToRequest = useCallback(async (requestId: number, data: CoffeeChatRespondRequest): Promise<CoffeeChatRequest> => {
    if (!coffeeChat) {
      throw new Error('Coffee chat API not available');
    }
    try {
      const response = await coffeeChat.respondToRequest(requestId, data);
      return response;
    } catch (error) {
      console.error('Failed to respond to coffee chat request:', error);
      throw error;
    }
  }, [coffeeChat]);

  // 커피챗 연락처 조회
  const getContactInfo = useCallback(async (requestId: number): Promise<CoffeeChatContactInfo> => {
    if (!coffeeChat) {
      throw new Error('Coffee chat API not available');
    }
    try {
      setIsLoadingContactInfo(true);
      const data = await coffeeChat.getContactInfo(requestId);
      
      // API 응답을 도메인 타입으로 변환
      const contactInfo: CoffeeChatContactInfo = {
        request_id: data.request_id,
        requester_id: data.requester_id,
        recipient_id: data.recipient_id,
        status: data.status,
        requester_kakao_id: data.requester_kakao_id,
        requester_instagram_id: data.requester_instagram_id,
        recipient_kakao_id: data.recipient_kakao_id,
        recipient_instagram_id: data.recipient_instagram_id,
      };
      
      setContactInfo(contactInfo);
      return contactInfo;
    } catch (error) {
      console.error('Failed to fetch contact info:', error);
      throw error;
    } finally {
      setIsLoadingContactInfo(false);
    }
  }, [coffeeChat]);

  // 선택된 요청 관리
  const handleRequestSelect = useCallback((request: CoffeeChatRequest): void => {
    setSelectedRequest(request);
  }, []);

  const handleRequestDeselect = useCallback((): void => {
    setSelectedRequest(null);
    setContactInfo(null);
  }, []);

  // 상태 초기화
  const clearMembers = useCallback((): void => {
    setAvailableMembers([]);
    setMembersTotal(0);
  }, []);

  const clearSentRequests = useCallback((): void => {
    setSentRequests([]);
    setSentRequestsTotal(0);
  }, []);

  const clearReceivedRequests = useCallback((): void => {
    setReceivedRequests([]);
    setReceivedRequestsTotal(0);
  }, []);

  const clearContactInfo = useCallback((): void => {
    setContactInfo(null);
  }, []);

  return {
    // 상태
    availableMembers,
    sentRequests,
    receivedRequests,
    selectedRequest,
    contactInfo,
    
    // 로딩 상태
    isLoadingMembers,
    isLoadingSentRequests,
    isLoadingReceivedRequests,
    isLoadingContactInfo,
    
    // 페이지네이션
    membersTotal,
    sentRequestsTotal,
    receivedRequestsTotal,
    
    // API 함수들
    getAvailableMembers,
    createRequest,
    getSentRequests,
    getReceivedRequests,
    respondToRequest,
    getContactInfo,
    
    // 선택 관리
    handleRequestSelect,
    handleRequestDeselect,
    
    // 초기화 함수들
    clearMembers,
    clearSentRequests,
    clearReceivedRequests,
    clearContactInfo,
  };
};
