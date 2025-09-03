'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useCommunity } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';
import PostModal from '../../src/components/PostModal';
import PostForm from '../../src/components/PostForm';
import RedButton from '../../src/components/RedButton';
import GlassCard from '../../src/components/GlassCard';
import { QueryBar } from '../../src/components/QueryBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faUser, faCalendarAlt, faComments, faSearch, faUndo, faArrowLeft, faHeart, faImage } from '@fortawesome/free-solid-svg-icons';

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
  } = useCommunity();

  const { user } = useAuthStore();
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState<string>('');
  const [appliedCategory, setAppliedCategory] = useState<string>('all');
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalAll, setTotalAll] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // 전체 게시글 수 조회 (필터링과 무관)
  const fetchTotalCount = useCallback(async () => {
    try {
      let params: any = { page: 1, size: 20 }; // 페이지네이션을 위해 20개씩 요청
      await fetchPosts(params);
    } catch (err) {
      console.error('Failed to fetch total count:', err);
    }
  }, [fetchPosts]);

  // 탭 변경 핸들러 (탭 누르기만 하면 검색 적용)
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const category = tabId === 'all' ? '' : tabId;
    setSelectedCategory(category);
    setCurrentPage(1); // 페이지 리셋
    
    // 상태를 먼저 업데이트한 후 검색 실행
    setAppliedCategory(category);
    setAppliedSearchTerm(searchTerm);
    
    // 탭 변경 시 즉시 검색 실행
    const fetchData = async () => {
      try {
        setIsSearchLoading(true);
        setError('');
        let params: any = { page: 1, size: 20 };
        if (searchTerm.trim()) {
          params.search = searchTerm.trim();
        }
        if (category !== '') {
          params.category = category;
        }
        await fetchPosts(params);
      } catch (err) {
        console.error('게시글 목록 로드 실패:', err);
        setError('게시글 목록을 불러오지 못했습니다.');
      } finally {
        setIsSearchLoading(false);
      }
    };
    fetchData();
  };

  // 초기 로딩 시 전체 게시글 수 조회
  useEffect(() => {
    fetchTotalCount();
  }, [fetchTotalCount]);

  // 전체 게시글 수 설정 (한 번만)
  useEffect(() => {
    if (totalPosts > 0 && totalAll === 0) {
      setTotalAll(totalPosts);
    }
  }, [totalPosts, totalAll]);

  // 페이지네이션 핸들러
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    const fetchData = async () => {
      try {
        setIsSearchLoading(true);
        setError('');
        let params: any = { page, size: 20 };
        if (appliedSearchTerm.trim()) {
          params.search = appliedSearchTerm.trim();
        }
        if (appliedCategory !== 'all') {
          params.category = appliedCategory;
        }
        await fetchPosts(params);
      } catch (err) {
        console.error('게시글 목록 로드 실패:', err);
        setError('게시글 목록을 불러오지 못했습니다.');
      } finally {
        setIsSearchLoading(false);
      }
    };
    fetchData();
  }, [appliedSearchTerm, appliedCategory, fetchPosts]);

  // 총 페이지 수 계산
  useEffect(() => {
    const pages = Math.ceil(totalPosts / 20);
    setTotalPages(pages);
  }, [totalPosts]);



  // applied 상태 변경 시 UI 업데이트 (API 호출은 이미 완료됨)
  useEffect(() => {
    // applied 상태가 변경되면 UI만 업데이트
    // API 호출은 handleTabChange, handleSearch, handleReset에서 직접 처리
  }, [appliedSearchTerm, appliedCategory]);

  // 검색 및 필터 적용
  const handleSearch = useCallback(() => {
    setCurrentPage(1); // 페이지 리셋
    const fetchData = async () => {
      try {
        setIsSearchLoading(true);
        setError('');
        let params: any = { page: 1, size: 20 };
        if (searchTerm.trim()) {
          params.search = searchTerm.trim();
        }
        if (selectedCategory !== 'all') {
          params.category = selectedCategory;
        }
        await fetchPosts(params);
        // 상태 업데이트는 API 호출 후에
        setAppliedSearchTerm(searchTerm);
        setAppliedCategory(selectedCategory);
      } catch (err) {
        console.error('게시글 목록 로드 실패:', err);
        setError('게시글 목록을 불러오지 못했습니다.');
      } finally {
        setIsSearchLoading(false);
      }
    };
    fetchData();
  }, [searchTerm, selectedCategory, fetchPosts]);

  // 필터 초기화
  const handleReset = useCallback(() => {
    setCurrentPage(1); // 페이지 리셋
    const fetchData = async () => {
      try {
        setIsSearchLoading(true);
        setError('');
        let params: any = { page: 1, size: 20 };
        await fetchPosts(params);
        // 상태 업데이트는 API 호출 후에
        setSearchTerm('');
        setSelectedCategory('all');
        setAppliedSearchTerm('');
        setAppliedCategory('all');
        setActiveTab('all');
      } catch (err) {
        console.error('게시글 목록 로드 실패:', err);
        setError('게시글 목록을 불러오지 못했습니다.');
      } finally {
        setIsSearchLoading(false);
      }
    };
    fetchData();
  }, [fetchPosts]);

  const handleCreatePost = async (post: { category: string; title: string; content: string; images?: string[] }) => {
    if (!post.title.trim() || !post.content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      setError('');
      await createPost(post);
      setShowCreateForm(false);
      // 게시글 생성 후 현재 필터로 다시 로드
      let params: any = { page: 1, size: 20 };
      if (appliedSearchTerm.trim()) {
        params.search = appliedSearchTerm.trim();
      }
      if (appliedCategory !== 'all') {
        params.category = appliedCategory;
      }
      await fetchPosts(params);
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
      // 게시글 삭제 후 현재 필터로 다시 로드
      let params: any = { page: 1, size: 20 };
      if (appliedSearchTerm.trim()) {
        params.search = appliedSearchTerm.trim();
      }
      if (appliedCategory !== 'all') {
        params.category = appliedCategory;
      }
      await fetchPosts(params);
    } catch (err) {
      console.error('게시글 삭제 실패:', err);
      setError('게시글 삭제에 실패했습니다.');
    }
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const getGenColor = (gen: number) => {
    return 'bg-[#8B0000] text-[#ffa282]';
  };

  // 날짜 표시 함수
  const formatDate = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMs = now.getTime() - postDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInYears = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 365));

    // 1시간 미만
    if (diffInMinutes < 60) {
      return `${diffInMinutes}분전`;
    }
    
    // 1시간 이상이지만 같은 날
    if (diffInHours < 24 && now.toDateString() === postDate.toDateString()) {
      return postDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    
    // 날짜가 다르고 1년 미만
    if (diffInYears < 1) {
      return postDate.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
    }
    
    // 1년 이상
    return `${diffInYears}년 전`;
  };

  const handlePostClick = (postId: number) => {
    setSelectedPostId(postId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPostId(null);
    // 모달이 닫힐 때 게시글 목록 새로고침 (다른 사용자의 활동 반영)
    let params: any = { page: 1, size: 20 };
    if (appliedSearchTerm.trim()) {
      params.search = appliedSearchTerm.trim();
    }
    if (appliedCategory !== 'all') {
      params.category = appliedCategory;
    }
    fetchPosts(params);
  };

  // Skeleton UI Component
  const SkeletonCard = () => (
    <div className="p-4 animate-pulse">
      <div className="flex items-center justify-between">
        {/* 왼쪽: 카테고리와 제목 */}
        <div className="flex-1 flex items-center space-x-3">
          <div className="w-16 h-4 bg-gray-600 rounded"></div>
          <div className="w-32 h-5 bg-gray-600 rounded"></div>
        </div>
        
        {/* 오른쪽: 기수, 이름, 날짜, 좋아요, 댓글 */}
        <div className="flex items-center space-x-2 text-sm text-gray-300 ml-4">
          <div className="w-12 h-4 bg-gray-600 rounded-full"></div>
          <div className="w-16 h-4 bg-gray-600 rounded"></div>
          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
          <div className="w-20 h-4 bg-gray-600 rounded"></div>
          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
          <div className="w-8 h-4 bg-gray-600 rounded"></div>
          <div className="w-8 h-4 bg-gray-600 rounded"></div>
        </div>
      </div>
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
            <Link href="/my" className="w-10 h-10 flex items-center justify-center text-[#FFFFFF] hover:text-[#e0e0e0] transition-colors">
              <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-kimm-bold text-[#FFFFFF]">커뮤니티</h1>
              <p className="text-sm font-pretendard text-[#e0e0e0]">프로메테우스 커뮤니티 게시판</p>
            </div>
          </div>
          <div className="text-right flex items-center gap-3">
            {user && (
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="w-10 h-10 flex items-center justify-center text-[#FFFFFF] hover:text-[#e0e0e0] transition-colors"
              >
                <FontAwesomeIcon icon={faPlus} className="w-5 h-5" />
              </button>
            )}
            <p className="text-sm text-[#e0e0e0]">전체 <span className="text-[#ffa282] font-bold">{totalAll}</span>개</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* 검색 및 필터 */}
        <div className="mb-6 space-y-4">
          <QueryBar
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            tabs={TAB_ITEMS}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            selects={[]}
            onSearch={handleSearch}
            onReset={handleReset}
            isLoading={isSearchLoading}
            placeholder="제목을 검색하세요!"
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
                      <span className={`px-1 py-0.5 text-xs rounded border ${getCategoryColor(post.category)}`}>
                        {getCategoryLabel(post.category)}
                      </span>
                     <span className="text-white font-medium">{post.title}</span>
                     {/* 이미지 아이콘 표시 */}
                     {post.images && post.images.length > 0 && (
                       <span className="flex items-center text-blue-400 text-xs">
                         <FontAwesomeIcon icon={faImage} className="mr-1" />
                         {post.images.length}
                       </span>
                     )}
                   </div>
                                     <div className="flex items-center space-x-2 text-sm text-gray-300 ml-4">

                      <span className="flex items-center">
                        {post.author_gen}기 {post.author_name}
                      </span>
                                           <span className="text-gray-500 text-xs">|</span>
                      <span className="flex items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                          {formatDate(post.created_at)}
                      </span>
                      <span className="text-gray-500 text-xs">|</span>
                     <span className="flex items-center">
                       <FontAwesomeIcon icon={faHeart} className="mr-1 text-white" />
                       {post.like_count || 0}
                     </span>
                     <span className="flex items-center">
                         <FontAwesomeIcon icon={faComments} className="mr-1 text-gray-400" />
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
                {(appliedSearchTerm || appliedCategory !== 'all') ? '검색 결과가 없습니다.' : '아직 등록된 게시글이 없습니다.'}
              </p>
            </div>
          </div>
        )}

        {/* 페이지네이션 */}
        {!isLoadingPosts && posts.length > 0 && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm text-gray-300 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                이전
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 text-sm rounded transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[#c2402a] text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm text-gray-300 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                다음
              </button>
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
