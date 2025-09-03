// 커피챗 관련 타입 정의

export interface CoffeeChatMember {
  id: string;
  name: string;
  gen: number | null;
  school: string | null;
  major: string | null;
  mbti: string | null;
  self_introduction: string | null;
  profile_image_url: string | null;
}

export interface CoffeeChatRequest {
  id: number;
  requester_id: string;
  recipient_id: string;
  status: string;
  message: string | null;
  response_message: string | null;
  requested_at: string;
  responded_at: string | null;
  requester_name: string;
  requester_gen: number | null;
  requester_school: string | null;
  requester_major: string | null;
  recipient_name: string;
  recipient_gen: number | null;
  recipient_school: string | null;
  recipient_major: string | null;
}

export interface CoffeeChatContactInfo {
  request_id: number;
  requester_id: string;
  recipient_id: string;
  status: string;
  requester_kakao_id: string | null;
  requester_instagram_id: string | null;
  recipient_kakao_id: string | null;
  recipient_instagram_id: string | null;
}

export interface ChatRoomInfo {
  id: number;
  name: string;
  room_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  coffee_chat_id: number | null;
}

export interface CoffeeChatRespondResponse {
  coffee_chat_request: CoffeeChatRequest;
  chat_room_created: boolean;
  chat_room: ChatRoomInfo | null;
}

export type CoffeeChatStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface CoffeeChatListParams {
  page?: number;
  size?: number;
  search?: string;
  gen_filter?: number;
  status_filter?: CoffeeChatStatus;
}

export interface CoffeeChatListResponse {
  members?: CoffeeChatMember[];
  requests?: CoffeeChatRequest[];
  total: number;
  page: number;
  size: number;
}

export interface CoffeeChatCreateRequest {
  recipient_id: string;
  message: string | null;
}

export interface CoffeeChatRespondRequest {
  status: 'accepted' | 'rejected';
  response_message: string | null;
}


