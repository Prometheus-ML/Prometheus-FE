'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useProject } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';

export default function ProjectPage() {
  const { projects, isLoadingProjects, fetchProjects } = useProject();
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [isLocalLoading, setIsLocalLoading] = useState(false);  // 로컬 로딩 상태 추가
  const { canAccessManager } = useAuthStore();
  
  // Manager 이상만 생성 가능
  const canCreate = canAccessManager();

  const loadProjects = async () => {
    // 이미 로딩 중이면 중복 요청 방지
    if (isLocalLoading || isLoadingProjects) {
      console.log('ProjectPage: 이미 로딩 중이므로 요청 건너뜀');
      return;
    }

    try {
      setIsLocalLoading(true);
      setError('');
      console.log('ProjectPage: 프로젝트 목록 로드 시작');
      
      // 상태 필터 적용 (백엔드 제한: size <= 100)
      const params: any = { size: 99 };  // 100 이하로 조정
      if (status) {
        params.status = status;
      }
      
      await fetchProjects(params);
      console.log('ProjectPage: 프로젝트 목록 로드 완료');
    } catch (err) {
      console.error('ProjectPage: 프로젝트 목록 로드 실패:', err);
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
    console.log('ProjectPage: 초기 로드 useEffect 실행');
    loadProjects();
  }, []); // 빈 의존성 배열로 한 번만 실행

  // 상태 변경 시 프로젝트 목록 다시 로드 (중복 방지)
  useEffect(() => {
    if (status !== '' && !isLocalLoading && !isLoadingProjects) {
      console.log('ProjectPage: 상태 변경으로 인한 재로드');
      loadProjects();
    }
  }, [status]); // status만 의존성으로 설정

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

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 bg-white/95 backdrop-blur-sm min-h-screen shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">프로젝트</h1>
        {canCreate && (
          <div className="flex items-center space-x-2">
            <Link 
              href="/project/new" 
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              프로젝트 생성
            </Link>
          </div>
        )}
      </div>

      <div className="mb-4 flex items-center space-x-2">
        <select 
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">전체</option>
          <option value="active">진행중</option>
          <option value="completed">완료</option>
          <option value="paused">중지</option>
        </select>
        <button 
          onClick={loadProjects}
          className="px-3 py-2 text-sm rounded-md border hover:bg-gray-50 transition-colors"
        >
          필터 적용
        </button>
      </div>

      {isLocalLoading || isLoadingProjects ? (
        <div className="py-20 text-center text-gray-500">불러오는 중...</div>
      ) : null}
      
      {error && !isLocalLoading && !isLoadingProjects && (
        <div className="py-8 text-center text-red-600">{error}</div>
      )}
      
      {!isLocalLoading && !isLoadingProjects && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{project.description || '설명이 없습니다.'}</p>
                  <div className="mt-2 text-xs text-gray-500 space-x-2 flex items-center">
                    <span>{project.gen}기</span>
                    <span className={`px-2 py-0.5 rounded-full border text-xs ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </span>
                    {project.keywords && project.keywords.length > 0 && (
                      <span className="text-xs text-gray-400">
                        {project.keywords.length}개 키워드
                      </span>
                    )}
                  </div>
                  {project.start_date && (
                    <div className="mt-1 text-xs text-gray-400">
                      시작일: {new Date(project.start_date).toLocaleDateString('ko-KR')}
                    </div>
                  )}
                </div>
                <Link 
                  href={`/project/${project.id}`} 
                  className="text-blue-600 hover:underline text-sm ml-4"
                >
                  상세
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLocalLoading && !isLoadingProjects && !error && projects.length === 0 && (
        <div className="py-20 text-center text-gray-500">
          프로젝트가 없습니다.
        </div>
      )}
    </div>
  );
}
