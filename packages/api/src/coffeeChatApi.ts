import { ApiClient } from './apiClient';
import {
  CoffeeChatAvailableMembersResponse,
  CoffeeChatCreateRequestDto,
  CoffeeChatRequestResponseDto,
  CoffeeChatRequestListResponseDto,
  CoffeeChatRespondRequestDto,
  CoffeeChatContactInfoResponseDto
} from './dto/coffeeChat.dto';

export class CoffeeChatApi {
  private readonly api: ApiClient;
  private readonly base = '/members/coffee-chats';

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
  }

  // 커피챗 가능 멤버 목록 조회
  async getAvailableMembers(params?: any): Promise<CoffeeChatAvailableMembersResponse> {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.size) sp.set('size', String(params.size));
      if (params?.search) sp.set('search', params.search);
      if (params?.gen_filter) sp.set('gen_filter', String(params.gen_filter));
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const response = await this.api.get<CoffeeChatAvailableMembersResponse>(`${this.base}/available-members${query}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching available members:', error);
      throw new Error(error.message || 'Failed to fetch available members');
    }
  }

  // 커피챗 요청 생성
  async createRequest(data: CoffeeChatCreateRequestDto): Promise<CoffeeChatRequestResponseDto> {
    try {
      const response = await this.api.post<CoffeeChatRequestResponseDto>(`${this.base}/requests`, data);
      return response;
    } catch (error: any) {
      console.error('Error creating coffee chat request:', error);
      throw new Error(error.message || 'Failed to create coffee chat request');
    }
  }

  // 내가 보낸 커피챗 요청 목록
  async getSentRequests(params?: any): Promise<CoffeeChatRequestListResponseDto> {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.size) sp.set('size', String(params.size));
      if (params?.status_filter) sp.set('status_filter', params.status_filter);
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const response = await this.api.get<CoffeeChatRequestListResponseDto>(`${this.base}/requests/sent${query}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching sent requests:', error);
      throw new Error(error.message || 'Failed to fetch sent requests');
    }
  }

  // 내가 받은 커피챗 요청 목록
  async getReceivedRequests(params?: any): Promise<CoffeeChatRequestListResponseDto> {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.size) sp.set('size', String(params.size));
      if (params?.status_filter) sp.set('status_filter', params.status_filter);
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const response = await this.api.get<CoffeeChatRequestListResponseDto>(`${this.base}/requests/received${query}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching received requests:', error);
      throw new Error(error.message || 'Failed to fetch received requests');
    }
  }

  // 커피챗 요청 응답
  async respondToRequest(requestId: number, data: CoffeeChatRespondRequestDto): Promise<CoffeeChatRequestResponseDto> {
    try {
      const response = await this.api.put<CoffeeChatRequestResponseDto>(`${this.base}/requests/${requestId}/respond`, data);
      return response;
    } catch (error: any) {
      console.error(`Error responding to coffee chat request ${requestId}:`, error);
      throw new Error(error.message || 'Failed to respond to coffee chat request');
    }
  }

  // 커피챗 연락처 조회
  async getContactInfo(requestId: number): Promise<CoffeeChatContactInfoResponseDto> {
    try {
      const response = await this.api.get<CoffeeChatContactInfoResponseDto>(`${this.base}/requests/${requestId}/contact-info`);
      return response;
    } catch (error: any) {
      console.error(`Error fetching contact info for request ${requestId}:`, error);
      throw new Error(error.message || 'Failed to fetch contact info');
    }
  }
}


