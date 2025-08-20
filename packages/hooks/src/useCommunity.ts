import { useApi } from '@prometheus-fe/context';
import { Post, Comment, LikeStatus } from '@prometheus-fe/types';
import { useState, useCallback } from 'react';

export function useCommunity() {
  const { community } = useApi();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);
  const [isCreatingComment, setIsCreatingComment] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);

  // 게시글 목록 조회
  const fetchPosts = useCallback(async (params?: any) => {
    if (!community) {
      console.warn('community is not available. Ensure useCommunity is used within ApiProvider.');
      setIsLoadingPosts(false);
      return;
    }
    try {
      setIsLoadingPosts(true);
      const data = await community.listPosts(params);
      setPosts(data.items || []);
      setTotalPosts(data.total || 0);
    } catch (error) {
      console.error('게시글 목록 조회 실패:', error);
      setPosts([]);
      setTotalPosts(0);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [community]);

  // 특정 게시글 조회
  const fetchPost = useCallback(async (postId: number | string) => {
    if (!community) {
      console.warn('community is not available. Ensure useCommunity is used within ApiProvider.');
      return;
    }
    try {
      setIsLoadingPost(true);
      const data = await community.getPost(postId);
      setSelectedPost(data);
      
      // 게시글을 가져온 후 댓글도 함께 가져오기
      try {
        setIsLoadingComments(true);
        const commentsData = await community.getComments(postId);
        setComments(commentsData || []);
      } catch (commentError) {
        console.error(`댓글 조회 실패:`, commentError);
        setComments([]);
      } finally {
        setIsLoadingComments(false);
      }
    } catch (error) {
      console.error(`게시글 ${postId} 조회 실패:`, error);
      setSelectedPost(null);
      setComments([]);
    } finally {
      setIsLoadingPost(false);
    }
  }, [community]);

  // 게시글 생성
  const createPost = useCallback(async (postData: any) => {
    if (!community) {
      console.warn('community is not available. Ensure useCommunity is used within ApiProvider.');
      return null;
    }
    try {
      setIsCreatingPost(true);
      const newPost = await community.createPost(postData);
      // 새 게시글을 목록 맨 앞에 추가
      setPosts(prev => [newPost.post, ...prev]);
      setTotalPosts(prev => prev + 1);
      return newPost;
    } catch (error) {
      console.error('게시글 생성 실패:', error);
      throw error;
    } finally {
      setIsCreatingPost(false);
    }
  }, [community]);

  // 게시글 수정
  const updatePost = useCallback(async (postId: number | string, postData: any) => {
    if (!community) {
      console.warn('community is not available. Ensure useCommunity is used within ApiProvider.');
      return null;
    }
    try {
      setIsUpdatingPost(true);
      const updatedPost = await community.updatePost(postId, postData);
      
      // 게시글 목록에서 해당 게시글 업데이트
      setPosts(prev => prev.map(post => 
        post.id === Number(postId) ? updatedPost.post : post
      ));
      
      // 현재 선택된 게시글이 해당 게시글이면 업데이트
      if (selectedPost && selectedPost.id === Number(postId)) {
        setSelectedPost(updatedPost.post);
      }
      
      return updatedPost;
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      throw error;
    } finally {
      setIsUpdatingPost(false);
    }
  }, [community, selectedPost]);

  // 게시글 삭제
  const deletePost = useCallback(async (postId: number | string) => {
    if (!community) {
      console.warn('community is not available. Ensure useCommunity is used within ApiProvider.');
      return;
    }
    try {
      await community.deletePost(postId);
      // 목록에서 삭제된 게시글 제거
      setPosts(prev => prev.filter(post => post.id !== Number(postId)));
      setTotalPosts(prev => Math.max(0, prev - 1));
      // 현재 선택된 게시글이 삭제된 게시글이면 초기화
      if (selectedPost?.id === Number(postId)) {
        setSelectedPost(null);
      }
    } catch (error) {
      console.error(`게시글 ${postId} 삭제 실패:`, error);
      throw error;
    }
  }, [community, selectedPost]);

  // 댓글 생성
  const createComment = useCallback(async (postId: number | string, commentData: any) => {
    if (!community) {
      console.warn('community is not available. Ensure useCommunity is used within ApiProvider.');
      return null;
    }
    try {
      setIsCreatingComment(true);
      const newComment = await community.createComment(postId, commentData);
      // 새 댓글을 목록에 추가
      setComments(prev => [...prev, newComment.comment]);
      return newComment;
    } catch (error) {
      console.error('댓글 생성 실패:', error);
      throw error;
    } finally {
      setIsCreatingComment(false);
    }
  }, [community]);

  // 댓글 삭제
  const deleteComment = useCallback(async (postId: number | string, commentId: number | string) => {
    if (!community) {
      console.warn('community is not available. Ensure useCommunity is used within ApiProvider.');
      return;
    }
    try {
      await community.deleteComment(postId, commentId);
      // 목록에서 삭제된 댓글 제거
      setComments(prev => prev.filter(comment => comment.id !== Number(commentId)));
    } catch (error) {
      console.error(`댓글 ${commentId} 삭제 실패:`, error);
      throw error;
    }
  }, [community]);

  // 카테고리별 게시글 필터링
  const filterPostsByCategory = useCallback((category?: string) => {
    fetchPosts({ category, page: 1, size: 20 });
  }, [fetchPosts]);

  // 상태 초기화
  const clearPosts = useCallback(() => {
    setPosts([]);
    setTotalPosts(0);
  }, []);

  const clearSelectedPost = useCallback(() => {
    setSelectedPost(null);
  }, []);

  const clearComments = useCallback(() => {
    setComments([]);
  }, []);

  // 게시글 선택 핸들러
  const handlePostSelect = (post: Post) => {
    setSelectedPost(post);
  };

  // 게시글 선택 해제 핸들러
  const handlePostDeselect = () => {
    setSelectedPost(null);
    setComments([]);
  };

  // 좋아요 토글
  const toggleLike = useCallback(async (postId: number | string) => {
    if (!community) {
      console.warn('community is not available. Ensure useCommunity is used within ApiProvider.');
      return null;
    }
    try {
      setIsTogglingLike(true);
      const likeStatus = await community.toggleLike(postId);
      
      // 게시글 목록에서 해당 게시글의 좋아요 정보 업데이트
      setPosts(prev => prev.map(post => 
        post.id === Number(postId) 
          ? { ...post, like_count: likeStatus.like_count, is_liked: likeStatus.is_liked }
          : post
      ));
      
      // 현재 선택된 게시글이 해당 게시글이면 업데이트
      if (selectedPost && selectedPost.id === Number(postId)) {
        setSelectedPost(prev => prev ? {
          ...prev,
          like_count: likeStatus.like_count,
          is_liked: likeStatus.is_liked
        } : null);
      }
      
      return likeStatus;
    } catch (error) {
      console.error(`좋아요 토글 실패:`, error);
      throw error;
    } finally {
      setIsTogglingLike(false);
    }
  }, [community, selectedPost]);

  // 좋아요 상태 조회
  const getLikeStatus = useCallback(async (postId: number | string) => {
    if (!community) {
      console.warn('community is not available. Ensure useCommunity is used within ApiProvider.');
      return null;
    }
    try {
      const likeStatus = await community.getLikeStatus(postId);
      return likeStatus;
    } catch (error) {
      console.error(`좋아요 상태 조회 실패:`, error);
      throw error;
    }
  }, [community]);

  return {
    // 상태
    posts,
    selectedPost,
    comments,
    totalPosts,
    isLoadingPosts,
    isLoadingPost,
    isLoadingComments,
    isCreatingPost,
    isUpdatingPost,
    isCreatingComment,
    isTogglingLike,
    
    // API 함수들
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    createComment,
    deleteComment,
    filterPostsByCategory,
    toggleLike,
    getLikeStatus,
    
    // 핸들러들
    handlePostSelect,
    handlePostDeselect,
    
    // 유틸리티
    clearPosts,
    clearSelectedPost,
    clearComments,
  };
}
