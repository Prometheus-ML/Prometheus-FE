'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useProject } from '@prometheus-fe/hooks';
import { useImage } from '@prometheus-fe/hooks';
import { Project } from '@prometheus-fe/types';
import GlassCard from '../../src/components/GlassCard';
import RedButton from '../../src/components/RedButton';
import SearchBar from '../../src/components/SearchMemberBar';
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
    projects,
    isLoadingProjects,
    fetchProjects,
    addProjectLike,
    removeProjectLike,
  } = useProject();

  const { getThumbnailUrl, getDefaultImageUrl } = useImage();

  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(20);
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    gen_filter: 'all'
  });
  const [appliedFilters, setAppliedFilters] = useState<ProjectFilters>({
    search: '',
    gen_filter: 'all'
  });
  const [error, setError] = useState<string>('');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [likeLoading, setLikeLoading] = useState<Record<string, boolean>>({});

  // 필터링된 프로젝트 목록
  const filteredProjects = useMemo(() => {
    let filtered = projects;
    
    // 완료된 프로젝트만 표시
    filtered = filtered.filter(project => project.status === 'completed');
    
    if (appliedFilters.search) {
      const searchLower = appliedFilters.search.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchLower) ||
        (project.description && project.description.toLowerCase().includes(searchLower)) ||
        (project.keywords && project.keywords.some(keyword => 
          keyword.toLowerCase().includes(searchLower)
        ))
      );
    }
    
    if (appliedFilters.gen_filter && appliedFilters.gen_filter !== 'all') {
      if (appliedFilters.gen_filter === 'previous') {
        // 이전기수: 0기(창립멤버) ~ 4기
        filtered = filtered.filter(project => project.gen <= 4);
      } else {
        // 특정 기수
        const genNum = parseInt(appliedFilters.gen_filter);
        filtered = filtered.filter(project => project.gen === genNum);
      }
    }
    
    return filtered;
  }, [projects, appliedFilters]);

  const totalProjects = filteredProjects.length;
  const pages = useMemo(() => Math.max(1, Math.ceil(totalProjects / size)), [totalProjects, size]);

  // 프로젝트 목록 로드
  const loadProjects = async () => {
    try {
      setError('');
      const params = { page, size, ...appliedFilters };
      await fetchProjects(params);
    } catch (error: any) {
      console.error('Failed to load projects:', error);
      setError(error.message || '프로젝트 목록을 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    loadProjects();
  }, [page, appliedFilters]);

  // 검색 및 필터 적용
  const applyFilters = () => {
    setAppliedFilters(filters);
    setPage(1); // 첫 페이지로 이동
  };

  // 필터 초기화
  const clearFilters = () => {
    const emptyFilters: ProjectFilters = {
      search: '',
      gen_filter: 'all'
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
  };

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
      await loadProjects();
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

  // 검색 결과 수 계산
  const searchResultCount = projects.length;

  // 현재 기수 계산 (2022년 3월부터 6개월 단위)
  const getCurrentGen = useCallback(() => {
    const startDate = new Date('2022-03-01');
    const now = new Date();
    const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
    return Math.floor(monthsDiff / 6) + 1;
  }, []);

  // 기수 옵션 생성 (날짜 기반)
  const genOptions = [
    { value: 'all', label: '전체 기수' },
    { value: 'previous', label: '이전기수' },
    ...Array.from({ length: getCurrentGen() }, (_, i) => {
      const gen = i + 1;
      if (gen > 4) {
        return {
          value: gen.toString(),
          label: `${gen}기`
        };
      }
      return null;
    }).filter((option): option is { value: string; label: string } => option !== null)
  ];

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
            <p className="text-sm text-[#e0e0e0]">전체 <span className="text-[#ffa282] font-bold">{totalProjects}</span>개</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* 검색 및 필터 */}
        <div className="mb-6 space-y-4">
          <SearchBar
            searchTerm={filters.search}
            onSearchTermChange={(term) => setFilters(prev => ({ ...prev, search: term }))}
            selects={[
              {
                id: 'gen',
                value: filters.gen_filter,
                onChange: (value) => setFilters(prev => ({ ...prev, gen_filter: value })),
                options: genOptions
              }
            ]}
            onSearch={applyFilters}
            onReset={clearFilters}
            isLoading={isLoadingProjects}
            placeholder="프로젝트명, 설명, 키워드를 검색해보세요!"
          />
        </div>

        {/* 검색 결과 수 */}
        {(appliedFilters.search || appliedFilters.gen_filter !== 'all') && (
          <div className="mb-4 text-sm text-[#e0e0e0]">
            검색 결과: {totalProjects}개
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-400">
            {error}
          </div>
        )}

        {/* 프로젝트 목록 */}
        {isLoadingProjects ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project: Project) => (
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
        {!isLoadingProjects && filteredProjects.length === 0 && (
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <FontAwesomeIcon icon={faFolder} className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="mt-2 text-sm font-medium text-white">프로젝트가 없습니다.</h3>
              <p className="mt-1 text-sm text-gray-300">
                {(appliedFilters.search || appliedFilters.gen_filter !== 'all') ? '검색 결과가 없습니다.' : '아직 등록된 프로젝트가 없습니다.'}
              </p>
            </div>
          </div>
        )}

        {/* 페이지네이션 */}
        {pages > 1 && (
          <div className="flex justify-center space-x-2 mt-6">
            {Array.from({ length: pages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  pageNum === page
                    ? 'bg-red-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
