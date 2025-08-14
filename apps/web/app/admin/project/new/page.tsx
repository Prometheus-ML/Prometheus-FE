'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProjectForm from '@/src/components/ProjectForm';
import { useProject } from '@prometheus-fe/hooks';

export default function NewProjectPage() {
  const router = useRouter();
  const { createProject } = useProject();

  // TODO: Replace with actual auth logic
  const canCreate = true; // Manager 이상만 생성 가능
  const weights = { Root: 0, Super: 1, Administrator: 2, Manager: 3, Member: 4 };

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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한 없음</h1>
          <p className="text-gray-600 mb-4">프로젝트 생성 권한이 없습니다.</p>
          <Link 
            href="/admin/project" 
            className="text-blue-600 hover:underline"
          >
            어드민 프로젝트 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">프로젝트 생성</h1>
        <Link 
          href="/admin/project" 
          className="text-sm text-gray-600 hover:underline"
        >
          목록으로
        </Link>
      </div>

      <ProjectForm 
        initial={{}}
        mode="create"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
