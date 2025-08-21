import { ApiClient } from './apiClient';
import type {
  MemberListRequest,
  MemberListResponse,
  MemberResponse,
  MemberCreateRequest,
  MemberUpdateRequest,
  MemberDeleteResponse,
  BulkMemberCreateRequest,
  BulkMemberCreateResponse,
  BulkMemberUpdateRequest,
  BulkMemberUpdateResponse,
  MemberStatsResponse
} from '@prometheus-fe/types';

export class MemberApi {
  private readonly api: ApiClient;
  private readonly adminBase = '/admin/members';
  private readonly base = '/members';

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
  }

  // 1. 멤버 목록 조회
  getMemberList(params?: MemberListRequest) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.size) searchParams.set('size', String(params.size));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.grant_filter) searchParams.set('grant_filter', params.grant_filter);
    if (params?.gen_filter !== undefined) searchParams.set('gen_filter', String(params.gen_filter));
    if (params?.status_filter) searchParams.set('status_filter', params.status_filter);
    if (params?.active_gens_filter) searchParams.set('active_gens_filter', params.active_gens_filter);
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.api.get<MemberListResponse>(`${this.adminBase}/list${query}`);
  }

  // 2. 멤버 상세 정보 조회
  getMember(memberId: string) {
    return this.api.get<MemberResponse>(`${this.adminBase}/${memberId}`);
  }

  // 3. 멤버 생성
  createMember(data: MemberCreateRequest) {
    return this.api.post<MemberResponse>(`${this.adminBase}/create`, data);
  }

  // 4. 멤버 정보 업데이트
  updateMember(memberId: string, data: MemberUpdateRequest) {
    return this.api.put<MemberResponse>(`${this.adminBase}/update/${memberId}`, data);
  }

  // 5. 멤버 삭제
  deleteMember(memberId: string) {
    return this.api.delete<MemberDeleteResponse>(`${this.adminBase}/delete/${memberId}`);
  }

  // 6. 대량 멤버 생성
  bulkCreateMembers(data: BulkMemberCreateRequest) {
    return this.api.post<BulkMemberCreateResponse>(`${this.adminBase}/bulk-create`, data);
  }

  // 7. 대량 멤버 업데이트
  bulkUpdateMembers(data: BulkMemberUpdateRequest) {
    return this.api.post<BulkMemberUpdateResponse>(`${this.adminBase}/bulk-update`, data);
  }

  // 8. 멤버 통계 조회
  getMemberStats() {
    return this.api.get<MemberStatsResponse>(`${this.adminBase}/stats`);
  }

  // ===== 일반 사용자용 API =====

  // 9. 멤버 검색 (공개)
  searchMembers(params?: { q?: string; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.set('q', params.q);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.api.get<any[]>(`${this.base}/ids${query}`);
  }

  // 10. 공개 멤버 목록 조회
  getPublicMembers(params?: any) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.size) searchParams.set('size', String(params.size));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.executive !== undefined) searchParams.set('executive', String(params.executive));
    if (params?.gen !== undefined) searchParams.set('gen', String(params.gen));
    if (params?.mbti) searchParams.set('mbti', params.mbti);
    if (params?.school) searchParams.set('school', params.school);
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.api.get<any>(`${this.base}/list/public${query}`);
  }

  // 11. 인증된 사용자용 멤버 목록 조회
  getPrivateMembers(params?: any) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.size) searchParams.set('size', String(params.size));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.executive !== undefined) searchParams.set('executive', String(params.executive));
    if (params?.gen !== undefined) searchParams.set('gen', String(params.gen));
    if (params?.mbti) searchParams.set('mbti', params.mbti);
    if (params?.school) searchParams.set('school', params.school);
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.api.get<any>(`${this.base}/list/private${query}`);
  }

  // 12. 내 프로필 조회
  me() {
    return this.api.get<any>(`${this.base}/me`);
  }

  // 13. 내 프로필 수정
  updateMe(payload: any) {
    return this.api.put<any>(`${this.base}/me`, payload);
  }

  // 14. 멤버 상세 정보 조회 (일반 사용자용)
  getMemberDetail(memberId: string) {
    return this.api.get<any>(`${this.base}/${memberId}`);
  }

  // 15. 멤버 프로젝트 목록 조회
  getMemberProjects(memberId: string) {
    return this.api.get<any[]>(`${this.base}/${memberId}/projects`);
  }

  // 16. 멤버 게시글 목록 조회
  getMemberPosts(memberId: string) {
    return this.api.get<any[]>(`${this.base}/${memberId}/posts`);
  }
}
