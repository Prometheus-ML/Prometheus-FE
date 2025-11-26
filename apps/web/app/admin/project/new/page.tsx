'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProjectForm from '@/src/components/project/ProjectForm';
import { useProject } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';
import GlassCard from '@/src/components/GlassCard';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function NewProjectPage() {
  const router = useRouter();
  const { createProject } = useProject();
  const { canAccessAdministrator } = useAuthStore();



  // 권한 확인
  const canCreate = canAccessAdministrator();

  const handleSubmit = async (formData: any) => {
    try {
      console.log('Creating project:', formData);
      
      await createProject(formData);
      
      alert('프로젝트가 생성되었습니다!');
      router.push('/admin/project');
    } catch (e: any) {
      console.error('Project creation failed:', e);
      alert('생성 실패: ' + (e?.message || '알 수 없는 오류가 발생했습니다.'));
    }
  };

  // Check permissions
  if (!canCreate) {
    return (
      <div className="md:max-w-6xl max-w-xl mx-auto min-h-screen font-pretendard">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-white mb-4">접근 권한 없음</h1>
          <p className="text-gray-300 mb-4">프로젝트 생성 권한이 없습니다.</p>
          <Link 
            href="/admin/project" 
            className="text-red-400 hover:text-red-300 inline-flex items-center"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-1" />
            어드민 프로젝트 목록으로 돌아가기
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
            <Link href="/admin/project" className="w-10 h-10 flex items-center justify-center text-[#FFFFFF] hover:text-[#e0e0e0] transition-colors">
              <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-kimm-bold text-[#FFFFFF]">프로젝트 생성 (관리자)</h1>
              <p className="text-sm font-pretendard text-[#e0e0e0]">새로운 프로젝트 등록</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* 프로젝트 폼 */}
        <GlassCard className="mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">프로젝트 정보</h2>
            <ProjectForm 
              initial={{}}
              mode="create"
              showStatus={true}
              isAdmin={true}
              onSubmit={handleSubmit}
            />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}


