export interface ChatRoom {
  id: number;
  name?: string;
  room_type: 'group' | 'coffee_chat';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  group_id?: number;
  coffee_chat_id?: number;
  participant_count: number;
  last_message?: ChatMessage;
}

export interface ChatMessage {
  id: number;
  chat_room_id: number;
  sender_id: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  content: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  sender_name?: string;
  sender_profile_image?: string;
}

export interface ChatRoomParticipant {
  id: number;
  chat_room_id: number;
  member_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  left_at?: string;
  is_active: boolean;
  member_name?: string;
  member_profile_image?: string;
}

export interface ChatRoomInvitation {
  id: number;
  chat_room_id: number;
  inviter_id: string;
  invitee_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  message?: string;
  expires_at?: string;
  created_at: string;
  responded_at?: string;
  inviter_name?: string;
  invitee_name?: string;
}

export interface ChatMessageCreate {
  content: string;
  message_type?: 'text' | 'image' | 'file' | 'system';
  file_url?: string;
  file_name?: string;
  file_size?: number;
}

export interface ChatRoomCreate {
  name?: string;
  room_type: 'group' | 'coffee_chat';
  group_id?: number;
  coffee_chat_id?: number;
}

export interface ChatRoomInvitationCreate {
  invitee_id: string;
  message?: string;
  expires_at?: string;
}

export interface ChatHistoryRequest {
  chat_room_id: number;
  limit?: number;
  offset?: number;
  before_message_id?: number;
}

export interface ChatRoomListRequest {
  room_type?: 'group' | 'coffee_chat';
  is_active?: boolean;
  limit?: number;
  offset?: number;
}

export interface WebSocketMessage {
  type: string;
  chat_room_id: number;
  sender_id: string;
  content?: string;
  message_type?: 'text' | 'image' | 'file' | 'system';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  timestamp?: string;
}

export interface WebSocketResponse {
  type: string;
  success: boolean;
  message?: string;
  data?: any;
  timestamp: string;
}

export interface ChatConnectionStatus {
  type: 'connection_status';
  status: 'connected' | 'disconnected' | 'error';
  chat_room_id: number;
  timestamp: string;
}

export interface TypingIndicator {
  type: 'typing';
  chat_room_id: number;
  sender_id: string;
  is_typing: boolean;
}

export interface ReadReceipt {
  type: 'read_receipt';
  message_id: number;
  sender_id: string;
}

export type ChatWebSocketEvent = 
  | ChatMessage 
  | ChatConnectionStatus 
  | TypingIndicator 
  | ReadReceipt 
  | WebSocketResponse;
