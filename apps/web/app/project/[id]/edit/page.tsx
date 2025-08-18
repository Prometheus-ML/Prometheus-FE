'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProjectForm from '../../../../src/components/ProjectForm';
import { useProject } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // useProject 훅 사용
  const {
    selectedProject,
    isLoadingProject,
    fetchProject,
    updateProject
  } = useProject();
  
  // 권한 확인
  const { canAccessManager } = useAuthStore();
  const canManage = canAccessManager(); // Manager 이상만 수정 가능

  const loadProject = async () => {
    try {
      setError('');
      await fetchProject(parseInt(projectId));
    } catch (e) {
      console.error('프로젝트 로드 실패:', e);
      setError('프로젝트를 불러오지 못했습니다.');
    }
  };

  const handleSave = async (formData: any) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      console.log('Updating project:', formData);
      await updateProject(parseInt(projectId), formData);
      
      alert('프로젝트가 수정되었습니다!');
      router.push(`/project/${projectId}`);
    } catch (e: any) {
      console.error('프로젝트 수정 실패:', e);
      const errorMessage = e?.message || '프로젝트 수정에 실패했습니다.';
      setError(errorMessage);
      alert('저장 실패: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  // 권한이 없는 경우 처리
  useEffect(() => {
    if (!canManage) {
      console.warn('수정 권한이 없습니다.');
      // 즉시 리다이렉트하지 않고 UI에서 처리
    }
  }, [canManage]);

  // Check permissions
  if (!canManage) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한 없음</h1>
          <p className="text-gray-600 mb-4">수정 권한이 없습니다.</p>
          <Link 
            href={`/project/${projectId}`} 
            className="text-blue-600 hover:underline"
          >
            프로젝트 상세로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (isLoadingProject) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="py-20 text-center text-gray-500">프로젝트 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error && !selectedProject) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="py-8 text-center text-red-600">{error}</div>
        <div className="text-center space-y-2">
          <button
            onClick={loadProject}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mr-2"
          >
            다시 시도
          </button>
          <Link 
            href={`/project/${projectId}`} 
            className="text-blue-600 hover:underline block"
          >
            프로젝트 상세로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="py-8 text-center text-gray-500">프로젝트를 찾을 수 없습니다.</div>
        <div className="text-center">
          <Link 
            href="/project" 
            className="text-blue-600 hover:underline"
          >
            프로젝트 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">프로젝트 수정</h1>
        <Link 
          href={`/project/${projectId}`} 
          className="text-sm text-gray-600 hover:underline"
        >
          상세로
        </Link>
      </div>

      {/* 에러 메시지 표시 */}
      {error && selectedProject && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}

      {/* 제출 중 상태 표시 */}
      {isSubmitting && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-blue-600 text-sm">프로젝트를 수정하는 중...</div>
        </div>
      )}

      <ProjectForm 
        initial={{
          ...selectedProject,
          description: selectedProject.description || '',
          keywords: selectedProject.keywords || [],
          github_url: selectedProject.github_url || '',
          demo_url: selectedProject.demo_url || '',
          panel_url: selectedProject.panel_url || '',
          start_date: selectedProject.start_date || null,
          end_date: selectedProject.end_date || null,
          status: selectedProject.status as 'active' | 'completed' | 'paused',
        }}
        mode="edit"
        showStatus={true}
        onSubmit={handleSave}
      />
    </div>
  );
}
