// 커피챗 API DTO

// 커피챗 가능 멤버 목록 조회 응답
export interface CoffeeChatAvailableMembersResponse {
  members: {
    id: string;
    name: string;
    gen: number | null;
    school: string | null;
    major: string | null;
    mbti: string | null;
    self_introduction: string | null;
    profile_image_url: string | null;
  }[];
  total: number;
  page: number;
  size: number;
}

// 커피챗 요청 생성 요청
export interface CoffeeChatCreateRequestDto {
  recipient_id: string;
  message: string | null;
}

// 커피챗 요청 응답
export interface CoffeeChatRequestResponseDto {
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

// 커피챗 요청 목록 응답
export interface CoffeeChatRequestListResponseDto {
  requests: CoffeeChatRequestResponseDto[];
  total: number;
  page: number;
  size: number;
}

// 커피챗 요청 응답 요청
export interface CoffeeChatRespondRequestDto {
  status: 'accepted' | 'rejected';
  response_message: string | null;
}

// 커피챗 연락처 정보 응답
export interface CoffeeChatContactInfoResponseDto {
  request_id: number;
  requester_id: string;
  recipient_id: string;
  status: string;
  requester_kakao_id: string | null;
  requester_instagram_id: string | null;
  recipient_kakao_id: string | null;
  recipient_instagram_id: string | null;
}
