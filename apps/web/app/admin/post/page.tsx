"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@prometheus-fe/stores';
import { useCommunity } from '@prometheus-fe/hooks';
import PostModal from '../../../src/components/PostModal';
import PostForm from '../../../src/components/PostForm';
import GlassCard from '../../../src/components/GlassCard';
import RedButton from '../../../src/components/RedButton';
import { QueryBar } from '../../../src/components/QueryBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faHeart, faComments, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const CATEGORIES = [
  { value: 'free', label: '자유게시판' },
  { value: 'activity', label: '활동' },
  { value: 'career', label: '진로' },
  { value: 'promotion', label: '홍보' },
  { value: 'announcement', label: '공지사항' },
] as const;

// 탭 아이템 정의
const TAB_ITEMS = [
  { id: 'all', label: '전체' },
  { id: 'free', label: '자유게시판' },
  { id: 'activity', label: '활동' },
  { id: 'career', label: '진로' },
  { id: 'promotion', label: '홍보' },
  { id: 'announcement', label: '공지사항' },
];

export default function AdminPostPage() {
  const canAccessAdministrator = useAuthStore((s) => s.canAccessAdministrator);
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
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    search: '',
    category_filter: ''
  });
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

    if (!canAccessAdministrator()) {
      alert('관리자가 아닙니다.');
      window.location.href = '/';
      return;
    }
  }, [isMounted, isAuthenticated, canAccessAdministrator]);

  // 초기 게시글 목록 로드
  useEffect(() => {
    if (isMounted && isAuthenticated() && canAccessAdministrator()) {
      loadPosts();
    }
  }, [isMounted, isAuthenticated, canAccessAdministrator]);

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
    // 이 부분은 백엔드에서 제공하는 author_name과 author_gen을 직접 사용하도록 수정
    // 따라서 이 로직은 제거되거나 필요에 따라 재구성되어야 합니다.
    // 현재는 작성자 ID만 사용하여 표시합니다.
  }, [posts]);

  const getAuthorDisplayName = (post: any) => {
    // 백엔드에서 제공하는 author_name과 author_gen을 직접 사용
    if (post.author_name && post.author_gen) {
      return `${post.author_gen}기 ${post.author_name}`;
    }
    return post.author_id; // 멤버 정보가 없으면 ID로 표시
  };

  // 탭 변경 핸들러 (기존 필터에 추가하고 바로 검색 실행)
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const category = tabId === 'all' ? '' : tabId;
    setFilters(prev => ({ ...prev, category_filter: category }));
    
    if (category) {
      filterPostsByCategory(category);
    } else {
      loadPosts();
    }
  };

  // 검색 및 필터 적용
  const applyFilters = () => {
    // 여기서는 탭 기반 필터링이므로 별도 처리 불필요
  };

  // 필터 초기화
  const clearFilters = () => {
    setFilters({ search: '', category_filter: '' });
    setActiveTab('all');
    loadPosts();
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
      free: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      activity: 'bg-green-500/20 text-green-300 border-green-500/30',
      career: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      promotion: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      announcement: 'bg-red-500/20 text-red-300 border-red-500/30',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
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
      if (!isMounted || !isAuthenticated() || !canAccessAdministrator()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">
          {!isMounted ? '로딩 중...' : '권한 확인 중...'}
        </div>
      </div>
    );
  }

  return (
    <div className="md:max-w-6xl max-w-xl mx-auto min-h-screen font-pretendard">
      {/* 헤더 */}
      <header className="mx-4 px-6 py-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-10 h-10 flex items-center justify-center text-[#FFFFFF] hover:text-[#e0e0e0] transition-colors">
              <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-kimm-bold text-[#FFFFFF]">게시글 관리</h1>
              <p className="text-sm font-pretendard text-[#e0e0e0]">관리자 게시글 관리</p>
            </div>
          </div>
          <div className="text-right">
          <RedButton
            onClick={() => setShowCreateForm(!showCreateForm)}
              className="inline-flex items-center text-sm font-medium mb-2"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
            게시글 작성
          </RedButton>
            <p className="text-sm text-[#e0e0e0]">전체 <span className="text-[#ffa282] font-bold">{totalPosts}</span>개</p>
        </div>
      </div>
      </header>

      <div className="px-4 py-6">
        {/* 검색 및 필터 */}
        <div className="mb-6 space-y-4">
          <QueryBar
            searchTerm={filters.search}
            onSearchTermChange={(term: string) => setFilters(prev => ({ ...prev, search: term }))}
            tabs={TAB_ITEMS}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            selects={[
              {
                id: 'category',
                value: filters.category_filter,
                onChange: (value: string) => setFilters(prev => ({ ...prev, category_filter: value })),
                options: [
                  { value: '', label: '전체 카테고리' },
                  ...CATEGORIES.map(category => ({
                    value: category.value,
                    label: category.label
                  }))
                ]
              }
            ]}
            onSearch={applyFilters}
            onReset={clearFilters}
            isLoading={isLoadingPosts}
            placeholder="제목, 내용을 검색해보세요!"
          />
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
          <div className="space-y-4">
            {posts.map((post: any) => (
              <GlassCard 
                key={post.id} 
                className="p-4 hover:bg-white/20 transition-colors cursor-pointer border border-white/20"
                onClick={() => handlePostClick(post.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(post.category)}`}>
                        {getCategoryLabel(post.category)}
                      </span>
                      <span className="text-xs text-gray-300">
                        작성자: {getAuthorDisplayName(post)}
                      </span>
                      <span className="text-xs text-gray-300">
                        {new Date(post.created_at).toLocaleDateString('ko-KR')}
                      </span>
                      <span className="text-xs text-gray-300 flex items-center">
                        <FontAwesomeIcon icon={faHeart} className="mr-1 text-red-400" />
                        {post.like_count || 0}
                      </span>
                      <span className="text-xs text-gray-300 flex items-center">
                        <FontAwesomeIcon icon={faComments} className="mr-1 text-blue-400" />
                        {post.comment_count || 0}
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
              </GlassCard>
            ))}
          </div>
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
    </div>
  );
}
