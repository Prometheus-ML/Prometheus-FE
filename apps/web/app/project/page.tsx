'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useProject } from '@prometheus-fe/hooks';
import { useImage } from '@prometheus-fe/hooks';
import { Project } from '@prometheus-fe/types';
import GlassCard from '../../src/components/GlassCard';
import RedButton from '../../src/components/RedButton';
import QueryBar from '../../src/components/QueryBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFolder, 
  faEye, 
  faCalendarAlt, 
  faTags, 
  faUsers, 
  faArrowLeft, 
  faHeart, 
  faCircle
} from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

interface ProjectFilters {
  search: string;
  gen_filter: string;
}

export default function ProjectPage() {
  const {
    fetchProjects,
    addProjectLike,
    removeProjectLike,
  } = useProject();

  const { getThumbnailUrl, getDefaultImageUrl } = useImage();

  // 상태 관리
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(15);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [likeLoading, setLikeLoading] = useState<Record<string, boolean>>({});

  // 검색 상태
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGen, setSelectedGen] = useState<string>('all');
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [appliedSearchTerm, setAppliedSearchTerm] = useState<string>('');
  const [appliedGen, setAppliedGen] = useState<string>('all');

  // 계산된 값들
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / size)), [total, size]);

  // 프로젝트 목록 조회
  const fetchProjectList = useCallback(async (isSearch = false) => {
    try {
      if (isSearch) {
        setIsSearchLoading(true);
      } else {
        setIsLoading(true);
      }
      
      let params: any = {
        page,
        size,
        status: 'completed' // 완료된 프로젝트만 조회
      };

      // 검색어 필터 적용
      if (appliedSearchTerm.trim()) {
        params.search = appliedSearchTerm.trim();
      }

      // 기수 필터 적용 (전체가 아닐 때만)
      if (appliedGen !== 'all') {
        params.gen = parseInt(appliedGen);
      }

      const response = await fetchProjects(params);
      setProjects(response.projects || []);
      setTotal(response.total || 0);
      setImageErrors({});
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setProjects([]);
      setTotal(0);
    } finally {
      if (isSearch) {
        setIsSearchLoading(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [page, size, appliedSearchTerm, appliedGen, fetchProjects]);

  // 초기 로딩 및 페이지 변경 시 목록 다시 로드
  useEffect(() => {
    fetchProjectList();
  }, [page, appliedSearchTerm, appliedGen, fetchProjectList]);

  // 검색 핸들러
  const handleSearch = useCallback(() => {
    setAppliedSearchTerm(searchTerm);
    setAppliedGen(selectedGen);
    setPage(1);
    fetchProjectList(true);
  }, [searchTerm, selectedGen, fetchProjectList]);

  // 초기화 핸들러
  const handleReset = useCallback(() => {
    setSearchTerm('');
    setSelectedGen('all');
    setAppliedSearchTerm('');
    setAppliedGen('all');
    setPage(1);
    fetchProjectList(true);
  }, [fetchProjectList]);

  // 좋아요 토글 처리
  const handleLikeToggle = async (project: Project) => {
    if (likeLoading[project.id]) return;
    
    try {
      setLikeLoading(prev => ({ ...prev, [project.id]: true }));
      
      if (project.is_liked) {
        await removeProjectLike(project.id);
      } else {
        await addProjectLike(project.id);
      }
      
      // 좋아요 상태 변경 후 프로젝트 목록을 다시 로드하여 상태 동기화
      await fetchProjectList();
    } catch (error: any) {
      console.error('좋아요 처리 실패:', error);
      alert('좋아요 처리에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    } finally {
      setLikeLoading(prev => ({ ...prev, [project.id]: false }));
    }
  };

  // 기수별 색상 반환 (멤버 페이지와 동일한 스타일)
  const getGenColor = (gen: number) => {
    if (gen <= 4) return 'bg-gray-500/20 text-gray-300'; // 4기 이하는 이전기수로 회색
    return 'bg-[#8B0000] text-[#ffa282]';
  };

  // 이미지 에러 처리
  const handleImageError = (projectId: string) => {
    setImageErrors(prev => ({ ...prev, [projectId]: true }));
  };



  // 현재 기수 계산 (2022년 3월부터 6개월 단위)
  const getCurrentGen = useCallback(() => {
    const startDate = new Date('2022-03-01');
    const now = new Date();
    const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
    return Math.floor(monthsDiff / 6) + 1;
  }, []);

  // 기수 옵션 생성 (날짜 기반, 최신 기수부터 역순, 이전기수 맨 뒤)
  const genOptions = [
    { value: 'all', label: '전체 기수' },
    ...Array.from({ length: getCurrentGen() }, (_, i) => {
      const gen = getCurrentGen() - i; // 최신 기수부터 역순으로
      if (gen > 4) {
        return {
          value: gen.toString(),
          label: `${gen}기`
        };
      }
      return null;
    }).filter((option): option is { value: string; label: string } => option !== null),
    { value: 'previous', label: '이전기수' }
  ];

  // Skeleton UI Component
  const SkeletonCard = () => (
    <div className="p-4 animate-pulse">
      <div className="w-full h-48 bg-gray-600 rounded-lg mb-4"></div>
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1 mr-2">
            <div className="w-32 h-6 bg-gray-600 rounded"></div>
            <div className="w-16 h-5 bg-gray-600 rounded"></div>
          </div>
        </div>
        <div className="h-10">
          <div className="w-full h-4 bg-gray-600 rounded mb-2"></div>
          <div className="w-3/4 h-4 bg-gray-600 rounded"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <div className="w-12 h-6 bg-gray-600 rounded-full"></div>
            <div className="w-16 h-6 bg-gray-600 rounded-full"></div>
            <div className="w-14 h-6 bg-gray-600 rounded-full"></div>
          </div>
          <div className="w-12 h-6 bg-gray-600 rounded"></div>
        </div>
      </div>
    </div>
  );

  // Loading state with skeleton
  if (isLoading && !appliedSearchTerm && appliedGen === 'all') {
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
                <h1 className="text-xl font-kimm-bold text-[#FFFFFF]">프로젝트</h1>
                <p className="text-sm font-pretendard text-[#e0e0e0]">프로메테우스 프로젝트 목록</p>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 py-6">
          {/* 검색 및 필터 */}
          <div className="mb-6 space-y-4">
            <QueryBar
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              selects={[
                {
                  id: 'gen',
                  value: selectedGen,
                  onChange: setSelectedGen,
                  options: genOptions
                }
              ]}
              onSearch={handleSearch}
              onReset={handleReset}
              isLoading={isSearchLoading}
              placeholder="프로젝트명, 키워드를 검색해보세요!"
            />
          </div>

          {/* Project Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <GlassCard key={index} className="overflow-hidden">
                <SkeletonCard />
              </GlassCard>
            ))}
          </div>
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
              <h1 className="text-xl font-kimm-bold text-[#FFFFFF]">프로젝트</h1>
              <p className="text-sm font-pretendard text-[#e0e0e0]">프로메테우스 프로젝트 목록</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-[#e0e0e0]">전체 <span className="text-[#ffa282] font-bold">{total}</span>개</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* 검색 및 필터 */}
        <div className="mb-6 space-y-4">
          <QueryBar
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            selects={[
              {
                id: 'gen',
                value: selectedGen,
                onChange: setSelectedGen,
                options: genOptions
              }
            ]}
            onSearch={handleSearch}
            onReset={handleReset}
            isLoading={isSearchLoading}
            placeholder="프로젝트명, 키워드를 검색해보세요!"
          />
        </div>

        {/* 검색 결과 수 */}
        {(appliedSearchTerm || appliedGen !== 'all') && (
          <div className="mb-4 text-sm text-[#e0e0e0]">
            검색 결과: {total}개
          </div>
        )}

        {/* 프로젝트 목록 */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <GlassCard key={index} className="overflow-hidden">
                <SkeletonCard />
              </GlassCard>
            ))}
          </div>
        )}
        
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: Project) => (
              <GlassCard 
                key={project.id} 
                className="overflow-hidden hover:bg-white/20 transition-colors border border-white/20 cursor-pointer group"
                onClick={() => window.location.href = `/project/${project.id}`}
              >
                <div className="p-4">
                  {/* 프로젝트 이미지 */}
                  <div className="mb-4">
                    <div className="w-full h-48 rounded-lg overflow-hidden bg-white/10">
                      {project.thumbnail_url && !imageErrors[project.id.toString()] ? (
                        <Image
                          src={getThumbnailUrl(project.thumbnail_url, 400)}
                          alt={project.title}
                          width={400}
                          height={200}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(project.id.toString())}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/10">
                          <FontAwesomeIcon icon={faFolder} className="text-white/50 text-4xl" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 프로젝트 정보 */}
                  <div className="space-y-3">
                    {/* 제목과 기수 */}
                                      <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <h3 className="text-lg font-semibold text-white line-clamp-2">
                          {project.title}
                    </h3>
                        <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium flex font-semibold items-center gap-1 flex-shrink-0 ${getGenColor(project.gen)}`}>
                          {project.gen <= 4 ? '이전기수' : `${project.gen}기`}
                        </span>
                      </div>
                  </div>

                    {/* 설명 (두 줄 고정) */}
                    {project.description && (
                      <div className="h-10">
                        <p className="text-gray-300 text-sm line-clamp-2">
                        {project.description}
                      </p>
                      </div>
                    )}

                    {/* 키워드와 좋아요 버튼 */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1 flex-1">
                        {project.keywords && project.keywords.length > 0 ? (
                          project.keywords.slice(0, 3).map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-white/20 text-white rounded-full"
                          >
                              #{keyword}
                          </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500">키워드 없음</span>
                        )}
                        {project.keywords && project.keywords.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-white/20 text-white rounded-full">
                            +{project.keywords.length - 3}
                          </span>
                        )}
                      </div>
                        <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLikeToggle(project);
                        }}
                        onMouseEnter={(e) => {
                          e.stopPropagation();
                          e.currentTarget.closest('.group')?.classList.remove('hover:bg-white/20');
                        }}
                        onMouseLeave={(e) => {
                          e.stopPropagation();
                          e.currentTarget.closest('.group')?.classList.add('hover:bg-white/20');
                        }}
                          disabled={likeLoading[project.id]}
                        className={`inline-flex items-center px-2 py-1 text-sm transition-colors pointer-events-auto ${
                            project.is_liked
                            ? 'text-red-300 hover:text-red-200'
                            : 'text-white hover:text-gray-300'
                          } ${likeLoading[project.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <FontAwesomeIcon 
                          icon={faHeart} 
                          className={`mr-1 h-3 w-3 ${project.is_liked ? 'text-red-300' : 'text-white'}`}
                          />
                          {project.like_count || 0}
                        </button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* 빈 상태 */}
        {!isLoading && !isSearchLoading && projects.length === 0 && (
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <FontAwesomeIcon icon={faFolder} className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="mt-2 text-sm font-medium text-white">프로젝트가 없습니다.</h3>
              <p className="mt-1 text-sm text-gray-300">
                {(appliedSearchTerm || appliedGen !== 'all') ? '검색 결과가 없습니다.' : '아직 등록된 프로젝트가 없습니다.'}
              </p>
            </div>
          </div>
        )}

        {/* 페이지네이션 */}
        {!isLoading && !isSearchLoading && projects.length > 0 && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-2 text-sm text-gray-300 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                이전
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-2 text-sm rounded transition-colors ${
                      page === pageNum
                        ? 'bg-[#c2402a] text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-2 text-sm text-gray-300 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
