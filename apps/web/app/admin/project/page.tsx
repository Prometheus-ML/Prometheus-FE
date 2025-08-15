'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useProject, useImage } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';

export default function AdminProjectPage() {
  const { 
    projects, 
    isLoadingProjects, 
    fetchProjects, 
    searchQuery, 
    statusFilter, 
    setSearch, 
    setStatus, 
    clearFilters,
    highlightSearchTerm 
  } = useProject();
  const [error, setError] = useState('');
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const canAccessManager = useAuthStore((s) => s.canAccessManager);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  // Hydration 완료 상태 관리
  const [isMounted, setIsMounted] = useState<boolean>(false);
  
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

    if (!canAccessManager()) {
      alert('관리자가 아닙니다.');
      window.location.href = '/';
      return;
    }
  }, [isMounted, isAuthenticated, canAccessManager]);

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
      await fetchProjects();
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
    if (isMounted && isAuthenticated() && canAccessManager()) {
      console.log('AdminProjectPage: 초기 로드 useEffect 실행');
      loadProjects();
    }
  }, [isMounted, isAuthenticated, canAccessManager]);

  // 검색 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // 상태 필터 핸들러
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
  };

  // 필터 초기화 핸들러
  const handleClearFilters = () => {
    clearFilters();
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
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">프로젝트 관리</h1>
          <div className="flex items-center space-x-2">
            <Link 
              href="/admin/project/new" 
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              프로젝트 생성
            </Link>
          </div>
        </div>

        {/* 검색 및 필터 섹션 */}
        <div className="mb-6 space-y-4">
          {/* 검색창 */}
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="프로젝트 제목, 설명, 키워드 검색..."
                className="w-full border rounded-md px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          
          {/* 필터 및 액션 버튼 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <select 
                value={statusFilter} 
                onChange={handleStatusChange}
                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">전체 상태</option>
                <option value="active">진행중</option>
                <option value="completed">완료</option>
                <option value="paused">중지</option>
              </select>
              
              {(searchQuery || statusFilter) && (
                <button 
                  onClick={handleClearFilters}
                  className="px-3 py-2 text-sm rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  필터 초기화
                </button>
              )}
            </div>
            
            {/* 검색 결과 개수 */}
            <div className="text-sm text-gray-500">
              {searchQuery || statusFilter ? (
                <span>검색 결과: {projects.length}개</span>
              ) : (
                <span>전체: {projects.length}개</span>
              )}
            </div>
          </div>
        </div>

        {isLocalLoading || isLoadingProjects ? (
          <div className="py-20 text-center text-gray-500">불러오는 중...</div>
        ) : null}
        
        {error && !isLocalLoading && !isLoadingProjects && (
          <div className="py-8 text-center text-red-600">{error}</div>
        )}
        
        {!isLocalLoading && !isLoadingProjects && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* 썸네일 이미지 섹션 */}
                <div className="aspect-video w-full bg-gray-100 relative">
                  <Image
                    src={project.panel_url ? getThumbnailUrl(project.panel_url, 400) : getDefaultImageUrl(project.title)}
                    alt={project.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // 이미지 로드 실패 시 기본 이미지로 대체
                      const target = e.target as HTMLImageElement;
                      target.src = getDefaultImageUrl(project.title);
                    }}
                  />
                </div>
                
                {/* 프로젝트 정보 섹션 */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        <HighlightedText text={project.title} searchTerm={searchQuery} />
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        <HighlightedText 
                          text={project.description || '설명이 없습니다.'} 
                          searchTerm={searchQuery} 
                        />
                      </p>
                      <div className="mt-2 text-xs text-gray-500 space-x-2 flex items-center flex-wrap gap-1">
                        <span>{project.gen}기</span>
                        <span className={`px-2 py-0.5 rounded-full border text-xs ${getStatusColor(project.status)}`}>
                          {getStatusText(project.status)}
                        </span>
                        {project.keywords && project.keywords.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-400">키워드:</span>
                            <div className="flex flex-wrap gap-1">
                              {project.keywords.slice(0, 3).map((keyword, idx) => (
                                <span 
                                  key={idx}
                                  className="px-1.5 py-0.5 bg-gray-100 rounded text-xs"
                                >
                                  <HighlightedText text={keyword} searchTerm={searchQuery} />
                                </span>
                              ))}
                              {project.keywords.length > 3 && (
                                <span className="text-xs text-gray-400">
                                  +{project.keywords.length - 3}개
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      {project.start_date && (
                        <div className="mt-1 text-xs text-gray-400">
                          시작일: {new Date(project.start_date).toLocaleDateString('ko-KR')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 관리자 액션 버튼들 */}
                  <div className="mt-3 flex justify-between items-center">
                    <Link 
                      href={`/project/${project.id}`} 
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      상세보기
                    </Link>
                    <div className="flex space-x-2">
                      <Link 
                        href={`/project/${project.id}/edit`} 
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        편집
                      </Link>
                      <button 
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
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
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLocalLoading && !isLoadingProjects && !error && projects.length === 0 && (
          <div className="py-20 text-center text-gray-500">
            {searchQuery || statusFilter ? (
              <div className="space-y-2">
                <div>검색 결과가 없습니다.</div>
                <button
                  onClick={handleClearFilters}
                  className="text-blue-600 hover:underline text-sm"
                >
                  모든 프로젝트 보기
                </button>
              </div>
            ) : (
              <div>프로젝트가 없습니다.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}