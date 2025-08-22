import {
  ChatRoom,
  ChatMessage,
  ChatRoomParticipant,
  ChatRoomInvitation,
  ChatMessageCreate,
  ChatRoomCreate,
  ChatRoomInvitationCreate,
  ChatHistoryRequest,
  ChatRoomListRequest,
  WebSocketMessage,
  WebSocketResponse
} from '@prometheus-fe/types';

export class ChatRoomDto implements ChatRoom {
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

  constructor(data: ChatRoom) {
    this.id = data.id;
    this.name = data.name;
    this.room_type = data.room_type;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.group_id = data.group_id;
    this.coffee_chat_id = data.coffee_chat_id;
    this.participant_count = data.participant_count;
    this.last_message = data.last_message;
  }

  static fromResponse(data: any): ChatRoomDto {
    return new ChatRoomDto({
      id: data.id,
      name: data.name,
      room_type: data.room_type,
      is_active: data.is_active,
      created_at: data.created_at,
      updated_at: data.updated_at,
      group_id: data.group_id,
      coffee_chat_id: data.coffee_chat_id,
      participant_count: data.participant_count || 0,
      last_message: data.last_message ? ChatMessageDto.fromResponse(data.last_message) : undefined
    });
  }
}

export class ChatMessageDto implements ChatMessage {
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

  constructor(data: ChatMessage) {
    this.id = data.id;
    this.chat_room_id = data.chat_room_id;
    this.sender_id = data.sender_id;
    this.message_type = data.message_type;
    this.content = data.content;
    this.file_url = data.file_url;
    this.file_name = data.file_name;
    this.file_size = data.file_size;
    this.is_deleted = data.is_deleted;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.sender_name = data.sender_name;
    this.sender_profile_image = data.sender_profile_image;
  }

  static fromResponse(data: any): ChatMessageDto {
    return new ChatMessageDto({
      id: data.id,
      chat_room_id: data.chat_room_id,
      sender_id: data.sender_id,
      message_type: data.message_type,
      content: data.content,
      file_url: data.file_url,
      file_name: data.file_name,
      file_size: data.file_size,
      is_deleted: data.is_deleted,
      created_at: data.created_at,
      updated_at: data.updated_at,
      sender_name: data.sender_name,
      sender_profile_image: data.sender_profile_image
    });
  }
}

export class ChatRoomParticipantDto implements ChatRoomParticipant {
  id: number;
  chat_room_id: number;
  member_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  left_at?: string;
  is_active: boolean;
  member_name?: string;
  member_profile_image?: string;

  constructor(data: ChatRoomParticipant) {
    this.id = data.id;
    this.chat_room_id = data.chat_room_id;
    this.member_id = data.member_id;
    this.role = data.role;
    this.joined_at = data.joined_at;
    this.left_at = data.left_at;
    this.is_active = data.is_active;
    this.member_name = data.member_name;
    this.member_profile_image = data.member_profile_image;
  }

  static fromResponse(data: any): ChatRoomParticipantDto {
    return new ChatRoomParticipantDto({
      id: data.id,
      chat_room_id: data.chat_room_id,
      member_id: data.member_id,
      role: data.role,
      joined_at: data.joined_at,
      left_at: data.left_at,
      is_active: data.is_active,
      member_name: data.member_name,
      member_profile_image: data.member_profile_image
    });
  }
}

export class ChatRoomInvitationDto implements ChatRoomInvitation {
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

  constructor(data: ChatRoomInvitation) {
    this.id = data.id;
    this.chat_room_id = data.chat_room_id;
    this.inviter_id = data.inviter_id;
    this.invitee_id = data.invitee_id;
    this.status = data.status;
    this.message = data.message;
    this.expires_at = data.expires_at;
    this.created_at = data.created_at;
    this.responded_at = data.responded_at;
    this.inviter_name = data.inviter_name;
    this.invitee_name = data.invitee_name;
  }

  static fromResponse(data: any): ChatRoomInvitationDto {
    return new ChatRoomInvitationDto({
      id: data.id,
      chat_room_id: data.chat_room_id,
      inviter_id: data.inviter_id,
      invitee_id: data.invitee_id,
      status: data.status,
      message: data.message,
      expires_at: data.expires_at,
      created_at: data.created_at,
      responded_at: data.responded_at,
      inviter_name: data.inviter_name,
      invitee_name: data.invitee_name
    });
  }
}

export class ChatMessageCreateDto implements ChatMessageCreate {
  content: string;
  message_type?: 'text' | 'image' | 'file' | 'system';
  file_url?: string;
  file_name?: string;
  file_size?: number;

  constructor(data: ChatMessageCreate) {
    this.content = data.content;
    this.message_type = data.message_type || 'text';
    this.file_url = data.file_url;
    this.file_name = data.file_name;
    this.file_size = data.file_size;
  }

  toRequest(): any {
    return {
      content: this.content,
      message_type: this.message_type,
      file_url: this.file_url,
      file_name: this.file_name,
      file_size: this.file_size
    };
  }
}

export class ChatRoomCreateDto implements ChatRoomCreate {
  name?: string;
  room_type: 'group' | 'coffee_chat';
  group_id?: number;
  coffee_chat_id?: number;

  constructor(data: ChatRoomCreate) {
    this.name = data.name;
    this.room_type = data.room_type;
    this.group_id = data.group_id;
    this.coffee_chat_id = data.coffee_chat_id;
  }

  toRequest(): any {
    return {
      name: this.name,
      room_type: this.room_type,
      group_id: this.group_id,
      coffee_chat_id: this.coffee_chat_id
    };
  }
}

export class ChatRoomInvitationCreateDto implements ChatRoomInvitationCreate {
  invitee_id: string;
  message?: string;
  expires_at?: string;

  constructor(data: ChatRoomInvitationCreate) {
    this.invitee_id = data.invitee_id;
    this.message = data.message;
    this.expires_at = data.expires_at;
  }

  toRequest(): any {
    return {
      invitee_id: this.invitee_id,
      message: this.message,
      expires_at: this.expires_at
    };
  }
}

export class ChatHistoryRequestDto implements ChatHistoryRequest {
  chat_room_id: number;
  limit?: number;
  offset?: number;
  before_message_id?: number;

  constructor(data: ChatHistoryRequest) {
    this.chat_room_id = data.chat_room_id;
    this.limit = data.limit || 50;
    this.offset = data.offset || 0;
    this.before_message_id = data.before_message_id;
  }

  toQueryParams(): Record<string, string> {
    const params: Record<string, string> = {
      limit: this.limit!.toString(),
      offset: this.offset!.toString()
    };
    
    if (this.before_message_id) {
      params.before_message_id = this.before_message_id.toString();
    }
    
    return params;
  }
}

export class ChatRoomListRequestDto implements ChatRoomListRequest {
  room_type?: 'group' | 'coffee_chat';
  is_active?: boolean;
  limit?: number;
  offset?: number;

  constructor(data: ChatRoomListRequest) {
    this.room_type = data.room_type;
    this.is_active = data.is_active;
    this.limit = data.limit || 20;
    this.offset = data.offset || 0;
  }

  toQueryParams(): Record<string, string> {
    const params: Record<string, string> = {
      limit: this.limit!.toString(),
      offset: this.offset!.toString()
    };
    
    if (this.room_type) {
      params.room_type = this.room_type;
    }
    
    if (this.is_active !== undefined) {
      params.is_active = this.is_active.toString();
    }
    
    return params;
  }
}

export class WebSocketMessageDto implements WebSocketMessage {
  type: string;
  chat_room_id: number;
  sender_id: string;
  content?: string;
  message_type?: 'text' | 'image' | 'file' | 'system';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  timestamp?: string;

  constructor(data: WebSocketMessage) {
    this.type = data.type;
    this.chat_room_id = data.chat_room_id;
    this.sender_id = data.sender_id;
    this.content = data.content;
    this.message_type = data.message_type;
    this.file_url = data.file_url;
    this.file_name = data.file_name;
    this.file_size = data.file_size;
    this.timestamp = data.timestamp || new Date().toISOString();
  }

  toWebSocketMessage(): string {
    return JSON.stringify(this);
  }
}
