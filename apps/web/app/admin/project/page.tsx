'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  team_size: number;
}

export default function AdminProjectPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // TODO: Replace with actual API call
      // const response = await adminApi.getProjects();
      // setProjects(response.projects || []);
      
      // Mock data for UI
      setProjects([
        {
          id: '1',
          title: '웹 개발 프로젝트',
          description: 'React와 Node.js를 활용한 웹 애플리케이션 개발',
          category: '웹 개발',
          status: '진행중',
          team_size: 4
        },
        {
          id: '2',
          title: '모바일 앱 개발',
          description: 'Flutter를 사용한 크로스 플랫폼 모바일 앱',
          category: '모바일',
          status: '완료',
          team_size: 3
        },
        {
          id: '3',
          title: 'AI 챗봇 프로젝트',
          description: '자연어 처리를 활용한 고객 서비스 챗봇',
          category: 'AI/ML',
          status: '계획중',
          team_size: 5
        }
      ]);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('프로젝트 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const viewProject = (project: Project) => {
    console.log('View project:', project);
    // TODO: Navigate to project detail page or open modal
  };

  const editProject = (project: Project) => {
    console.log('Edit project:', project);
    // TODO: Navigate to edit page or open edit modal
  };

  const deleteProject = async (project: Project) => {
    if (!confirm(`정말로 "${project.title}" 프로젝트를 삭제하시겠습니까?`)) {
      return;
    }
    
    try {
      // TODO: Replace with actual API call
      // await adminApi.deleteProject(project.id);
      console.log('Deleting project:', project.id);
      await loadProjects();
      alert('프로젝트가 삭제되었습니다! (실제 API 연동 필요)');
    } catch (err) {
      console.error('Failed to delete project:', err);
      setError('프로젝트 삭제 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            프로젝트 관리
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            프로젝트 및 활동을 관리하세요
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={() => router.push('/admin/project/new')}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            프로젝트 추가
          </button>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">프로젝트 목록</h3>
            
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {error && !isLoading && (
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">오류 발생</h3>
                <p className="mt-1 text-sm text-gray-500">{error}</p>
              </div>
            )}

            {!isLoading && !error && (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium text-gray-900">{project.title}</h4>
                          <p className="text-sm text-gray-500">{project.description}</p>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span>{project.category}</span>
                            <span>{project.status}</span>
                            <span>{project.team_size}명</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewProject(project)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          상세보기
                        </button>
                        <button
                          onClick={() => editProject(project)}
                          className="text-green-600 hover:text-green-900 text-sm font-medium"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => deleteProject(project)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && !error && projects.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">프로젝트 없음</h3>
                <p className="mt-1 text-sm text-gray-500">아직 등록된 프로젝트가 없습니다.</p>
                <div className="mt-6">
                  <button
                    onClick={() => router.push('/admin/project/new')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    첫 번째 프로젝트 추가
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
}
