import { ApiClient } from './apiClient';
import {
  CreatePostRequest,
  CreatePostResponse,
  GetPostsRequest,
  GetPostsResponse,
  CreateCommentRequest,
  CreateCommentResponse,
  LikeStatusResponse,
} from './dto/community.dto';
import type {
  Post,
  Comment,
} from '@prometheus-fe/types';

export class CommunityApi {
  private readonly api: ApiClient;
  private readonly postsBase = '/community/posts';

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
  }

  // Posts API
  async createPost(data: CreatePostRequest): Promise<CreatePostResponse> {
    try {
      const response = await this.api.post<CreatePostResponse>(`${this.postsBase}/`, data);
      return response;
    } catch (error: any) {
      console.error('Error creating post:', error);
      throw new Error(error.message || 'Failed to create post');
    }
  }

  async listPosts(params?: GetPostsRequest): Promise<GetPostsResponse> {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.size) sp.set('size', String(params.size));
      if (params?.category) sp.set('category', params.category);
      
      const query = sp.toString() ? `?${sp.toString()}` : '';
      const response = await this.api.get<GetPostsResponse>(`${this.postsBase}/${query}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      throw new Error(error.message || 'Failed to fetch posts');
    }
  }

  async getPost(postId: number | string): Promise<Post> {
    try {
      const response = await this.api.get<Post>(`${this.postsBase}/${postId}`);
      return response;
    } catch (error: any) {
      console.error(`Error fetching post ${postId}:`, error);
      throw new Error(error.message || 'Failed to fetch post');
    }
  }

  async deletePost(postId: number | string): Promise<void> {
    try {
      await this.api.delete(`${this.postsBase}/${postId}`);
    } catch (error: any) {
      console.error(`Error deleting post ${postId}:`, error);
      throw new Error(error.message || 'Failed to delete post');
    }
  }

  // Comments API
  async createComment(postId: number | string, data: CreateCommentRequest): Promise<CreateCommentResponse> {
    try {
      const response = await this.api.post<CreateCommentResponse>(`${this.postsBase}/${postId}/comments`, data);
      return response;
    } catch (error: any) {
      console.error(`Error creating comment for post ${postId}:`, error);
      throw new Error(error.message || 'Failed to create comment');
    }
  }

  async deleteComment(postId: number | string, commentId: number | string): Promise<void> {
    try {
      await this.api.delete(`${this.postsBase}/${postId}/comments/${commentId}`);
    } catch (error: any) {
      console.error(`Error deleting comment ${commentId} from post ${postId}:`, error);
      throw new Error(error.message || 'Failed to delete comment');
    }
  }

  async getComments(postId: number | string): Promise<Comment[]> {
    try {
      const response = await this.api.get<Comment[]>(`${this.postsBase}/${postId}/comments`);
      return response;
    } catch (error: any) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      throw new Error(error.message || 'Failed to fetch comments');
    }
  }

  // Likes API
  async toggleLike(postId: number | string): Promise<LikeStatusResponse> {
    try {
      const response = await this.api.post<LikeStatusResponse>(`${this.postsBase}/${postId}/like`, {});
      return response;
    } catch (error: any) {
      console.error(`Error toggling like for post ${postId}:`, error);
      throw new Error(error.message || 'Failed to toggle like');
    }
  }

  async getLikeStatus(postId: number | string): Promise<LikeStatusResponse> {
    try {
      const response = await this.api.get<LikeStatusResponse>(`${this.postsBase}/${postId}/like`);
      return response;
    } catch (error: any) {
      console.error(`Error fetching like status for post ${postId}:`, error);
      throw new Error(error.message || 'Failed to fetch like status');
    }
  }
}
