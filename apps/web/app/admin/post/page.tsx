"use client";
import { useState, useEffect } from 'react';
import { useAuthStore } from '@prometheus-fe/stores';
import { useCommunity } from '@prometheus-fe/hooks';
import PostModal from '../../../src/components/PostModal';
import PostForm from '../../../src/components/PostForm';
import GlassCard from '../../../src/components/GlassCard';
import RedButton from '../../../src/components/RedButton';
import TabBar from '../../../src/components/TabBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faHeart } from '@fortawesome/free-solid-svg-icons';

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
    getMemberInfo,
  } = useCommunity();

  // Hydration 완료 상태 관리
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [authorCache, setAuthorCache] = useState<Record<string, any>>({});

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

  // 게시글 작성자 정보 로드
  useEffect(() => {
    if (posts.length > 0) {
      loadAuthorInfos();
    }
  }, [posts]);

  const loadAuthorInfos = async () => {
    const uniqueAuthorIds = [...new Set(posts.map(post => post.author_id))];
    const authors: Record<string, any> = {};
    
    for (const authorId of uniqueAuthorIds) {
      if (!authorCache[authorId]) {
        try {
          const memberData = await getMemberInfo(authorId);
          if (memberData) {
            authors[authorId] = memberData;
          }
        } catch (error) {
          console.error(`작성자 ${authorId} 정보 로드 실패:`, error);
        }
      }
    }
    
    if (Object.keys(authors).length > 0) {
      setAuthorCache(prev => ({
        ...prev,
        ...authors
      }));
    }
  };

  const getAuthorDisplayName = (authorId: string) => {
    const memberData = authorCache[authorId];
    if (memberData) {
      return `${memberData.gen}기 ${memberData.name}`;
    }
    return authorId; // 멤버 정보가 없으면 ID로 표시
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
      free: 'bg-gray-100 text-gray-800',
      activity: 'bg-blue-100 text-blue-800',
      career: 'bg-green-100 text-green-800',
      promotion: 'bg-yellow-100 text-yellow-800',
      announcement: 'bg-red-100 text-red-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
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
    <div className="py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">게시글 관리</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-300">
            총 {totalPosts}개의 게시글
          </div>
          <RedButton
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
            게시글 작성
          </RedButton>
        </div>
      </div>

      {/* 게시글 작성 폼 */}
      {showCreateForm && (
        <GlassCard className="mb-6">
          <PostForm
            onSubmit={handleCreatePost}
            onCancel={() => setShowCreateForm(false)}
            isSubmitting={isCreatingPost}
          />
        </GlassCard>
      )}

      {/* 카테고리 필터 */}
      <GlassCard className="mb-6">
        <TabBar
          tabs={[
            { id: '', label: '전체' },
            ...CATEGORIES.map(category => ({ id: category.value, label: category.label }))
          ]}
          activeTab={selectedCategory}
          onTabChange={handleCategoryFilter}
        />
      </GlassCard>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-400">
          {error}
        </div>
      )}

      {/* 게시글 목록 */}
      {isLoadingPosts ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
        </div>
      ) : (
        <GlassCard className="overflow-hidden">
          <ul className="divide-y divide-white/10">
            {posts.map((post: any) => (
              <li 
                key={post.id} 
                className="px-4 py-4 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-b-0"
                onClick={() => handlePostClick(post.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(post.category)}`}>
                        {getCategoryLabel(post.category)}
                      </span>
                      <span className="text-xs text-gray-300">
                        작성자: {getAuthorDisplayName(post.author_id)}
                      </span>
                      <span className="text-xs text-gray-300">
                        {new Date(post.created_at).toLocaleDateString('ko-KR')}
                      </span>
                      <span className="text-xs text-gray-300 flex items-center">
                        <FontAwesomeIcon icon={faHeart} className="mr-1 text-red-400" />
                        {post.like_count || 0}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-300 text-sm line-clamp-3">
                      {post.content}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // 모달 열림 방지
                        handleDeletePost(post.id);
                      }}
                      className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-500/20 transition-colors"
                    >
                      <FontAwesomeIcon icon={faTrash} className="mr-1" />
                      삭제
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      {!isLoadingPosts && posts.length === 0 && (
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-white">게시글이 없습니다.</h3>
          </div>
        </div>
      )}

      {/* PostModal */}
      <PostModal
        postId={selectedPostId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
