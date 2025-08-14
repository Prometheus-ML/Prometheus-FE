import { useApi } from '@prometheus-fe/context';
import { Project, ProjectMember } from '@prometheus-fe/types';
import { useState, useCallback } from 'react';

export function useProject() {
  const { project } = useApi();
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // 프로젝트 목록 조회
  const fetchProjects = useCallback(async (params?: any) => {
    if (!project) {
      console.warn('project is not available. Ensure useProject is used within ApiProvider.');
      setIsLoadingProjects(false);
      return;
    }
    try {
      setIsLoadingProjects(true);
      const data = await project.list(params);
      setAllProjects(data.projects || []);
      console.log('data.projects', data.projects);

    } catch (error) {
      console.error('프로젝트 목록 조회 실패:', error);
      setAllProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  }, [project]);

  // 특정 프로젝트 조회
  const fetchProject = useCallback(async (projectId: number | string) => {
    if (!project) {
      console.warn('project is not available. Ensure useProject is used within ApiProvider.');
      return;
    }
    try {
      setIsLoadingProject(true);
      const data = await project.get(projectId);
      setSelectedProject(data);

    } catch (error) {
      console.error(`프로젝트 ${projectId} 조회 실패:`, error);
    } finally {
      setIsLoadingProject(false);
    }
  }, [project]);

  // 프로젝트 생성
  const createProject = useCallback(async (formData: any) => {
    if (!project) {
      throw new Error('project is not available');
    }
    try {
      const response = await project.create(formData);
      await fetchProjects();

    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
      throw error;
    }
  }, [project, fetchProjects]);

  // 프로젝트 수정
  const updateProject = useCallback(async (projectId: number | string, data: any) => {
    if (!project) {
      throw new Error('project is not available');
    }
    try {
      const response = await project.update(projectId, data);
      if (selectedProject?.id === projectId) {
        setSelectedProject(response.project);
      }
      await fetchProjects();

    } catch (error) {
      console.error(`프로젝트 ${projectId} 수정 실패:`, error);
      throw error;
    }
  }, [project, selectedProject, fetchProjects]);

  // 프로젝트 삭제
  const deleteProject = useCallback(async (projectId: number | string) => {
    if (!project) {
      throw new Error('project is not available');
    }
    try {
      const response = await project.remove(projectId);
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
      await fetchProjects();

    } catch (error) {
      console.error(`프로젝트 ${projectId} 삭제 실패:`, error);
      throw error;
    }
  }, [project, selectedProject, fetchProjects]);

  // 프로젝트 멤버 목록 조회
  const fetchProjectMembers = useCallback(async (projectId: number | string, params?: any) => {
    if (!project) {
      console.warn('project is not available. Ensure useProject is used within ApiProvider.');
      return;
    }
    try {
      setIsLoadingMembers(true);
      const data = await project.listMembers(projectId, params);
      setProjectMembers(data.members || []);

    } catch (error) {
      console.error(`프로젝트 ${projectId} 멤버 목록 조회 실패:`, error);
      setProjectMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  }, [project]);

  // 프로젝트에 멤버 추가
  const addProjectMember = useCallback(async (projectId: number | string, data: any) => {
    if (!project) {
      throw new Error('project is not available');
    }
    try {
      const response = await project.addMember(projectId, data);
      await fetchProjectMembers(projectId);

    } catch (error) {
      console.error(`프로젝트 ${projectId}에 멤버 추가 실패:`, error);
      throw error;
    }
  }, [project, fetchProjectMembers]);

  // 프로젝트 멤버 수정
  const updateProjectMember = useCallback(async (projectId: number | string, memberId: string, data: any) => {
    if (!project) {
      throw new Error('project is not available');
    }
    try {
      const response = await project.updateMember(projectId, memberId, data);
      await fetchProjectMembers(projectId);

    } catch (error) {
      console.error(`프로젝트 ${projectId} 멤버 ${memberId} 수정 실패:`, error);
      throw error;
    }
  }, [project, fetchProjectMembers]);

  // 프로젝트에서 멤버 제거
  const removeProjectMember = useCallback(async (projectId: number | string, memberId: string) => {
    if (!project) {
      throw new Error('project is not available');
    }
    try {
      const response = await project.removeMember(projectId, memberId);
      await fetchProjectMembers(projectId);

    } catch (error) {
      console.error(`프로젝트 ${projectId}에서 멤버 ${memberId} 제거 실패:`, error);
      throw error;
    }
  }, [project, fetchProjectMembers]);

  // 프로젝트 선택 핸들러
  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  // 프로젝트 선택 해제 핸들러
  const handleProjectDeselect = () => {
    setSelectedProject(null);
    setProjectMembers([]);
  };

  // Admin용: 모든 프로젝트 조회 (관리자 페이지용)
  const fetchAllProjectsForAdmin = useCallback(async () => {
    if (!project) {
      console.warn('project is not available. Ensure useProject is used within ApiProvider.');
      setIsLoadingProjects(false);
      return;
    }
    try {
      setIsLoadingProjects(true);
      const data = await project.listForAdmin({ size: 1000 }); // 관리자 전용 API 사용
      setAllProjects(data.projects || []);
      console.log('Admin: 모든 프로젝트 조회 완료', data.projects);
    } catch (error) {
      console.error('Admin: 프로젝트 목록 조회 실패:', error);
      setAllProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  }, [project]);

  return {
    // 상태
    projects: allProjects,
    selectedProject,
    projectMembers,
    isLoadingProjects,
    isLoadingProject,
    isLoadingMembers,
    
    // API 함수들
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    fetchProjectMembers,
    addProjectMember,
    updateProjectMember,
    removeProjectMember,
    
    // 핸들러들
    handleProjectSelect,
    handleProjectDeselect,
    
    // Admin용 함수
    fetchAllProjectsForAdmin,
  };
}
