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
}
