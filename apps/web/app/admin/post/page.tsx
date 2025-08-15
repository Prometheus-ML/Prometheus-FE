"use client";
import { useState, useEffect } from 'react';
import { useAuthStore } from '@prometheus-fe/stores';
import { useCommunity } from '@prometheus-fe/hooks';
import PostModal from '../../../src/components/PostModal';
import PostForm from '../../../src/components/PostForm';

const CATEGORIES = [
  { value: 'free', label: '자유게시판' },
  { value: 'activity', label: '활동' },
  { value: 'career', label: '진로' },
  { value: 'promotion', label: '홍보' },
  { value: 'announcement', label: '공지사항' },
] as const;

export default function AdminPostPage() {
  const canAccessManager = useAuthStore((s) => s.canAccessManager);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  const {
    posts,
    totalPosts,
    isLoadingPosts,
    isCreatingPost,
    fetchPosts,
    createPost,
    deletePost,
    filterPostsByCategory,
  } = useCommunity();

  // Hydration 완료 상태 관리
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Hydration 완료 감지
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 권한 체크 (hydration 완료 후에만)
  useEffect(() => {
    if (!isMounted) return;

    if (!isAuthenticated()) {
      alert('로그인이 필요합니다.');
      window.location.href = '/auth/login';
      return;
    }

    if (!canAccessManager()) {
      alert('관리자가 아닙니다.');
      window.location.href = '/';
      return;
    }
  }, [isMounted, isAuthenticated, canAccessManager]);

  // 초기 게시글 목록 로드
  useEffect(() => {
    if (isMounted && isAuthenticated() && canAccessManager()) {
      loadPosts();
    }
  }, [isMounted, isAuthenticated, canAccessManager]);

  const loadPosts = async () => {
    try {
      setError('');
      await fetchPosts({ page: 1, size: 50 });
    } catch (err) {
      console.error('게시글 목록 로드 실패:', err);
      setError('게시글 목록을 불러오지 못했습니다.');
    }
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    if (category) {
      filterPostsByCategory(category);
    } else {
      loadPosts();
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deletePost(postId);
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
      announcement: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handlePostClick = (postId: number) => {
    setSelectedPostId(postId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPostId(null);
  };

  const handleCreatePost = async (post: { category: string; title: string; content: string }) => {
    if (!post.title.trim() || !post.content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      setError('');
      await createPost(post);
      setShowCreateForm(false);
    } catch (err) {
      console.error('게시글 생성 실패:', err);
      setError('게시글 생성에 실패했습니다.');
    }
  };

  // Hydration이 완료되지 않았거나 권한이 없는 경우
  if (!isMounted || !isAuthenticated() || !canAccessManager()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">
          {!isMounted ? '로딩 중...' : '권한 확인 중...'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">게시글 관리</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              총 {totalPosts}개의 게시글
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              게시글 작성
            </button>
          </div>
        </div>

        {/* 게시글 작성 폼 */}
        {showCreateForm && (
          <PostForm
            onSubmit={handleCreatePost}
            onCancel={() => setShowCreateForm(false)}
            isSubmitting={isCreatingPost}
          />
        )}

        {/* 카테고리 필터 */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryFilter('')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedCategory === '' 
                  ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            {CATEGORIES.map(category => (
              <button
                key={category.value}
                onClick={() => handleCategoryFilter(category.value)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedCategory === category.value 
                    ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        {/* 게시글 목록 */}
        {isLoadingPosts ? (
          <div className="py-20 text-center text-gray-500">불러오는 중...</div>
        ) : (
          <div className="space-y-4">
            {posts.map((post: any) => (
              <div 
                key={post.id} 
                className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handlePostClick(post.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(post.category)}`}>
                        {getCategoryLabel(post.category)}
                      </span>
                      <span className="text-xs text-gray-500">
                        작성자: {post.author_id}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(post.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {post.content}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // 모달 열림 방지
                        handleDeletePost(post.id);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoadingPosts && posts.length === 0 && (
          <div className="py-20 text-center text-gray-500">
            게시글이 없습니다.
          </div>
        )}

        {/* PostModal */}
        <PostModal
          postId={selectedPostId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
}
