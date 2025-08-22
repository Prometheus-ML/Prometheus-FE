import { ApiClient } from './apiClient';
import {
  GroupCreateRequest,
  GroupCreateResponse,
  GroupUpdateRequest,
  GroupUpdateResponse,
  GetGroupsRequest,
  GetGroupsResponse,
  GroupNoteCreateRequest,
  GroupNoteCreateResponse,
  GroupLikeToggleRequest,
  GroupLikeToggleResponseType,
  GetGroupLikesResponse,
  CheckUserLikedGroupResponse,
  GroupDeleteResponse,
  LeaveGroupResponse,
} from './dto/group.dto';
import type {
  Group,
  GroupMember,
  GroupJoinRequest,
  GroupNote,
  GroupLikeInfo,
} from '@prometheus-fe/types';

export class GroupApi {
  private readonly api: ApiClient;
  private readonly base = '/group/groups';

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
  }

  // Group CRUD
  async createGroup(data: GroupCreateRequest): Promise<GroupCreateResponse> {
    try {
      // deadline 필드가 포함된 그룹 생성 요청
      const response = await this.api.post<GroupCreateResponse>(`${this.base}/`, data);
      return response;
    } catch (error: any) {
      console.error('Error creating group:', error);
      throw new Error(error.message || 'Failed to create group');
    }
  }

  async listGroups(params?: GetGroupsRequest): Promise<Group[] | GetGroupsResponse> {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.size) sp.set('size', String(params.size));
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const response = await this.api.get<Group[] | GetGroupsResponse>(`${this.base}/${query}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching groups:', error);
      throw new Error(error.message || 'Failed to fetch groups');
    }
  }

  async getGroup(groupId: number | string): Promise<Group> {
    try {
      const response = await this.api.get<Group>(`${this.base}/${groupId}`);
      return response;
    } catch (error: any) {
      console.error(`Error fetching group ${groupId}:`, error);
      throw new Error(error.message || 'Failed to fetch group');
    }
  }

  // Group Membership
  async requestJoinGroup(groupId: number | string): Promise<GroupJoinRequest> {
    try {
      const response = await this.api.post<GroupJoinRequest>(`${this.base}/${groupId}/join`, {});
      return response;
    } catch (error: any) {
      console.error(`Error joining group ${groupId}:`, error);
      throw new Error(error.message || 'Failed to join group');
    }
  }

  async listGroupMembers(groupId: number | string): Promise<GroupMember[]> {
    try {
      const response = await this.api.get<GroupMember[]>(`${this.base}/${groupId}/members`);
      return response;
    } catch (error: any) {
      console.error(`Error fetching members for group ${groupId}:`, error);
      throw new Error(error.message || 'Failed to fetch group members');
    }
  }

  async listJoinRequests(groupId: number | string): Promise<GroupJoinRequest[]> {
    try {
      const response = await this.api.get<GroupJoinRequest[]>(`${this.base}/${groupId}/members/requests`);
      return response;
    } catch (error: any) {
      console.error(`Error fetching join requests for group ${groupId}:`, error);
      throw new Error(error.message || 'Failed to fetch join requests');
    }
  }

  async approveMember(groupId: number | string, memberId: string): Promise<GroupMember> {
    try {
      const response = await this.api.post<GroupMember>(`${this.base}/${groupId}/members/${memberId}/approve`, {});
      return response;
    } catch (error: any) {
      console.error(`Error approving member ${memberId} for group ${groupId}:`, error);
      throw new Error(error.message || 'Failed to approve member');
    }
  }

  async rejectMember(groupId: number | string, memberId: string): Promise<void> {
    try {
      await this.api.post(`${this.base}/${groupId}/members/${memberId}/reject`, {});
    } catch (error: any) {
      console.error(`Error rejecting member ${memberId} for group ${groupId}:`, error);
      throw new Error(error.message || 'Failed to reject member');
    }
  }

  async removeMember(groupId: number | string, memberId: string): Promise<void> {
    try {
      await this.api.delete(`${this.base}/${groupId}/members/${memberId}`);
    } catch (error: any) {
      console.error(`Error removing member ${memberId} from group ${groupId}:`, error);
      throw new Error(error.message || 'Failed to remove member');
    }
  }

  // Group Notes
  async createGroupNote(groupId: number | string, data: GroupNoteCreateRequest): Promise<GroupNoteCreateResponse> {
    try {
      const response = await this.api.post<GroupNoteCreateResponse>(`${this.base}/${groupId}/notes`, data);
      return response;
    } catch (error: any) {
      console.error(`Error creating note for group ${groupId}:`, error);
      throw new Error(error.message || 'Failed to create group note');
    }
  }

  // Group Likes
  async toggleGroupLike(groupId: number | string): Promise<GroupLikeToggleResponseType> {
    try {
      const response = await this.api.post<GroupLikeToggleResponseType>(`${this.base}/${groupId}/like`, {});
      return response;
    } catch (error: any) {
      console.error(`Error toggling like for group ${groupId}:`, error);
      throw new Error(error.message || 'Failed to toggle group like');
    }
  }

  async getGroupLikes(groupId: number | string): Promise<GroupLikeInfo> {
    try {
      const response = await this.api.get<GroupLikeInfo>(`${this.base}/${groupId}/likes`);
      return response;
    } catch (error: any) {
      console.error(`Error fetching likes for group ${groupId}:`, error);
      throw new Error(error.message || 'Failed to fetch group likes');
    }
  }

  async checkUserLikedGroup(groupId: number | string): Promise<boolean> {
    try {
      const response = await this.api.get<{ liked: boolean }>(`${this.base}/${groupId}/like/check`);
      return response.liked;
    } catch (error: any) {
      console.error(`Error checking like status for group ${groupId}:`, error);
      return false;
    }
  }

  // Group Deletion
  async deleteGroup(groupId: number | string): Promise<GroupDeleteResponse> {
    try {
      const response = await this.api.delete<GroupDeleteResponse>(`${this.base}/${groupId}`);
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
}
