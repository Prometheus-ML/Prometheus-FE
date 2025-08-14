import { ApiClient } from './apiClient';
import type {
  GroupCreateRequest,
  GroupResponse,
  GroupListResponse,
  GroupCreateResponse,
  GroupMemberResponse,
  GroupJoinRequestResponse,
  GroupNoteCreateRequest,
  GroupNoteCreateResponse,
} from '@prometheus-fe/types';

export class GroupApi {
  private readonly api: ApiClient;
  private readonly base = '/group/groups';

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
  }

  // Group CRUD
  createGroup(data: GroupCreateRequest) {
    return this.api.post<GroupCreateResponse>(`${this.base}/`, data);
  }

  listGroups(params?: { page?: number; size?: number }) {
    const sp = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => { 
      if (v !== undefined && v !== null) sp.set(k, String(v)); 
    });
    const query = sp.toString() ? `?${sp.toString()}` : '';
    return this.api.get<GroupResponse[]>(`${this.base}/${query}`);
  }

  getGroup(groupId: number | string) {
    return this.api.get<GroupResponse>(`${this.base}/${groupId}`);
  }

  // Group Membership
  requestJoinGroup(groupId: number | string) {
    return this.api.post<{ id: number }>(`${this.base}/${groupId}/join`, {});
  }

  listGroupMembers(groupId: number | string) {
    return this.api.get<GroupMemberResponse[]>(`${this.base}/${groupId}/members`);
  }

  listJoinRequests(groupId: number | string) {
    return this.api.get<GroupJoinRequestResponse[]>(`${this.base}/${groupId}/members/requests`);
  }

  approveMember(groupId: number | string, memberId: string) {
    return this.api.post<{ id: number }>(`${this.base}/${groupId}/members/${memberId}/approve`, {});
  }

  rejectMember(groupId: number | string, memberId: string) {
    return this.api.post<{ id: number }>(`${this.base}/${groupId}/members/${memberId}/reject`, {});
  }

  // Group Notes
  createGroupNote(groupId: number | string, data: GroupNoteCreateRequest) {
    return this.api.post<GroupNoteCreateResponse>(`${this.base}/${groupId}/notes`, data);
  }
}
