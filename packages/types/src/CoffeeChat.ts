export interface CoffeeChatRequestCreate {
  recipient_id: string;
  message?: string | null;
}

export interface CoffeeChatRequestResponse {
  id: number;
  requester_id: string;
  recipient_id: string;
  status: string; // pending, accepted, rejected, cancelled
  message?: string | null;
  response_message?: string | null;
  requested_at: string; // ISO
  responded_at?: string | null; // ISO
  requester_name: string;
  requester_gen?: number | null;
  requester_school?: string | null;
  requester_major?: string | null;
  recipient_name: string;
  recipient_gen?: number | null;
  recipient_school?: string | null;
  recipient_major?: string | null;
}

export interface CoffeeChatRequestListResponse {
  requests: CoffeeChatRequestResponse[];
  total: number;
  page: number;
  size: number;
}

export interface CoffeeChatResponseRequest {
  status: 'accepted' | 'rejected';
  response_message?: string | null;
}

export interface CoffeeChatContactInfoResponse {
  request_id: number;
  requester_id: string;
  recipient_id: string;
  status: string;
  requester_kakao_id?: string | null;
  requester_instagram_id?: string | null;
  recipient_kakao_id?: string | null;
  recipient_instagram_id?: string | null;
}

export interface CoffeeChatAvailableUserResponse {
  id: string;
  name: string;
  gen?: number | null;
  school?: string | null;
  major?: string | null;
  mbti?: string | null;
  self_introduction?: string | null;
  profile_image_url?: string | null;
}

export interface CoffeeChatAvailableUserListResponse {
  users: CoffeeChatAvailableUserResponse[];
  total: number;
  page: number;
  size: number;
}


