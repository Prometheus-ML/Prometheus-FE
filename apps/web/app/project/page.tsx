'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useProject } from '@prometheus-fe/hooks';
import { useImage } from '@prometheus-fe/hooks';
import { Project } from '@prometheus-fe/types';
import GlassCard from '../../src/components/GlassCard';
import RedButton from '../../src/components/RedButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUndo, faFolder, faEye, faCalendarAlt, faTags, faUsers, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

interface ProjectFilters {
  search: string;
  status_filter: string;
  gen_filter: string;
}

export default function ProjectPage() {
  const {
    projects,
    isLoadingProjects,
    fetchProjects,
  } = useProject();

  const { getThumbnailUrl, getDefaultImageUrl } = useImage();

  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(20);
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    status_filter: '',
    gen_filter: ''
  });
  const [appliedFilters, setAppliedFilters] = useState<ProjectFilters>({
    search: '',
    status_filter: '',
    gen_filter: ''
  });
  const [error, setError] = useState<string>('');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const totalProjects = projects.length;
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
      status_filter: '',
      gen_filter: ''
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
  };

  // 상태별 색상 반환
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500/20 text-green-300 border-green-500/30',
      completed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      paused: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  // 기수별 색상 반환
  const getGenColor = (gen: number) => {
    if (gen === 0) return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    
    const colors = [
      'bg-red-500/20 text-red-300 border-red-500/30',
      'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'bg-green-500/20 text-green-300 border-green-500/30',
      'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'bg-rose-500/20 text-rose-300 border-rose-500/30',
      'bg-amber-500/20 text-amber-300 border-amber-500/30',
      'bg-lime-500/20 text-lime-300 border-lime-500/30',
      'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      'bg-teal-500/20 text-teal-300 border-teal-500/30',
      'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'bg-sky-500/20 text-sky-300 border-sky-500/30',
    ];
    return colors[(gen - 1) % colors.length];
  };

  // 이미지 에러 처리
  const handleImageError = (projectId: string) => {
    setImageErrors(prev => ({ ...prev, [projectId]: true }));
  };

  // 검색 결과 수 계산
  const searchResultCount = projects.length;

  return (
    <div className="min-h-screen font-pretendard">
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
          {/* 검색 바 */}
          <div className="relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#e0e0e0] w-4 h-4" />
            <input
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              type="text"
              placeholder="프로젝트명, 설명을 검색해보세요!"
              className="w-full border border-[#404040] rounded-md px-10 py-3 bg-[#1A1A1A] text-[#FFFFFF] placeholder-[#e0e0e0] focus:border-[#c2402a] focus:outline-none"
            />
          </div>
          
          {/* 필터 */}
          <div className="flex flex-wrap gap-3">
            {/* 상태 필터 */}
            <select
              value={filters.status_filter}
              onChange={(e) => setFilters(prev => ({ ...prev, status_filter: e.target.value }))}
              className="border border-[#404040] rounded-md px-3 py-2 bg-[#1A1A1A] text-[#FFFFFF] focus:border-[#c2402a] focus:outline-none"
            >
              <option value="">전체 상태</option>
              <option value="active">진행중</option>
              <option value="completed">완료</option>
              <option value="paused">중지</option>
            </select>

            {/* 기수 필터 */}
            <select
              value={filters.gen_filter}
              onChange={(e) => setFilters(prev => ({ ...prev, gen_filter: e.target.value }))}
              className="border border-[#404040] rounded-md px-3 py-2 bg-[#1A1A1A] text-[#FFFFFF] focus:border-[#c2402a] focus:outline-none"
            >
              <option value="">전체 기수</option>
              <option value="0">0기</option>
              {Array.from({ length: 15 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}기</option>
              ))}
            </select>
            
            {/* 필터 초기화 버튼 */}
            <RedButton onClick={clearFilters} className="inline-flex items-center">
              <FontAwesomeIcon icon={faUndo} className="mr-2 h-4 w-4" />
              초기화
            </RedButton>

            {/* 검색 버튼 */}
            <RedButton onClick={applyFilters} className="inline-flex items-center">
              <FontAwesomeIcon icon={faSearch} className="mr-2 h-4 w-4" />
              검색
            </RedButton>
          </div>
        </div>

        {/* 검색 결과 수 */}
        {appliedFilters.search && (
          <div className="mb-4 text-sm text-[#e0e0e0]">
            검색 결과: {searchResultCount}개
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
            {projects.map((project: Project) => (
              <GlassCard key={project.id} className="overflow-hidden hover:bg-white/20 transition-colors border border-white/20">
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
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-white line-clamp-2 flex-1">
                        {project.title}
                      </h3>
                    </div>

                    {project.description && (
                      <p className="text-gray-300 text-sm line-clamp-3">
                        {project.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getGenColor(project.gen)}`}>
                        {project.gen}기
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(project.status)}`}>
                        {project.status === 'active' ? '진행중' : 
                         project.status === 'completed' ? '완료' : 
                         project.status === 'paused' ? '중지' : project.status}
                      </span>
                    </div>

                    {/* 키워드 */}
                    {project.keywords && project.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.keywords.slice(0, 3).map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-white/20 text-white rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                        {project.keywords.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-white/20 text-white rounded-full">
                            +{project.keywords.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* 시작일 */}
                    <div className="flex items-center text-sm text-gray-300">
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                      시작: {new Date(project.start_date).toLocaleDateString()}
                    </div>

                    {/* 상세보기 버튼 */}
                    <div className="flex items-center justify-between pt-2">
                      <a
                        href={`/project/${project.id}`}
                        className="inline-flex items-center px-3 py-1 text-sm bg-red-500/20 border border-red-500/30 rounded text-red-300 hover:bg-red-500/30 transition-colors"
                      >
                        <FontAwesomeIcon icon={faEye} className="mr-1 h-3 w-3" />
                        상세보기
                      </a>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* 빈 상태 */}
        {!isLoadingProjects && projects.length === 0 && (
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <FontAwesomeIcon icon={faFolder} className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="mt-2 text-sm font-medium text-white">프로젝트가 없습니다.</h3>
              <p className="mt-1 text-sm text-gray-300">
                {appliedFilters.search ? '검색 결과가 없습니다.' : '아직 등록된 프로젝트가 없습니다.'}
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
