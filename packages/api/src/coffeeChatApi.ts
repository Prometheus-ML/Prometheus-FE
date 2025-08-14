import { ApiClient } from './apiClient';
import type {
  CoffeeChatAvailableUserListResponse,
  CoffeeChatRequestListResponse,
  CoffeeChatRequestResponse,
  CoffeeChatContactInfoResponse,
  CoffeeChatRequestCreate,
  CoffeeChatResponseRequest,
} from '@prometheus-fe/types';

export class CoffeeChatApi {
  private readonly api: ApiClient;
  private readonly base = '/users/coffee-chats';

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
  }

  // 커피챗 가능 사용자 목록
  getAvailableUsers(params?: {
    page?: number;
    size?: number;
    search?: string;
    gen_filter?: number;
  }) {
    const sp = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) sp.set(k, String(v));
    });
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return this.api.get<CoffeeChatAvailableUserListResponse>(`${this.base}/available-users${q}`);
  }

  // 커피챗 요청 생성
  createRequest(payload: CoffeeChatRequestCreate) {
    return this.api.post<CoffeeChatRequestResponse>(`${this.base}/requests`, payload);
  }

  // 내가 보낸 커피챗 요청 목록
  getSentRequests(params?: {
    page?: number;
    size?: number;
    status_filter?: string;
  }) {
    const sp = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) sp.set(k, String(v));
    });
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return this.api.get<CoffeeChatRequestListResponse>(`${this.base}/requests/sent${q}`);
  }

  // 내가 받은 커피챗 요청 목록
  getReceivedRequests(params?: {
    page?: number;
    size?: number;
    status_filter?: string;
  }) {
    const sp = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) sp.set(k, String(v));
    });
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return this.api.get<CoffeeChatRequestListResponse>(`${this.base}/requests/received${q}`);
  }

  // 커피챗 요청 응답
  respondRequest(requestId: number | string, payload: CoffeeChatResponseRequest) {
    return this.api.put<CoffeeChatRequestResponse>(`${this.base}/requests/${requestId}/respond`, payload);
  }

  // 커피챗 연락처 조회
  getContactInfo(requestId: number | string) {
    return this.api.get<CoffeeChatContactInfoResponse>(`${this.base}/requests/${requestId}/contact-info`);
  }
}


