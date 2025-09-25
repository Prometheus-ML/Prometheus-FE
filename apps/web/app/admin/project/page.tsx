'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useProject, useImage } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';
import GlassCard from '@/src/components/GlassCard';
import RedButton from '@/src/components/RedButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUndo, faHeart } from '@fortawesome/free-solid-svg-icons';

export default function AdminProjectPage() {
  const { 
    projects, 
    isLoadingProjects, 
    fetchProjectsForAdmin, 
    searchQuery, 
    statusFilter, 
    setSearch, 
    setStatus, 
    clearFilters,
    highlightSearchTerm 
  } = useProject();
  const [error, setError] = useState('');
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const canAccessAdministrator = useAuthStore((s) => s.canAccessAdministrator);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  // Hydration 완료 상태 관리
  const [isMounted, setIsMounted] = useState<boolean>(false);
  
  // 기수 필터 상태 추가
  const [genFilter, setGenFilter] = useState<string>('');
  
  // useImage 훅 사용
  const { getThumbnailUrl, getDefaultImageUrl } = useImage();

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

  const loadProjects = async () => {
    // 이미 로딩 중이면 중복 요청 방지
    if (isLocalLoading || isLoadingProjects) {
      console.log('AdminProjectPage: 이미 로딩 중이므로 요청 건너뜀');
      return;
    }

    try {
      setIsLocalLoading(true);
      setError('');
      console.log('AdminProjectPage: 프로젝트 목록 로드 시작');
      
      // 백엔드에서 모든 프로젝트를 가져옴 (클라이언트 사이드 필터링)
      await fetchProjectsForAdmin();
      console.log('AdminProjectPage: 프로젝트 목록 로드 완료');
    } catch (err) {
      console.error('AdminProjectPage: 프로젝트 목록 로드 실패:', err);
      if (err instanceof Error) {
        if (err.message.includes('500')) {
          setError('서버 내부 오류가 발생했습니다.');
        } else if (err.message.includes('403')) {
          setError('권한이 없습니다.');
        } else if (err.message.includes('401')) {
          setError('인증이 필요합니다.');
        } else {
          setError(`프로젝트 목록을 불러오지 못했습니다: ${err.message}`);
        }
      } else {
        setError('프로젝트 목록을 불러오지 못했습니다.');
      }
    } finally {
      setIsLocalLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted && isAuthenticated() && canAccessAdministrator()) {
      console.log('AdminProjectPage: 초기 로드 useEffect 실행');
      loadProjects();
    }
  }, [isMounted, isAuthenticated, canAccessAdministrator]);

  // 검색 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // 상태 필터 핸들러
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
  };

  // 기수 필터 핸들러 추가
  const handleGenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGenFilter(e.target.value);
  };

  // 필터 초기화 핸들러
  const handleClearFilters = () => {
    clearFilters();
    setGenFilter(''); // 기수 필터도 초기화
  };

  // 검색어 하이라이트 컴포넌트
  const HighlightedText = ({ text, searchTerm }: { text: string; searchTerm: string }) => {
    if (!searchTerm.trim() || !text) {
      return <span>{text}</span>;
    }

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, index) => 
          regex.test(part) ? (
            <mark key={index} className="bg-yellow-200 px-0.5 rounded">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    );
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '진행중';
      case 'completed': return '완료';
      case 'paused': return '중지';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 필터링된 프로젝트 목록
  const filteredProjects = useMemo(() => {
    let filtered = projects;
    
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchLower) ||
        (project.description && project.description.toLowerCase().includes(searchLower)) ||
        (project.keywords && project.keywords.some(keyword => 
          keyword.toLowerCase().includes(searchLower)
        ))
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter(project => project.status === statusFilter);
    }
    
    if (genFilter) {
      const genNum = parseInt(genFilter);
      filtered = filtered.filter(project => project.gen === genNum);
    }
    
    return filtered;
  }, [projects, searchQuery, statusFilter, genFilter]);

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
    <div className="py-6">
      {/* 기능 버튼들 */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        <RedButton
          href="/admin/project/new"
          className="inline-flex items-center px-4 py-2 text-sm font-medium"
        >
          <FontAwesomeIcon icon={faSearch} className="-ml-1 mr-2 h-4 w-4" />
          프로젝트 생성
        </RedButton>
      </div>

      {/* 검색 및 필터 */}
      <div className="p-4 mb-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
        <div className="flex gap-4 items-end">
          {/* 검색 */}
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="프로젝트 제목, 설명, 키워드를 검색해보세요!"
              className="block w-full px-3 py-2 text-sm text-black placeholder-gray-300 focus:outline-none bg-white/20 rounded-md"
            />
          </div>

          {/* 상태 필터 */}
          <div className="flex-1">
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="block w-full px-3 py-2 text-sm bg-white/20 text-white border-white/30 rounded-md focus:outline-none focus:ring-1 focus:ring-white/50"
            >
              <option value="" className="bg-gray-100 text-black">상태</option>
              <option value="active" className="bg-gray-100 text-black">진행중</option>
              <option value="completed" className="bg-gray-100 text-black">완료</option>
              <option value="paused" className="bg-gray-100 text-black">중지</option>
            </select>
          </div>

          {/* 기수 필터 추가 */}
          <div className="flex-1">
            <select
              value={genFilter}
              onChange={handleGenChange}
              className="block w-full px-3 py-2 text-sm bg-white/20 text-white border-white/30 rounded-md focus:outline-none focus:ring-1 focus:ring-white/50"
            >
              <option value="" className="bg-gray-100 text-black">기수</option>
              <option value="0" className="bg-gray-100 text-black">0기</option>
              {Array.from({ length: 15 }, (_, i) => (
                <option key={i + 1} value={i + 1} className="bg-gray-100 text-black">
                  {i + 1}기
                </option>
              ))}
            </select>
          </div>

          {/* 필터 초기화 버튼 */}
          <RedButton onClick={handleClearFilters} className="px-4 py-2">
            <FontAwesomeIcon icon={faUndo} className="text-sm" />
          </RedButton>

          {/* 검색 버튼 */}
          <RedButton onClick={() => {}} className="px-4 py-2">
            <FontAwesomeIcon icon={faSearch} className="text-sm" />
          </RedButton>
        </div>
      </div>

      {/* 검색 결과 개수 */}
      <div className="text-center mb-4">
        <span className="text-sm text-white">
          {(searchQuery || statusFilter || genFilter) ? (
            `검색 결과: ${filteredProjects.length}개`
          ) : (
            `전체: ${filteredProjects.length}개`
          )}
        </span>
      </div>

      {/* 로딩 상태 */}
      {isLocalLoading || isLoadingProjects ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : null}
      
      {/* 에러 상태 */}
      {error && !isLocalLoading && !isLoadingProjects && (
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-white">오류 발생</h3>
            <p className="mt-1 text-sm text-gray-300">{error}</p>
          </div>
        </div>
      )}
      
      {/* 프로젝트 목록 */}
      {!isLocalLoading && !isLoadingProjects && !error && (
        <GlassCard className="overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredProjects.map((project) => (
              <li key={project.id} className="px-4 py-4 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-b-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {project.thumbnail_url ? (
                        <div className="relative h-16 w-16">
                          <Image
                            src={getThumbnailUrl(project.thumbnail_url, 80)}
                            alt={project.title}
                            fill
                            className="rounded-lg object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="h-16 w-16 rounded-lg bg-white/20 flex items-center justify-center">
                                    <span class="text-sm font-medium text-white">${project.title.charAt(0)}</span>
                                  </div>
                                `;
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-white/20 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">{project.title.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-white">
                          <HighlightedText text={project.title} searchTerm={searchQuery} />
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {getStatusText(project.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">
                        <HighlightedText 
                          text={project.description || '설명이 없습니다.'} 
                          searchTerm={searchQuery} 
                        />
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <span>{project.gen}기</span>
                        {project.like_count !== undefined && (
                          <span className="flex items-center text-pink-400">
                            <FontAwesomeIcon icon={faHeart} className="mr-1 h-3 w-3" />
                            {project.like_count}
                          </span>
                        )}
                        {project.keywords && project.keywords.length > 0 && (
                          <span>
                            · 키워드: {project.keywords.slice(0, 3).join(', ')}
                            {project.keywords.length > 3 && ` +${project.keywords.length - 3}개`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link 
                      href={`/project/${project.id}`}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      상세보기
                    </Link>
                    <Link 
                      href={`/project/${project.id}/edit`}
                      className="text-green-400 hover:text-green-300 text-sm font-medium"
                    >
                      편집
                    </Link>
                    <button
                      className="text-red-400 hover:text-red-300 text-sm font-medium"
                      onClick={() => {
                        if (confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
                          // TODO: 프로젝트 삭제 기능 구현
                          alert('삭제 기능은 곧 구현될 예정입니다.');
                        }
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      {/* 빈 상태 */}
      {!isLocalLoading && !isLoadingProjects && !error && filteredProjects.length === 0 && (
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-white">
              {(searchQuery || statusFilter || genFilter) ? '검색 결과가 없습니다.' : '프로젝트가 없습니다.'}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}