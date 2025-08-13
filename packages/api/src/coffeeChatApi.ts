import { ApiClient } from './apiClient';
import type {
  CoffeeChatAvailableUserListResponse,
  CoffeeChatRequestListResponse,
  CoffeeChatRequestResponse,
  CoffeeChatContactInfoResponse,
} from '@prometheus-fe/types';

export class CoffeeChatApi {
  private readonly api: ApiClient;
  private readonly base = '/users/coffee-chats';

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
  }

  getAvailableUsers(params?: Record<string, string | number | undefined>) {
    const sp = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) sp.set(k, String(v));
    });
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return this.api.get<CoffeeChatAvailableUserListResponse>(`${this.base}/available-users${q}`);
  }

  createRequest(payload: { recipient_id: string; message?: string | null }) {
    return this.api.post<CoffeeChatRequestResponse>(`${this.base}/requests`, payload);
  }

  getSentRequests(params?: Record<string, string | number | undefined>) {
    const sp = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) sp.set(k, String(v));
    });
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return this.api.get<CoffeeChatRequestListResponse>(`${this.base}/requests/sent${q}`);
  }

  getReceivedRequests(params?: Record<string, string | number | undefined>) {
    const sp = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) sp.set(k, String(v));
    });
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return this.api.get<CoffeeChatRequestListResponse>(`${this.base}/requests/received${q}`);
  }

  respondRequest(requestId: number | string, payload: { status: 'accepted' | 'rejected'; response_message?: string | null }) {
    return this.api.put<CoffeeChatRequestResponse>(`${this.base}/requests/${requestId}/respond`, payload);
  }

  getContactInfo(requestId: number | string) {
    return this.api.get<CoffeeChatContactInfoResponse>(`${this.base}/requests/${requestId}/contact-info`);
  }
}


