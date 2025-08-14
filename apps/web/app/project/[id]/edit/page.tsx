'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProjectForm from '../../../../src/components/ProjectForm';

interface Project {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  gen: number;
  status: 'active' | 'completed' | 'paused';
  start_date: string;
  end_date?: string;
  github_url?: string;
  demo_url?: string;
  panel_url?: string;
}

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // TODO: Replace with actual auth logic
  const canManage = true; // Manager 이상만 수정 가능
  const weights = { Root: 0, Super: 1, Administrator: 2, Manager: 3, Member: 4 };

  const loadProject = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // TODO: Replace with actual API call using projectApi
      // const { projectApi } = useApi();
      // const projectData = await projectApi.get(projectId);
      // setProject(projectData);
      
      // Mock data for UI (API 연동 후 제거 예정)
      setProject({
        id: projectId,
        title: '샘플 프로젝트',
        description: '이것은 샘플 프로젝트입니다.\n\n여러 줄로 된 설명을 보여주는 예시입니다.\n프로젝트에 대한 상세한 정보가 여기에 표시됩니다.',
        keywords: ['React', 'TypeScript', 'Next.js'],
        gen: 1,
        status: 'active',
        start_date: '2024-01-01',
        end_date: '2024-06-01',
        github_url: 'https://github.com/example/project',
        demo_url: 'https://demo.example.com',
        panel_url: 'https://via.placeholder.com/600x400'
      });
    } catch (e) {
      console.error(e);
      setError('프로젝트를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      // TODO: Replace with actual API call
      // await projectApi.updateProject(projectId, formData);
      console.log('Updating project:', formData);
      alert('프로젝트가 수정되었습니다! (실제 API 연동 필요)');
      router.push(`/project/${projectId}`);
    } catch (e: any) {
      alert('저장 실패: ' + (e?.data?.message || e.message));
    }
  };

  useEffect(() => {
    if (!canManage) {
      alert('수정 권한이 없습니다.');
      router.replace(`/project/${projectId}`);
      return;
    }
    
    if (projectId) {
      loadProject();
    }
  }, [projectId, canManage, router]);

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

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="py-20 text-center text-gray-500">불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="py-8 text-center text-red-600">{error}</div>
        <div className="text-center">
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

      {project && (
        <ProjectForm 
          initial={project}
          mode="edit"
          showStatus={true}
          onSubmit={handleSave}
        />
      )}
    </div>
  );
}
