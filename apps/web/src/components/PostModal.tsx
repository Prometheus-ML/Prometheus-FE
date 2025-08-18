'use client';

import { useState, useEffect } from 'react';
import { useCommunity } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';

interface PostModalProps {
  postId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { value: 'free', label: '자유게시판' },
  { value: 'activity', label: '활동' },
  { value: 'career', label: '진로' },
  { value: 'promotion', label: '홍보' },
  { value: 'study_group', label: '스터디 그룹' },
  { value: 'casual_group', label: '취미 그룹' },
  { value: 'announcement', label: '공지사항' },
] as const;

export default function PostModal({ postId, isOpen, onClose }: PostModalProps) {
  const {
    selectedPost,
    comments,
    isLoadingPost,
    isLoadingComments,
    isCreatingComment,
    fetchPost,
    createComment,
    deleteComment,
    deletePost,
    clearSelectedPost,
    clearComments,
    getMemberInfo,
  } = useCommunity();

  const { user } = useAuthStore();
  const [newComment, setNewComment] = useState<any>({ content: '' });
  const [error, setError] = useState('');
  const [authorInfo, setAuthorInfo] = useState<any>(null);
  const [commentAuthors, setCommentAuthors] = useState<Record<string, any>>({});

  // 모달이 열릴 때 게시글 데이터 로드
  useEffect(() => {
    if (isOpen && postId) {
      fetchPost(postId);
    }
  }, [isOpen, postId, fetchPost]);

  // 게시글 작성자 정보 로드
  useEffect(() => {
    if (selectedPost?.author_id) {
      loadAuthorInfo(selectedPost.author_id);
    }
  }, [selectedPost]);

  // 댓글 작성자 정보 로드
  useEffect(() => {
    if (comments.length > 0) {
      loadCommentAuthors();
    }
  }, [comments]);

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      clearSelectedPost();
      clearComments();
      setNewComment({ content: '' });
      setError('');
      setAuthorInfo(null);
      setCommentAuthors({});
    }
  }, [isOpen, clearSelectedPost, clearComments]);

  const loadAuthorInfo = async (authorId: string) => {
    try {
      const memberData = await getMemberInfo(authorId);
      setAuthorInfo(memberData);
    } catch (error) {
      console.error('작성자 정보 로드 실패:', error);
    }
  };

  const loadCommentAuthors = async () => {
    const uniqueAuthorIds = [...new Set(comments.map(comment => comment.author_id))];
    const authors: Record<string, any> = {};
    
    for (const authorId of uniqueAuthorIds) {
      try {
        const memberData = await getMemberInfo(authorId);
        if (memberData) {
          authors[authorId] = memberData;
        }
      } catch (error) {
        console.error(`댓글 작성자 ${authorId} 정보 로드 실패:`, error);
      }
    }
    
    setCommentAuthors(authors);
  };

  const getAuthorDisplayName = (authorId: string, memberData: any) => {
    if (memberData) {
      return `${memberData.gen}기 ${memberData.name}`;
    }
    return authorId; // 멤버 정보가 없으면 ID로 표시
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postId || !newComment.content.trim()) {
      setError('댓글 내용을 입력해주세요.');
      return;
    }

    if (!user || !user.id) {
      setError('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
      return;
    }

    try {
      setError('');
      await createComment(postId, newComment);
      setNewComment({ content: '' });
      
      // 댓글 작성 후 댓글 목록 새로고침
      if (postId) {
        fetchPost(postId);
      }
    } catch (err) {
      console.error('댓글 생성 실패:', err);
      setError('댓글 작성에 실패했습니다.');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!postId || !commentId || !confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteComment(postId, commentId);
      
      // 댓글 삭제 후 댓글 목록 새로고침
      if (postId) {
        fetchPost(postId);
      }
    } catch (err) {
      console.error('댓글 삭제 실패:', err);
      setError('댓글 삭제에 실패했습니다.');
    }
  };

  const handleDeletePost = async () => {
    if (!postId || !confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deletePost(postId);
      onClose(); // 게시글 삭제 후 모달 닫기
    } catch (err) {
      console.error('게시글 삭제 실패:', err);
      setError('게시글 삭제에 실패했습니다.');
    }
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      free: 'bg-gray-100 text-gray-800 border-gray-200',
      activity: 'bg-blue-100 text-blue-800 border-blue-200',
      career: 'bg-green-100 text-green-800 border-green-200',
      promotion: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      study_group: 'bg-purple-100 text-purple-800 border-purple-200',
      casual_group: 'bg-pink-100 text-pink-800 border-pink-200',
      announcement: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">게시글 상세</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoadingPost ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
            </div>
          ) : selectedPost ? (
            <>
              {/* 게시글 정보 */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`px-3 py-1 text-sm rounded-full border ${getCategoryColor(selectedPost.category)}`}>
                    {getCategoryLabel(selectedPost.category)}
                  </span>
                  <span className="text-sm text-gray-300">
                    작성자: {getAuthorDisplayName(selectedPost.author_id, authorInfo)}
                  </span>
                  <span className="text-sm text-gray-300">
                    {new Date(selectedPost.created_at).toLocaleString('ko-KR')}
                  </span>
                  {user && user.id === selectedPost.author_id && (
                    <button
                      onClick={handleDeletePost}
                      className="text-red-400 hover:text-red-300 text-sm ml-auto"
                    >
                      게시글 삭제
                    </button>
                  )}
                </div>

                <h1 className="text-2xl font-bold text-white mb-4">
                  {selectedPost.title}
                </h1>

                <div className="prose max-w-none">
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {selectedPost.content}
                  </p>
                </div>
              </div>

              {/* 댓글 섹션 */}
              <div className="border-t border-white/20 pt-6">
                <h3 className="text-lg font-semibold mb-4 text-white">
                  댓글 ({comments.length})
                </h3>
                
                {/* 댓글 로딩 상태 */}
                {isLoadingComments && (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
                    <span className="ml-2 text-gray-300">댓글을 불러오는 중...</span>
                  </div>
                )}

                {/* 댓글 작성 폼 */}
                {user && !isLoadingComments && (
                  <div className="mb-6">
                    <form onSubmit={handleCreateComment}>
                      <div className="mb-3">
                        <textarea
                          value={newComment.content}
                          onChange={(e) => setNewComment({ content: e.target.value })}
                          placeholder="댓글을 입력하세요..."
                          rows={3}
                          className="w-full bg-white/20 text-black border border-white/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-300">
                          {getAuthorDisplayName(user.id, authorInfo)}(으)로 댓글 작성
                        </div>
                        <button
                          type="submit"
                          disabled={isCreatingComment || !newComment.content.trim()}
                          className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isCreatingComment ? '작성 중...' : '댓글 작성'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* 에러 메시지 */}
                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* 댓글 목록 */}
                {!isLoadingComments && (
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <div className="text-center text-gray-300 py-8">
                        아직 댓글이 없습니다.
                        {!user && (
                          <p className="mt-2 text-sm">
                            댓글을 작성하려면 로그인이 필요합니다.
                          </p>
                        )}
                      </div>
                    ) : (
                      comments
                        .filter(comment => comment && comment.id && comment.author_id && comment.created_at) // 유효한 댓글만 필터링
                        .map((comment) => (
                          <div key={comment.id} className="bg-white/10 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="text-sm font-medium text-white">
                                    {getAuthorDisplayName(comment.author_id, commentAuthors[comment.author_id])}
                                  </span>
                                  <span className="text-xs text-gray-300">
                                    {comment.created_at ? new Date(comment.created_at).toLocaleString('ko-KR') : '날짜 없음'}
                                  </span>
                                </div>
                                <p className="text-gray-300 whitespace-pre-wrap">
                                  {comment.content || '내용 없음'}
                                </p>
                              </div>
                              {user && user.id === comment.author_id && (
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="text-red-400 hover:text-red-300 text-sm ml-4"
                                >
                                  삭제
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-gray-300">
              게시글을 찾을 수 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
