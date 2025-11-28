'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCommunity } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';
import { useImage } from '@prometheus-fe/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart, 
  faTimes, 
  faUser, 
  faCalendarAlt, 
  faComments,
  faCircle,
  faPaperPlane,
  faFlag,
} from '@fortawesome/free-solid-svg-icons';
import Portal from '@/src/components/Portal';
import PostReportModal from '@/src/components/community/PostReportModal';

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
    isTogglingLike,
    fetchPost,
    createComment,
    deleteComment,
    deletePost,
    clearSelectedPost,
    clearComments,
    toggleLike,
    reportPost,
    isReportingPost,
  } = useCommunity();

  const { user, canAccessAdministrator } = useAuthStore();
  const [newComment, setNewComment] = useState<any>({ content: '' });
  const [error, setError] = useState('');
  const [reportToast, setReportToast] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // useImage 훅 사용
  const { getThumbnailUrl } = useImage();

  // 모달이 열릴 때 게시글 데이터 로드
  useEffect(() => {
    if (isOpen && postId) {
      fetchPost(postId);
    }
  }, [isOpen, postId, fetchPost]);

  // 디버깅용: selectedPost 변경 시 로그
  useEffect(() => {
    if (selectedPost) {
      console.log('PostModal - selectedPost:', selectedPost);
      console.log('PostModal - selectedPost.images:', selectedPost.images);
    }
  }, [selectedPost]);

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      clearSelectedPost();
      clearComments();
      setNewComment({ content: '' });
      setError('');
      setReportToast(null);
      setIsReportModalOpen(false);
    }
  }, [isOpen, clearSelectedPost, clearComments]);

  useEffect(() => {
    if (!reportToast) return;
    const timer = setTimeout(() => setReportToast(null), 5000);
    return () => clearTimeout(timer);
  }, [reportToast]);

  const getAuthorDisplayName = (authorId: string) => {
    if (selectedPost) {
      return `${selectedPost.author_gen}기 ${selectedPost.author_name}`;
    }
    return authorId;
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

  const handleToggleLike = async () => {
    if (!postId || !user) {
      setError('로그인이 필요합니다.');
      return;
    }

    try {
      setError('');
      await toggleLike(postId);
    } catch (err) {
      console.error('좋아요 토글 실패:', err);
      setError('좋아요 처리에 실패했습니다.');
    }
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  // 기수별 색상 반환 (ProfileModal과 동일한 스타일)
  const getGenColor = (gen: number) => {
    if (gen <= 4) return 'bg-gray-500/20 text-gray-300'; // 4기 이하는 이전기수로 회색
    return 'bg-[#8B0000] text-[#ffa282]';
  };

  const handleReportSubmit = async (payload: { reason: string; description?: string }) => {
    if (!postId) {
      throw new Error('게시글 정보를 찾을 수 없습니다.');
    }
    await reportPost(postId, payload);
    setReportToast('신고가 접수되었습니다. 운영진이 곧 확인할 예정입니다.');
    setIsReportModalOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <Portal>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Prometheus background */}
        <div className="flex items-center justify-center min-h-screen pt-2 px-2 sm:pt-4 sm:px-4 pb-20 text-center sm:p-0 relative z-10">
          {/* 배경 오버레이 */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

          {/* 모달 컨텐츠 */}
          <div className="inline-block align-middle bg-black/80 backdrop-blur-lg rounded-lg sm:rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle md:max-w-4xl w-full max-w-[calc(100%-1rem)] sm:max-w-lg relative border border-white/20 max-h-[95vh] sm:max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* 헤더 */}
            <div className="px-3 pt-4 pb-3 sm:px-4 sm:pt-5 sm:pb-4 sm:p-6 sm:pb-4 flex-shrink-0 border-b border-white/20">
              <div className="text-center w-full relative">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-red-500/20 mb-2 sm:mb-4">
                  <svg className="h-4 w-4 sm:h-6 sm:w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg leading-6 font-kimm-bold text-white mb-1 sm:mb-2">게시글 상세</h3>
                {reportToast && (
                  <div className="mx-auto mb-2 sm:mb-3 max-w-md rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 sm:px-4 sm:py-1 text-[10px] sm:text-xs text-red-200">
                    {reportToast}
                  </div>
                )}
                
                <button 
                  onClick={onClose} 
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-400 hover:text-gray-200 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* 스크롤 가능한 컨텐츠 영역 */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 sm:px-4 sm:pb-4 sm:px-6 font-pretendard">
              <div className="mt-4 sm:mt-6">
            {isLoadingPost ? (
              <div className="flex justify-center items-center py-12 sm:py-20">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-red-600" />
              </div>
            ) : selectedPost ? (
              <>
                {/* 게시글 정보 */}
                <div className="mb-4 sm:mb-6">
                  {/* 제목과 기수 */}
                  <div className="flex items-start sm:items-center gap-2 mb-3 sm:mb-4">
                    <h1 className="text-lg sm:text-2xl font-semibold text-white break-words flex-1 min-w-0">{selectedPost.title}</h1>
                    <span className={`px-1.5 py-0.5 text-[10px] sm:text-xs rounded-full font-medium flex font-semibold items-center gap-1 flex-shrink-0 ${getGenColor(selectedPost.author_gen)}`}>
                      {selectedPost.author_gen <= 4 ? '이전기수' : `${selectedPost.author_gen}기`}
                    </span>
                  </div>

                  {/* 카테고리와 작성자 정보 */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:space-x-2 mb-3 sm:mb-4">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs rounded-full border ${getCategoryColor(selectedPost.category)}`}>
                        {getCategoryLabel(selectedPost.category)}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-300 flex items-center">
                        <FontAwesomeIcon icon={faUser} className="mr-0.5 sm:mr-1 w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        {selectedPost.author_name}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-300 flex items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-0.5 sm:mr-1 w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="hidden sm:inline">{new Date(selectedPost.created_at).toLocaleString('ko-KR')}</span>
                        <span className="sm:hidden">{new Date(selectedPost.created_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 sm:ml-auto">
                      {user && user.id !== selectedPost.author_id && (
                        <button
                          onClick={() => setIsReportModalOpen(true)}
                          className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-red-300 transition hover:text-red-100"
                        >
                          <FontAwesomeIcon icon={faFlag} className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          <span className="hidden sm:inline">신고하기</span>
                          <span className="sm:hidden">신고</span>
                        </button>
                      )}
                      {user && user.id === selectedPost.author_id && (
                        <button
                          onClick={handleDeletePost}
                          className="text-red-400 hover:text-red-300 text-xs sm:text-sm"
                        >
                          <span className="hidden sm:inline">게시글 삭제</span>
                          <span className="sm:hidden">삭제</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 좋아요 버튼 - 제목 오른쪽에 */}
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                    {user && (
                      <button
                        onClick={handleToggleLike}
                        disabled={isTogglingLike}
                        className={`inline-flex items-center px-1 py-1 text-xs sm:text-sm transition-colors ${
                          selectedPost.is_liked
                            ? 'text-red-300 hover:text-red-200'
                            : 'text-white hover:text-gray-300'
                        } ${isTogglingLike ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <FontAwesomeIcon 
                          icon={faHeart} 
                          className={`mr-0.5 sm:mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5 ${isTogglingLike ? 'animate-pulse' : ''} ${selectedPost.is_liked ? 'text-red-300' : 'text-white'}`}
                        />
                        {isTogglingLike ? '...' : (selectedPost.like_count || 0)}
                      </button>
                    )}
                    {!user && (
                      <div className="text-gray-400 text-xs sm:text-sm">
                        <FontAwesomeIcon icon={faHeart} className="mr-0.5 sm:mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        {selectedPost.like_count || 0}
                      </div>
                    )}
                  </div>

                  <div className="prose max-w-none">
                    <p className="text-sm sm:text-base text-gray-300 whitespace-pre-wrap leading-relaxed break-words">
                      {selectedPost.content}
                    </p>
                  </div>

                  {/* 이미지 표시 */}
                  {selectedPost.images && selectedPost.images.length > 0 && (
                    <div className="mt-3 sm:mt-4">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-300 mb-2 sm:mb-3">첨부된 이미지 ({selectedPost.images.length}개)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                        {selectedPost.images.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <Image
                              src={getThumbnailUrl(imageUrl, 200)}
                              alt={`게시글 이미지 ${index + 1}`}
                              className="w-full h-24 sm:h-32 object-cover rounded-lg border border-white/20 hover:border-white/40 transition-colors cursor-pointer"
                              width={200}
                              height={150}
                              onClick={() => window.open(imageUrl, '_blank')}
                              onError={(e) => {
                                // 이미지 로드 실패 시 에러 처리
                                const target = e.target as HTMLImageElement;
                                console.error(`이미지 로드 실패: ${imageUrl}`);
                                // 에러 시 기본 이미지나 플레이스홀더 표시
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 댓글 섹션 */}
                <div className="border-t border-white/20 pt-4 sm:pt-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white flex items-center">
                    <FontAwesomeIcon icon={faComments} className="mr-1.5 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                    댓글 ({comments.length})
                  </h3>
                  
                  {/* 댓글 로딩 상태 */}
                  {isLoadingComments && (
                    <div className="flex justify-center items-center py-6 sm:py-8">
                      <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-red-600" />
                      <span className="ml-2 text-xs sm:text-sm text-gray-300">댓글을 불러오는 중...</span>
                    </div>
                  )}

                  {/* 댓글 작성 폼 */}
                  {user && !isLoadingComments && (
                    <div className="mb-4 sm:mb-6">
                      <form onSubmit={handleCreateComment}>
                        <div className="relative">
                          <textarea
                            value={newComment.content}
                            onChange={(e) => setNewComment({ content: e.target.value })}
                            placeholder="댓글을 입력하세요..."
                            rows={3}
                            className="w-full bg-white/20 text-xs sm:text-sm text-gray-300 border border-white/30 rounded-md px-2.5 py-2 sm:px-3 sm:py-2 pr-10 sm:pr-12 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                          />
                          <button
                            type="submit"
                            disabled={isCreatingComment || !newComment.content.trim()}
                            className="absolute right-2 sm:right-5 top-1/2 transform -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="댓글 작성"
                          >
                            {isCreatingComment ? (
                              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white" />
                            ) : (
                              <FontAwesomeIcon icon={faPaperPlane} className="w-3 h-3 sm:w-4 sm:h-4" />
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* 에러 메시지 */}
                  {error && (
                    <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-400 text-xs sm:text-sm">
                      {error}
                    </div>
                  )}

                  {/* 댓글 목록 */}
                  {!isLoadingComments && (
                    <div className="space-y-3 sm:space-y-4">
                      {comments.length === 0 ? (
                        <div className="text-center text-gray-300 py-6 sm:py-8">
                          <p className="text-xs sm:text-sm">아직 댓글이 없습니다.</p>
                          {!user && (
                            <p className="mt-2 text-xs sm:text-sm">
                              댓글을 작성하려면 로그인이 필요합니다.
                            </p>
                          )}
                        </div>
                      ) : (
                        comments
                          .filter(comment => comment && comment.id && comment.author_id && comment.created_at) // 유효한 댓글만 필터링
                          .map((comment) => (
                            <div key={comment.id} className="bg-white/10 rounded-lg p-3 sm:p-4">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                    <span className="text-xs sm:text-sm font-medium text-white">
                                      {comment.author_gen}기 {comment.author_name}
                                    </span>
                                    <span className="text-[10px] sm:text-xs text-gray-300">
                                      <span className="hidden sm:inline">{new Date(comment.created_at).toLocaleString('ko-KR')}</span>
                                      <span className="sm:hidden">{new Date(comment.created_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}</span>
                                    </span>
                                  </div>
                                  <p className="text-xs sm:text-sm text-gray-300 whitespace-pre-wrap break-words">
                                    {comment.content || '내용 없음'}
                                  </p>
                                </div>
                                {user && (user.id === comment.author_id || canAccessAdministrator()) && (
                                  <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="text-red-400 hover:text-red-300 text-xs sm:text-sm ml-2 sm:ml-4 flex-shrink-0"
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
              <div className="py-12 sm:py-20 text-center text-gray-300">
                <p className="text-sm sm:text-base">게시글을 찾을 수 없습니다.</p>
              </div>
            )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </Portal>
      <PostReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
        postTitle={selectedPost?.title}
        isSubmitting={isReportingPost}
      />
    </>
  );
}
