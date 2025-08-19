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
} from './dto/group.dto';
import type {
  Group,
  GroupMember,
  GroupJoinRequest,
  GroupNote,
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
}
