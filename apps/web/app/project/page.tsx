'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  description: string;
  gen: number;
  status: 'active' | 'completed' | 'paused';
  start_date: string;
  end_date?: string;
}

export default function ProjectPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  
  // TODO: Replace with actual auth logic
  const canCreate = true; // Manager 이상만 생성 가능

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError('');
      // TODO: Replace with actual API call
      // const res = await projectApi.getProjects({ status });
      // setProjects(res?.projects || res?.items || []);
      
      // Mock data for UI
      setProjects([
        {
          id: '1',
          title: '샘플 프로젝트 1',
          description: '이것은 샘플 프로젝트입니다. 프로젝트에 대한 상세한 설명이 여기에 들어갑니다.',
          gen: 1,
          status: 'active',
          start_date: '2024-01-01'
        },
        {
          id: '2',
          title: '샘플 프로젝트 2',
          description: '두 번째 샘플 프로젝트입니다. 완료된 프로젝트의 예시입니다.',
          gen: 1,
          status: 'completed',
          start_date: '2024-01-15',
          end_date: '2024-03-15'
        }
      ]);
    } catch (e) {
      console.error(e);
      setError('프로젝트 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      {isLoading && (
        <div className="py-20 text-center text-gray-500">불러오는 중...</div>
      )}
      
      {error && !isLoading && (
        <div className="py-8 text-center text-red-600">{error}</div>
      )}
      
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{project.description}</p>
                  <div className="mt-2 text-xs text-gray-500 space-x-2 flex items-center">
                    <span>{project.gen}기</span>
                    <span className={`px-2 py-0.5 rounded-full border text-xs ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </span>
                  </div>
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

      {!isLoading && !error && projects.length === 0 && (
        <div className="py-20 text-center text-gray-500">
          프로젝트가 없습니다.
        </div>
      )}
    </div>
  );
}
