import { useApi } from '@prometheus-fe/context';
import { Project, ProjectMember } from '@prometheus-fe/types';
import { useState, useCallback, useEffect } from 'react';

export function useProject() {
  const { project } = useApi();
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  
  // 검색 및 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // 클라이언트 사이드 필터링 함수
  const filterProjects = useCallback((projects: Project[], search: string, status: string) => {
    let filtered = [...projects];

    // 검색어 필터링 (제목, 설명, 키워드에서 검색)
    if (search && search.trim()) {
      const searchTerm = search.toLowerCase().trim();
      filtered = filtered.filter(project => {
        const titleMatch = project.title?.toLowerCase().includes(searchTerm);
        const descriptionMatch = project.description?.toLowerCase().includes(searchTerm);
        const keywordMatch = project.keywords?.some(keyword => 
          keyword.toLowerCase().includes(searchTerm)
        );
        return titleMatch || descriptionMatch || keywordMatch;
      });
    }

    // 상태 필터링
    if (status && status.trim()) {
      filtered = filtered.filter(project => project.status === status);
    }

    return filtered;
  }, []);

  // 필터링된 프로젝트 업데이트
  const updateFilteredProjects = useCallback(() => {
    const filtered = filterProjects(allProjects, searchQuery, statusFilter);
    setFilteredProjects(filtered);
  }, [allProjects, searchQuery, statusFilter, filterProjects]);

  // 필터링 상태가 변경될 때마다 필터링된 프로젝트 업데이트
  useEffect(() => {
    updateFilteredProjects();
  }, [updateFilteredProjects]);

  // 프로젝트 목록 조회
  const fetchProjects = useCallback(async (params?: any) => {
    if (!project) {
      console.warn('project is not available. Ensure useProject is used within ApiProvider.');
      setIsLoadingProjects(false);
      return;
    }
    try {
      setIsLoadingProjects(true);
      // 백엔드에서 모든 프로젝트를 가져옴 (클라이언트 사이드 필터링을 위해)
      const data = await project.list({ size: 100 }); // 충분히 큰 사이즈로 설정
      setAllProjects(data.projects || []);
      console.log('data.projects', data.projects);

    } catch (error) {
      console.error('프로젝트 목록 조회 실패:', error);
      setAllProjects([]);
      setFilteredProjects([]);
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
      setFilteredProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  }, [project]);

  // 검색어 설정
  const setSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // 상태 필터 설정
  const setStatus = useCallback((status: string) => {
    setStatusFilter(status);
  }, []);

  // 검색 및 필터 초기화
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('');
  }, []);

  // 검색 결과 하이라이트용 함수
  const highlightSearchTerm = useCallback((text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }, []);

  return {
    // 상태
    projects: filteredProjects, // 필터링된 프로젝트 반환
    allProjects, // 전체 프로젝트도 필요시 접근 가능
    selectedProject,
    projectMembers,
    isLoadingProjects,
    isLoadingProject,
    isLoadingMembers,
    
    // 검색 및 필터 상태
    searchQuery,
    statusFilter,
    
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
    
    // 검색 및 필터 함수들
    setSearch,
    setStatus,
    clearFilters,
    highlightSearchTerm,
    
    // Admin용 함수
    fetchAllProjectsForAdmin,
  };
}
