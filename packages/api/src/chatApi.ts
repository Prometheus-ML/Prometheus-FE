import { ApiClient } from './apiClient';
import {
  ChatRoom,
  ChatMessage,
  ChatRoomParticipant,
  ChatRoomInvitation,
  ChatMessageCreate,
  ChatRoomCreate,
  ChatRoomInvitationCreate,
  ChatHistoryRequest,
  ChatRoomListRequest
} from '@prometheus-fe/types';
import {
  ChatRoomDto,
  ChatMessageDto,
  ChatRoomParticipantDto,
  ChatRoomInvitationDto,
  ChatMessageCreateDto,
  ChatRoomCreateDto,
  ChatRoomInvitationCreateDto,
  ChatHistoryRequestDto,
  ChatRoomListRequestDto
} from './dto/chat.dto';

export class ChatApi {
  constructor(private client: ApiClient) {}

  /**
   * 채팅방을 생성합니다.
   */
  async createChatRoom(data: ChatRoomCreate): Promise<ChatRoom> {
    const dto = new ChatRoomCreateDto(data);
    const response = await this.client.post('/chat/rooms', dto.toRequest());
    return ChatRoomDto.fromResponse(response.data);
  }

  /**
   * 사용자가 참여 중인 채팅방 목록을 조회합니다.
   */
  async getChatRooms(request: ChatRoomListRequest = {}): Promise<ChatRoom[]> {
    const dto = new ChatRoomListRequestDto(request);
    const params = dto.toQueryParams();
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/chat/rooms?${queryString}` : '/chat/rooms';
    const response = await this.client.get(endpoint);
    return response.map((room: any) => ChatRoomDto.fromResponse(room));
  }

  /**
   * 특정 채팅방 정보를 조회합니다.
   */
  async getChatRoom(chatRoomId: number): Promise<ChatRoom> {
    const response = await this.client.get(`/chat/rooms/${chatRoomId}`);
    return ChatRoomDto.fromResponse(response);
  }

  /**
   * 채팅방 상태를 조회합니다.
   */
  async getChatRoomStatus(chatRoomId: number): Promise<any> {
    const response = await this.client.get(`/chat/rooms/${chatRoomId}/status`);
    return response;
  }

  /**
   * 채팅방에 참여자를 추가합니다.
   */
  async addParticipant(chatRoomId: number, memberId: string, role: string = 'member'): Promise<boolean> {
    const response = await this.client.post(`/chat/rooms/${chatRoomId}/participants`, {
      member_id: memberId,
      role: role
    });
    return response.success || false;
  }

  /**
   * 채팅방에서 참여자를 제거합니다.
   */
  async removeParticipant(chatRoomId: number, memberId: string): Promise<boolean> {
    const response = await this.client.delete(`/chat/rooms/${chatRoomId}/participants/${memberId}`);
    return response.success || false;
  }

  /**
   * 채팅 기록을 조회합니다.
   */
  async getChatHistory(request: ChatHistoryRequest): Promise<ChatMessage[]> {
    const dto = new ChatHistoryRequestDto(request);
    const params = dto.toQueryParams();
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/chat/rooms/${request.chat_room_id}/messages?${queryString}` : `/chat/rooms/${request.chat_room_id}/messages`;
    const response = await this.client.get(endpoint);
    return response.map((message: any) => ChatMessageDto.fromResponse(message));
  }

  /**
   * 메시지를 읽음 처리합니다.
   */
  async markMessageAsRead(chatRoomId: number, messageId: number): Promise<boolean> {
    const response = await this.client.post(`/chat/rooms/${chatRoomId}/messages/read/${messageId}`, {});
    return response.success || false;
  }

  /**
   * 읽지 않은 메시지 수를 조회합니다.
   */
  async getUnreadMessageCount(chatRoomId: number): Promise<number> {
    const response = await this.client.get(`/chat/rooms/${chatRoomId}/unread-count`);
    return response.unread_count || 0;
  }

  /**
   * 채팅방 초대를 생성합니다.
   */
  async createInvitation(chatRoomId: number, data: ChatRoomInvitationCreate): Promise<ChatRoomInvitation> {
    const dto = new ChatRoomInvitationCreateDto(data);
    const response = await this.client.post(`/chat/rooms/${chatRoomId}/invitations`, dto.toRequest());
    return ChatRoomInvitationDto.fromResponse(response);
  }

  /**
   * 초대에 응답합니다.
   */
  async respondToInvitation(invitationId: number, response: 'accepted' | 'rejected'): Promise<boolean> {
    const result = await this.client.post(`/chat/invitations/${invitationId}/respond`, {
      response: response
    });
    return result.success || false;
  }

  /**
   * 웹소켓 연결 URL을 생성합니다.
   */
  getWebSocketUrl(chatRoomId: number, token: string): string {
    // ApiClient의 baseUrl을 직접 접근할 수 없으므로, 환경 변수나 설정에서 가져와야 함
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const wsBaseUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    
    // 연결 최적화를 위한 쿼리 파라미터 추가
    // optimize=true: 서버에서 즉시 연결 상태 전송
    // reconnect=true: 재연결 지원 활성화
    // heartbeat=true: 하트비트 메시지 활성화
    // transports=websocket: Socket.IO 클라이언트에서 websocket 전송만 사용 (에러 방지)
    return `${wsBaseUrl}/api/v1/chat/ws/${chatRoomId}?token=${token}&optimize=true&reconnect=true&heartbeat=true&transports=websocket`;
  }
}

/**
 * ChatApi 인스턴스를 생성합니다.
 */
export function createChatApi(client: ApiClient): ChatApi {
  return new ChatApi(client);
}
