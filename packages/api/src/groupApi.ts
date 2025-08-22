import { ApiClient } from './apiClient';
import {
  GetGroupsRequest,
  GroupJoinRequestDto,
  GroupLikeToggleRequest,
  GroupLikeToggleResponseType,
  LeaveGroupResponse,
  GetMyGroupsRequest,
  GetMyRequestsRequest,
  AdminGroupCreateRequest,
  AdminGroupCreateResponse,
  AdminGroupUpdateRequest,
  AdminGetGroupsRequest,
  AdminMemberApproveRequest,
  AdminMemberRejectRequest,
  AdminMemberRemoveRequest,
  AdminGroupDeleteResponse,
  AdminMemberRemoveResponse,
} from './dto/group.dto';
import type {
  Group,
  GroupMember,
  GroupJoinRequest,
  GroupLikeInfo,
} from '@prometheus-fe/types';

export class GroupApi {
  private readonly api: ApiClient;
  private readonly base = '/api/v1/groups';
  private readonly adminBase = '/api/v1/admin/groups';

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
  }

  // === 일반 사용자용 API ===

  // 그룹 목록 조회
  async listGroups(params?: GetGroupsRequest): Promise<Group[]> {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.size) sp.set('size', String(params.size));
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const response = await this.api.get<Group[]>(`${this.base}/${query}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching groups:', error);
      throw new Error(error.message || 'Failed to fetch groups');
    }
  }

  // 그룹 상세 조회
  async getGroup(groupId: number | string): Promise<Group> {
    try {
      const response = await this.api.get<Group>(`${this.base}/${groupId}`);
      return response;
    } catch (error: any) {
      console.error(`Error fetching group ${groupId}:`, error);
      throw new Error(error.message || 'Failed to fetch group');
    }
  }

  // 그룹 가입 요청
  async requestJoinGroup(groupId: number | string): Promise<GroupJoinRequest> {
    try {
      const response = await this.api.post<GroupJoinRequest>(`${this.base}/${groupId}/join`, {});
      return response;
    } catch (error: any) {
      console.error(`Error joining group ${groupId}:`, error);
      throw new Error(error.message || 'Failed to join group');
    }
  }

  // 그룹 멤버 목록 조회
  async listGroupMembers(groupId: number | string): Promise<GroupMember[]> {
    try {
      const response = await this.api.get<GroupMember[]>(`${this.base}/${groupId}/members`);
      return response;
    } catch (error: any) {
      console.error(`Error fetching members for group ${groupId}:`, error);
      throw new Error(error.message || 'Failed to fetch group members');
    }
  }

  // 그룹 좋아요 토글
  async toggleGroupLike(groupId: number | string): Promise<GroupLikeToggleResponseType> {
    try {
      const response = await this.api.post<GroupLikeToggleResponseType>(`${this.base}/${groupId}/like`, {});
      return response;
    } catch (error: any) {
      console.error(`Error toggling like for group ${groupId}:`, error);
      throw new Error(error.message || 'Failed to toggle group like');
    }
  }

  // 그룹 좋아요 정보 조회
  async getGroupLikes(groupId: number | string): Promise<GroupLikeInfo> {
    try {
      const response = await this.api.get<GroupLikeInfo>(`${this.base}/${groupId}/likes`);
      return response;
    } catch (error: any) {
      console.error(`Error fetching likes for group ${groupId}:`, error);
      throw new Error(error.message || 'Failed to fetch group likes');
    }
  }

  // 사용자 좋아요 여부 확인
  async checkUserLikedGroup(groupId: number | string): Promise<boolean> {
    try {
      const response = await this.api.get<{ liked: boolean }>(`${this.base}/${groupId}/like/check`);
      return response.liked;
    } catch (error: any) {
      console.error(`Error checking like status for group ${groupId}:`, error);
      return false;
    }
  }

  // 내가 속한 그룹 목록 조회
  async getMyGroups(params?: GetMyGroupsRequest): Promise<Group[]> {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.size) sp.set('size', String(params.size));
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const response = await this.api.get<Group[]>(`${this.base}/my${query}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching my groups:', error);
      throw new Error(error.message || 'Failed to fetch my groups');
    }
  }

  // 내 가입 신청 목록 조회
  async getMyRequests(params?: GetMyRequestsRequest): Promise<GroupJoinRequest[]> {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.size) sp.set('size', String(params.size));
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const response = await this.api.get<GroupJoinRequest[]>(`${this.base}/my/requests${query}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching my requests:', error);
      throw new Error(error.message || 'Failed to fetch my requests');
    }
  }

  // 특정 그룹에서 내 정보 조회
  async getMyGroupInfo(groupId: number | string): Promise<GroupMember> {
    try {
      const response = await this.api.get<GroupMember>(`${this.base}/${groupId}/my`);
      return response;
    } catch (error: any) {
      console.error(`Error fetching my info for group ${groupId}:`, error);
      throw new Error(error.message || 'Failed to fetch my group info');
    }
  }

  // === 관리자용 API ===

  // 관리자용 그룹 생성
  async createGroup(data: AdminGroupCreateRequest): Promise<AdminGroupCreateResponse> {
    try {
      const response = await this.api.post<AdminGroupCreateResponse>(`${this.adminBase}`, data);
      return response;
    } catch (error: any) {
      console.error('Error creating group:', error);
      throw new Error(error.message || 'Failed to create group');
    }
  }

  // 관리자용 그룹 목록 조회
  async listGroupsAdmin(params?: AdminGetGroupsRequest): Promise<Group[]> {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.size) sp.set('size', String(params.size));
      if (params?.gen) sp.set('gen', String(params.gen));
      if (params?.status) sp.set('status', params.status);
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const response = await this.api.get<Group[]>(`${this.adminBase}${query}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching groups (admin):', error);
      throw new Error(error.message || 'Failed to fetch groups');
    }
  }

  // 관리자용 그룹 상세 조회
  async getGroupAdmin(groupId: number | string): Promise<Group> {
    try {
      const response = await this.api.get<Group>(`${this.adminBase}/${groupId}`);
      return response;
    } catch (error: any) {
      console.error(`Error fetching group ${groupId} (admin):`, error);
      throw new Error(error.message || 'Failed to fetch group');
    }
  }

  // 관리자용 그룹 수정
  async updateGroupAdmin(groupId: number | string, data: AdminGroupUpdateRequest): Promise<Group> {
    try {
      const response = await this.api.put<Group>(`${this.adminBase}/${groupId}`, data);
      return response;
    } catch (error: any) {
      console.error(`Error updating group ${groupId}:`, error);
      throw new Error(error.message || 'Failed to update group');
    }
  }

  // 관리자용 그룹 삭제
  async deleteGroupAdmin(groupId: number | string): Promise<AdminGroupDeleteResponse> {
    try {
      const response = await this.api.delete<AdminGroupDeleteResponse>(`${this.adminBase}/${groupId}`);
      return response;
    } catch (error: any) {
      console.error(`Error deleting group ${groupId}:`, error);
      throw new Error(error.message || 'Failed to delete group');
    }
  }

  // Group Leave
  async leaveGroup(groupId: number | string): Promise<LeaveGroupResponse> {
    try {
      const response = await this.api.post<LeaveGroupResponse>(`${this.base}/${groupId}/leave`, {});
      return response;
    } catch (error: any) {
      console.error(`Error leaving group ${groupId}:`, error);
      throw new Error(error.message || 'Failed to leave group');
    }
  }

  // 관리자용 그룹 멤버 목록 조회
  async listGroupMembersAdmin(groupId: number | string, params?: { page?: number; size?: number }): Promise<GroupMember[]> {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.size) sp.set('size', String(params.size));
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const response = await this.api.get<GroupMember[]>(`${this.adminBase}/${groupId}/members${query}`);
      return response;
    } catch (error: any) {
      console.error(`Error fetching members for group ${groupId} (admin):`, error);
      throw new Error(error.message || 'Failed to fetch group members');
    }
  }

  // 관리자용 가입요청 목록 조회
  async listJoinRequestsAdmin(groupId: number | string, params?: { page?: number; size?: number }): Promise<GroupJoinRequest[]> {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.size) sp.set('size', String(params.size));
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const response = await this.api.get<GroupJoinRequest[]>(`${this.adminBase}/${groupId}/members/requests${query}`);
      return response;
    } catch (error: any) {
      console.error(`Error fetching join requests for group ${groupId} (admin):`, error);
      throw new Error(error.message || 'Failed to fetch join requests');
    }
  }

  // 관리자용 가입 승인
  async approveMemberAdmin(groupId: number | string, memberId: string): Promise<GroupMember> {
    try {
      const response = await this.api.post<GroupMember>(`${this.adminBase}/${groupId}/members/${memberId}/approve`, {});
      return response;
    } catch (error: any) {
      console.error(`Error approving member ${memberId} for group ${groupId}:`, error);
      throw new Error(error.message || 'Failed to approve member');
    }
  }

  // 관리자용 가입 거절
  async rejectMemberAdmin(groupId: number | string, memberId: string): Promise<void> {
    try {
      await this.api.post(`${this.adminBase}/${groupId}/members/${memberId}/reject`, {});
    } catch (error: any) {
      console.error(`Error rejecting member ${memberId} for group ${groupId}:`, error);
      throw new Error(error.message || 'Failed to reject member');
    }
  }

  // 관리자용 그룹 멤버 제거
  async removeMemberAdmin(groupId: number | string, memberId: string): Promise<AdminMemberRemoveResponse> {
    try {
      const response = await this.api.delete<AdminMemberRemoveResponse>(`${this.adminBase}/${groupId}/members/${memberId}`);
      return response;
    } catch (error: any) {
      console.error(`Error removing member ${memberId} from group ${groupId}:`, error);
      throw new Error(error.message || 'Failed to remove member');
    }
  }
}
