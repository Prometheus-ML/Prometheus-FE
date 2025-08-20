'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProjectForm from '../../../../src/components/ProjectForm';
import { useProject } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';
import GlassCard from '../../../../src/components/GlassCard';
import RedButton from '../../../../src/components/RedButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEdit } from '@fortawesome/free-solid-svg-icons';

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
    updateProject,
    isProjectLeader,
    isProjectMember
  } = useProject();
  
  // 권한 확인
  const { canAccessAdministrator } = useAuthStore();
  const canManage = canAccessAdministrator(); // Administrator 이상만 수정 가능
  const isLeader = isProjectLeader(parseInt(projectId)); // 프로젝트 팀장인지 확인
  const isMember = isProjectMember(parseInt(projectId)); // 프로젝트 멤버인지 확인
  const isActiveProject = selectedProject?.status === 'active'; // 프로젝트가 active 상태인지
  
  // Administrator 이상이거나, 프로젝트 멤버이면서 active 상태일 때만 수정 가능
  const canEdit = canManage || (isMember && isActiveProject);

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
    if (!canEdit) {
      console.warn('수정 권한이 없습니다.');
      // 즉시 리다이렉트하지 않고 UI에서 처리
    }
  }, [canEdit]);

  // Check permissions
  if (!canEdit) {
    return (
      <div className="md:max-w-6xl max-w-xl mx-auto min-h-screen font-pretendard">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-white mb-4">접근 권한 없음</h1>
          <p className="text-gray-300 mb-4">
            {!isMember 
              ? '프로젝트 멤버만 수정할 수 있습니다.' 
              : !isActiveProject 
                ? '완료되거나 중지된 프로젝트는 수정할 수 없습니다.' 
                : '수정 권한이 없습니다.'
            }
          </p>
          <Link 
            href={`/project/${projectId}`} 
            className="text-red-400 hover:text-red-300 inline-flex items-center"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-1" />
            프로젝트 상세로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (isLoadingProject) {
    return (
      <div className="md:max-w-6xl max-w-xl mx-auto min-h-screen font-pretendard">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
        </div>
      </div>
    );
  }

  if (error && !selectedProject) {
    return (
      <div className="md:max-w-6xl max-w-xl mx-auto min-h-screen font-pretendard">
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-400 text-center mb-4">
          {error}
        </div>
        <div className="text-center space-y-2">
          <RedButton onClick={loadProject} className="mr-2">
            다시 시도
          </RedButton>
          <Link 
            href={`/project/${projectId}`} 
            className="text-red-400 hover:text-red-300 inline-flex items-center"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-1" />
            프로젝트 상세로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="md:max-w-6xl max-w-xl mx-auto min-h-screen font-pretendard">
        <div className="text-center text-gray-300 mb-4">프로젝트를 찾을 수 없습니다.</div>
        <div className="text-center">
          <Link 
            href="/project" 
            className="text-red-400 hover:text-red-300 inline-flex items-center"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-1" />
            프로젝트 목록으로 돌아가기
          </Link>
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
            <Link href={`/project/${projectId}`} className="w-10 h-10 flex items-center justify-center text-[#FFFFFF] hover:text-[#e0e0e0] transition-colors">
              <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-kimm-bold text-[#FFFFFF]">프로젝트 수정</h1>
              <p className="text-sm font-pretendard text-[#e0e0e0]">프로젝트 정보 수정</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* 에러 메시지 표시 */}
        {error && selectedProject && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-400">
            {error}
          </div>
        )}

        {/* 제출 중 상태 표시 */}
        {isSubmitting && (
          <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-md text-blue-400">
            프로젝트를 수정하는 중...
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
            thumbnail_url: selectedProject.thumbnail_url || '',
            status: selectedProject.status as 'active' | 'completed' | 'paused',
          }}
          mode="edit"
          showStatus={false}
          onSubmit={handleSave}
        />
      </div>
    </div>
  );
}
