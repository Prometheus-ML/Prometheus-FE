// // 커피챗 요청 생성
// export interface CoffeeChatRequestCreate {
//   recipient_id: string;
//   message?: string | null;
// }

// // 커피챗 요청 응답
// export interface CoffeeChatRequestResponse {
//   id: number;
//   requester_id: string;
//   recipient_id: string;
//   status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
//   message?: string | null;
//   response_message?: string | null;
//   requested_at: string; // ISO
//   responded_at?: string | null; // ISO
//   requester_name: string;
//   requester_gen?: number | null;
//   requester_school?: string | null;
//   requester_major?: string | null;
//   recipient_name: string;
//   recipient_gen?: number | null;
//   recipient_school?: string | null;
//   recipient_major?: string | null;
// }

// // 커피챗 요청 목록 응답
// export interface CoffeeChatRequestListResponse {
//   requests: CoffeeChatRequestResponse[];
//   total: number;
//   page: number;
//   size: number;
// }

// // 커피챗 요청 응답
// export interface CoffeeChatResponseRequest {
//   status: 'accepted' | 'rejected';
//   response_message?: string | null;
// }

// // 커피챗 연락처 정보 응답
// export interface CoffeeChatContactInfoResponse {
//   request_id: number;
//   requester_id: string;
//   recipient_id: string;
//   status: string;
//   requester_kakao_id?: string | null;
//   requester_instagram_id?: string | null;
//   recipient_kakao_id?: string | null;
//   recipient_instagram_id?: string | null;
// }

// // 커피챗 가능 사용자 응답
// export interface CoffeeChatAvailableUserResponse {
//   id: string;
//   name: string;
//   gen?: number | null;
//   school?: string | null;
//   major?: string | null;
//   mbti?: string | null;
//   self_introduction?: string | null;
//   profile_image_url?: string | null;
// }

// // 커피챗 가능 사용자 목록 응답
// export interface CoffeeChatAvailableUserListResponse {
//   users: CoffeeChatAvailableUserResponse[];
//   total: number;
//   page: number;
//   size: number;
// }


