'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useCommunity } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';
import PostModal from '../../src/components/PostModal';
import PostForm from '../../src/components/PostForm';
import RedButton from '../../src/components/RedButton';
import GlassCard from '../../src/components/GlassCard';
import { SearchBar } from '../../src/components/SearchMemberBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faUser, faCalendarAlt, faComments, faSearch, faUndo, faArrowLeft, faHeart } from '@fortawesome/free-solid-svg-icons';

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

interface PostFilters {
  search: string;
  category_filter: string;
}

export default function CommunityPage() {
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

  const { user } = useAuthStore();
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<PostFilters>({
    search: '',
    category_filter: ''
  });
  const [appliedFilters, setAppliedFilters] = useState<PostFilters>({
    search: '',
    category_filter: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authorCache, setAuthorCache] = useState<Record<string, any>>({});

  // 탭 변경 핸들러 (기존 필터에 추가)
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const category = tabId === 'all' ? '' : tabId;
    const newFilters = {
      ...filters,
      category_filter: category
    };
    setFilters(newFilters);
    setAppliedFilters(newFilters);
    loadPostsWithFilters(newFilters);
  };

  // 초기 게시글 목록 로드
  useEffect(() => {
    loadPosts();
  }, []);

  // 게시글 작성자 정보 로드
  useEffect(() => {
    if (posts.length > 0) {
      loadAuthorInfos();
    }
  }, [posts]);

  const loadPosts = async () => {
    try {
      setError('');
      const params = { page: 1, size: 20, ...appliedFilters };
      await fetchPosts(params);
    } catch (err) {
      console.error('게시글 목록 로드 실패:', err);
      setError('게시글 목록을 불러오지 못했습니다.');
    }
  };

  const loadPostsWithFilters = async (filterParams: PostFilters) => {
    try {
      setError('');
      const params = { page: 1, size: 20, ...filterParams };
      await fetchPosts(params);
    } catch (err) {
      console.error('게시글 목록 로드 실패:', err);
      setError('게시글 목록을 불러오지 못했습니다.');
    }
  };

  const loadAuthorInfos = useCallback(async () => {
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
  }, [posts, authorCache, getMemberInfo]);

  const getAuthorDisplayName = (authorId: string) => {
    const memberData = authorCache[authorId];
    if (memberData) {
      return `${memberData.gen}기 ${memberData.name}`;
    }
    return authorId; // 멤버 정보가 없으면 ID로 표시
  };

  // 검색 및 필터 적용
  const applyFilters = () => {
    setAppliedFilters(filters);
    loadPostsWithFilters(filters);
  };

  // 필터 초기화
  const clearFilters = () => {
    const emptyFilters: PostFilters = {
      search: '',
      category_filter: ''
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setActiveTab('all');
    loadPostsWithFilters(emptyFilters);
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
      await loadPosts();
    } catch (err) {
      console.error('게시글 생성 실패:', err);
      setError('게시글 생성에 실패했습니다.');
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deletePost(postId);
      await loadPosts();
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
    // 모달이 닫힐 때 게시글 목록 새로고침 (다른 사용자의 활동 반영)
    loadPosts();
  };

  // Skeleton UI Component
  const SkeletonCard = () => (
    <div className="p-4 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-16 h-4 bg-gray-600 rounded"></div>
          <div className="w-20 h-4 bg-gray-600 rounded"></div>
          <div className="w-24 h-4 bg-gray-600 rounded"></div>
        </div>
        <div className="w-32 h-4 bg-gray-600 rounded"></div>
      </div>
      <div className="w-full h-6 bg-gray-600 rounded mb-2"></div>
      <div className="w-3/4 h-4 bg-gray-600 rounded"></div>
    </div>
  );

  // 검색 결과 수 계산
  const searchResultCount = posts.length;

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
              <h1 className="text-xl font-kimm-bold text-[#FFFFFF]">커뮤니티</h1>
              <p className="text-sm font-pretendard text-[#e0e0e0]">프로메테우스 커뮤니티 게시판</p>
            </div>
          </div>
          <div className="text-right">
            {user && (
              <RedButton
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="inline-flex items-center text-sm font-medium mb-2"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                게시글 작성
              </RedButton>
            )}
            <p className="text-sm text-[#e0e0e0]">전체 <span className="text-[#ffa282] font-bold">{totalPosts}</span>개</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* 검색 및 필터 */}
        <div className="mb-6 space-y-4">
          <SearchBar
            searchTerm={filters.search}
            onSearchTermChange={(term) => setFilters(prev => ({ ...prev, search: term }))}
            tabs={TAB_ITEMS}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            selects={[]}
            onSearch={applyFilters}
            onReset={clearFilters}
            isLoading={isLoadingPosts}
            placeholder="제목, 내용을 검색해보세요!"
          />
        </div>

        {/* 검색 결과 수 */}
        {(appliedFilters.search || appliedFilters.category_filter) && (
          <div className="mb-4 text-sm text-[#e0e0e0]">
            검색 결과: {searchResultCount}개
          </div>
        )}

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
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <GlassCard key={index} className="border border-white/20">
                <SkeletonCard />
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post: any) => (
              <GlassCard 
                key={post.id} 
                className="p-4 hover:bg-white/20 transition-colors cursor-pointer border border-white/20"
                onClick={() => handlePostClick(post.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(post.category)}`}>
                      {getCategoryLabel(post.category)}
                    </span>
                    <span className="text-white font-medium">[ {post.title} ]</span>
                    <span className="text-gray-300 text-sm truncate">
                      {post.content}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-300 ml-4">
                    <span className="flex items-center">
                      <FontAwesomeIcon icon={faUser} className="mr-1" />
                      작성자: {getAuthorDisplayName(post.author_id)}
                    </span>
                    <span className="flex items-center">
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                      {new Date(post.created_at).toLocaleDateString('ko-KR')}
                    </span>
                    <span className="flex items-center">
                      <FontAwesomeIcon icon={faHeart} className="mr-1 text-red-400" />
                      {post.like_count || 0}
                    </span>
                    <span className="flex items-center">
                      <FontAwesomeIcon icon={faComments} className="mr-1 text-blue-400" />
                      {post.comment_count || 0}
                    </span>
                    {user && user.id === post.author_id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePost(post.id);
                        }}
                        className="text-red-400 hover:text-red-300 flex items-center"
                      >
                        <FontAwesomeIcon icon={faTrash} className="mr-1" />
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* 빈 상태 */}
        {!isLoadingPosts && posts.length === 0 && (
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <FontAwesomeIcon icon={faComments} className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="mt-2 text-sm font-medium text-white">게시글이 없습니다.</h3>
              <p className="mt-1 text-sm text-gray-300">
                {(appliedFilters.search || appliedFilters.category_filter) ? '검색 결과가 없습니다.' : '아직 등록된 게시글이 없습니다.'}
              </p>
            </div>
          </div>
        )}

        {/* 게시글 상세 모달 */}
        <PostModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          postId={selectedPostId}
        />
      </div>
    </div>
  );
}
