'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useProject, useImage, useMember } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';
import AddMemberModal from '@/src/components/member/AddMemberModal';
import GlassCard from '@/src/components/GlassCard';
import RedButton from '@/src/components/RedButton';
import Portal from '@/src/components/Portal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faTrash, 
  faExternalLinkAlt, 
  faUsers, 
  faCalendarAlt, 
  faUserGraduate, 
  faHeart, 
  faArrowLeft,
  faCircle,
  faFolder
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

interface Project {
  id: number;
  title: string;
  description: string;
  gen: number;
  status: 'active' | 'completed' | 'paused';
  github_url?: string;
  demo_url?: string;
  panel_url?: string;
  thumbnail_url?: string;
  like_count?: number;
  is_liked?: boolean;
}

interface Member {
  id: string;
  member_id: string;
  role?: string | null;
  contribution?: string | null;
  member_name?: string | null;
  member_gen?: number | null;
}

interface MemberWithDetails extends Member {
  name?: string;
  email?: string;
}

interface ConfirmModalProps {
  show: boolean;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({ show, title, message, confirmText, onConfirm, onCancel }: ConfirmModalProps) {
  if (!show) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center modal-fixed p-4 z-50">
      <GlassCard className="w-full max-w-md p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="text-gray-300 mt-2">{message}</p>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
          >
            취소
          </button>
          <RedButton onClick={onConfirm}>
            {confirmText}
          </RedButton>
        </div>
      </GlassCard>
    </div>
    </Portal>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const {
    selectedProject,
    projectMembers,
    isLoadingProject,
    isLoadingMembers,
    fetchProject,
    fetchProjectMembers,
    deleteProject,
    addProjectMember,
    updateProjectMember,
    removeProjectMember,
    addProjectLike,
    removeProjectLike,
    isProjectLeader,
    isProjectMember,
  } = useProject();

  const { getMember } = useMember();

  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [isLikeUpdating, setIsLikeUpdating] = useState(false);

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberModalMode, setMemberModalMode] = useState<'add' | 'edit'>('add');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // 실제 인증 상태 사용
  const { canAccessAdministrator, isAuthenticated } = useAuthStore();
  const canManage = canAccessAdministrator(); // Administrator 이상
  const isLeader = isProjectLeader(parseInt(projectId)); // 현재 사용자가 프로젝트 팀장인지
  const isMember = isProjectMember(parseInt(projectId)); // 현재 사용자가 프로젝트 멤버인지
  const isActiveProject = selectedProject?.status === 'active'; // 프로젝트가 active 상태인지
  
  // Administrator 이상이거나, 프로젝트 멤버이면서 active 상태일 때만 수정 가능
  const canEdit = canManage || (isMember && isActiveProject);
  const canEditMembers = canEdit;
  
  // useImage 훅 사용
  const { getThumbnailUrl, getDefaultImageUrl } = useImage();

  const formatDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('ko-KR') : '');

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '진행중';
      case 'completed': return '완료';
      case 'paused': return '중지';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500/20 text-green-300 border-green-500/30',
      completed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      paused: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  // 기수별 색상 반환 (멤버 페이지와 동일한 스타일)
  const getGenColor = (gen: number) => {
    if (gen <= 4) return 'bg-gray-500/20 text-gray-300'; // 4기 이하는 이전기수로 회색
    return 'bg-[#8B0000] text-[#ffa282]';
  };

  const isValidUrl = (url?: string | null): boolean => {
    if (!url || url.trim() === '') return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Skeleton UI Component
  const SkeletonCard = () => (
    <div className="p-4 animate-pulse">
      <div className="flex items-center justify-center mb-4">
        <div className="w-16 h-16 bg-gray-600 rounded-full"></div>
      </div>
      <div className="w-20 h-5 bg-gray-600 rounded mb-2"></div>
      <div className="w-32 h-4 bg-gray-600 rounded"></div>
    </div>
  );

  useEffect(() => {
    if (projectId) {
      Promise.all([loadProject(), loadMembers()]);
    }
  }, [projectId]);

  // 좋아요 토글 처리
  const handleLikeToggle = async () => {
    if (!selectedProject || likeLoading || isLikeUpdating) return;
    
    // 로그인하지 않은 사용자는 좋아요 기능 사용 불가
    if (!isAuthenticated()) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }
    
    try {
      setLikeLoading(true);
      setIsLikeUpdating(true);
      
      if (selectedProject.is_liked) {
        await removeProjectLike(selectedProject.id);
      } else {
        await addProjectLike(selectedProject.id);
      }
      
      // 좋아요 상태만 업데이트 (전체 프로젝트 정보를 다시 로드하지 않음)
      // 백엔드에서 업데이트된 is_liked 상태를 가져오기 위해 새로고침
      await loadProject();
    } catch (error: any) {
      console.error('좋아요 처리 실패:', error);
      alert('좋아요 처리에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    } finally {
      setLikeLoading(false);
      setIsLikeUpdating(false);
    }
  };

  const loadProject = async () => {
    try {
      setError('');
      await fetchProject(parseInt(projectId));
    } catch (e: any) {
      console.error(e);
      setError(e.message || '프로젝트를 불러오지 못했습니다.');
    }
  };

  const loadMembers = async () => {
    try {
      await fetchProjectMembers(parseInt(projectId), { page: 1, size: 100 });
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await deleteProject(parseInt(projectId));
      alert('프로젝트가 삭제되었습니다!');
      router.push('/project');
    } catch (e: any) {
      alert('삭제 실패: ' + (e?.message || e.message));
    } finally {
      setConfirmDelete(false);
    }
  };

  const openAddMember = () => {
    setMemberModalMode('add');
    setSelectedMember(null);
    setShowMemberModal(true);
  };

  const openEditMember = (m: Member) => {
    setMemberModalMode('edit');
    setSelectedMember({ ...m });
    setShowMemberModal(true);
  };

  const closeMemberModal = () => {
    setShowMemberModal(false);
  };

  const submitMember = async (payload: any) => {
    try {
      if (memberModalMode === 'add') {
        await addProjectMember(parseInt(projectId), payload);
      } else {
        await updateProjectMember(parseInt(projectId), payload.member_id, payload);
      }
      await loadMembers();
      setShowMemberModal(false);
      alert('멤버가 저장되었습니다!');
    } catch (e: any) {
      alert('멤버 저장 실패: ' + (e?.message || e.message));
    }
  };

  const handleRemoveMember = async (m: Member) => {
    if (confirm('정말 이 멤버를 삭제하시겠습니까?')) {
      try {
        await removeProjectMember(parseInt(projectId), m.member_id);
        await loadMembers();
        alert('멤버가 삭제되었습니다!');
      } catch (e: any) {
        alert('멤버 삭제 실패: ' + (e?.message || e.message));
      }
    }
  };

  // Loading state with skeleton
  if (isLoadingProject && !error && !isLikeUpdating) {
    return (
      <div className="md:max-w-6xl max-w-xl mx-auto min-h-screen font-pretendard">
        {/* 헤더 */}
        <header className="mx-4 px-6 py-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.back()} 
                className="w-10 h-10 flex items-center justify-center text-[#FFFFFF] hover:text-[#e0e0e0] transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-kimm-bold text-[#FFFFFF]">프로젝트 상세</h1>
                <p className="text-sm font-pretendard text-[#e0e0e0]">프로젝트 정보 및 팀원</p>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 py-6">
          {/* 프로젝트 제목 및 메타 정보 Skeleton */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-48 h-8 bg-gray-600 rounded"></div>
                <div className="w-20 h-6 bg-gray-600 rounded"></div>
                <div className="w-12 h-6 bg-gray-600 rounded"></div>
              </div>
              
              {/* 프로젝트 링크 아이콘 Skeleton */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-6 h-6 bg-gray-600 rounded"></div>
                <div className="w-6 h-6 bg-gray-600 rounded"></div>
              </div>
            </div>
            
            {/* 수정 버튼 Skeleton */}
            <div className="w-16 h-8 bg-gray-600 rounded"></div>
          </div>

          {/* 이미지가 없을 때 빈 로고 표시 Skeleton */}
          <div className="mb-8 flex justify-center">
            <div className="w-64 h-64 bg-gray-600 rounded-lg"></div>
          </div>

          {/* 프로젝트 설명 Skeleton */}
          <div className="mb-8">
            <GlassCard className="p-6">
              <div className="space-y-2">
                <div className="w-full h-4 bg-gray-600 rounded"></div>
                <div className="w-3/4 h-4 bg-gray-600 rounded"></div>
                <div className="w-1/2 h-4 bg-gray-600 rounded"></div>
              </div>
            </GlassCard>
          </div>

          {/* 액션 버튼들 Skeleton */}
          <div className="mb-8 flex items-center space-x-2">
            <div className="w-16 h-8 bg-gray-600 rounded"></div>
            <div className="w-16 h-8 bg-gray-600 rounded"></div>
            <div className="w-16 h-8 bg-gray-600 rounded"></div>
          </div>
        </div>

        {/* 구성원 Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-white flex items-center">
                <FontAwesomeIcon icon={faUsers} className="mr-2" />
                구성원
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white/10 border border-white/20 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <div className="w-12 h-5 bg-gray-600 rounded"></div>
                      <div className="w-20 h-6 bg-gray-600 rounded"></div>
                      <div className="w-8 h-4 bg-gray-600 rounded"></div>
                    </div>
                    <div className="w-full h-3 bg-gray-600 rounded mt-2"></div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="md:max-w-6xl max-w-xl mx-auto min-h-screen font-pretendard">
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-400 text-center">
          {error}
        </div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="md:max-w-6xl max-w-xl mx-auto min-h-screen font-pretendard">
        {/* 헤더 */}
        <header className="mx-4 px-6 py-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.back()} 
                className="w-10 h-10 flex items-center justify-center text-[#FFFFFF] hover:text-[#e0e0e0] transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-kimm-bold text-[#FFFFFF]">프로젝트 상세</h1>
                <p className="text-sm font-pretendard text-[#e0e0e0]">프로젝트 정보 및 팀원</p>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 py-6">
          {/* 프로젝트 제목 및 메타 정보 Skeleton */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-48 h-8 bg-gray-600 rounded"></div>
                <div className="w-20 h-6 bg-gray-600 rounded"></div>
                <div className="w-12 h-6 bg-gray-600 rounded"></div>
              </div>
              
              {/* 프로젝트 링크 아이콘 Skeleton */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-6 h-6 bg-gray-600 rounded"></div>
                <div className="w-6 h-6 bg-gray-600 rounded"></div>
              </div>
            </div>
            
            {/* 수정 버튼 Skeleton */}
            <div className="w-16 h-8 bg-gray-600 rounded"></div>
          </div>

          {/* 이미지가 없을 때 빈 로고 표시 Skeleton */}
          <div className="mb-8 flex justify-center">
            <div className="w-64 h-64 bg-gray-600 rounded-lg"></div>
          </div>

          {/* 프로젝트 설명 Skeleton */}
          <div className="mb-8">
            <GlassCard className="p-6">
              <div className="space-y-2">
                <div className="w-full h-4 bg-gray-600 rounded"></div>
                <div className="w-3/4 h-4 bg-gray-600 rounded"></div>
                <div className="w-1/2 h-4 bg-gray-600 rounded"></div>
              </div>
            </GlassCard>
          </div>

          {/* 액션 버튼들 Skeleton */}
          <div className="mb-8 flex items-center space-x-2">
            <div className="w-16 h-8 bg-gray-600 rounded"></div>
            <div className="w-16 h-8 bg-gray-600 rounded"></div>
            <div className="w-16 h-8 bg-gray-600 rounded"></div>
          </div>
        </div>

        {/* 구성원 Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-white flex items-center">
                <FontAwesomeIcon icon={faUsers} className="mr-2" />
                구성원
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white/10 border border-white/20 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <div className="w-12 h-5 bg-gray-600 rounded"></div>
                      <div className="w-20 h-6 bg-gray-600 rounded"></div>
                      <div className="w-8 h-4 bg-gray-600 rounded"></div>
                    </div>
                    <div className="w-full h-3 bg-gray-600 rounded mt-2"></div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
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
            <button 
              onClick={() => router.back()} 
              className="w-10 h-10 flex items-center justify-center text-[#FFFFFF] hover:text-[#e0e0e0] transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-kimm-bold text-[#FFFFFF]">프로젝트 상세</h1>
              <p className="text-sm font-pretendard text-[#e0e0e0]">프로젝트 정보 및 팀원</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* 프로젝트 제목 및 메타 정보 */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <h1 className="text-2xl font-semibold text-white">{selectedProject.title}</h1>
              <span className={`px-1.5 py-0.5 text-xs rounded-full flex font-semibold items-center ${getGenColor(selectedProject.gen)}`}>
                {selectedProject.gen <= 4 ? '이전기수' : `${selectedProject.gen}기`}
              </span>
              {/* 좋아요 버튼 - 제목 오른쪽에 */}
              <button
                onClick={handleLikeToggle}
                disabled={likeLoading || !isAuthenticated()}
                className={`inline-flex items-center px-1 py-1 text-sm transition-colors ${
                  selectedProject.is_liked
                    ? 'text-red-300 hover:text-red-200'
                    : 'text-white hover:text-gray-300'
                } ${likeLoading || !isAuthenticated() ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={!isAuthenticated() ? '로그인이 필요한 기능입니다' : ''}
              >
                <FontAwesomeIcon 
                  icon={faHeart} 
                  className={`mr-1 h-3 w-3 ${likeLoading ? 'animate-pulse' : ''} ${selectedProject.is_liked ? 'text-red-300' : 'text-white'}`}
                />
                {likeLoading ? '...' : (selectedProject.like_count || 0)}
              </button>
            </div>
            
           
            
            {/* 프로젝트 링크 아이콘 - 제목 아래에 배경 없이 */}
            <div className="flex items-center gap-4 mb-6">
              {/* GitHub */}
              {selectedProject.github_url ? (
                <a 
                  href={selectedProject.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-300 transition-colors"
                  title="GitHub"
                >
                  <FontAwesomeIcon icon={faGithub as any} className="w-6 h-6" />
                </a>
              ) : (
                <div className="text-gray-500 cursor-not-allowed" title="GitHub 없음">
                  <FontAwesomeIcon icon={faGithub as any} className="w-6 h-6" />
                </div>
              )}
              
              {/* Demo */}
              {selectedProject.demo_url ? (
                <a 
                  href={selectedProject.demo_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-300 transition-colors"
                  title="Demo"
                >
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="w-6 h-6" />
                </a>
              ) : (
                <div className="text-gray-500 cursor-not-allowed" title="Demo 없음">
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="w-6 h-6" />
                </div>
              )}
            </div>
          </div>
          
          {/* 수정 버튼 - team_leader일 때만 오른쪽 위에 고정 */}
          {isMember && (
            <Link
              href={`/project/${projectId}/edit`}
              className="inline-flex items-center px-3 py-1.5 rounded bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors flex-shrink-0"
            >
              <FontAwesomeIcon icon={faEdit} className="mr-1 h-3 w-3" />
              수정
            </Link>
          )}
        </div>

        {/* 이미지가 없을 때 빈 로고 표시 */}
        {!isValidUrl(selectedProject.thumbnail_url) && !isValidUrl(selectedProject.panel_url) && (
          <div className="mb-8 flex justify-center">
            <div className="w-64 h-64 bg-white/10 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faFolder} className="text-white/30 text-6xl" />
            </div>
          </div>
        )}

        {/* 프로젝트 설명 - 아이콘 아래에 전체 너비 */}
        <div className="mb-8">
          <GlassCard className="p-6">
            <p className="text-gray-300 whitespace-pre-line leading-relaxed">{selectedProject.description}</p>
          </GlassCard>
        </div>

        {/* 프로젝트 이미지 섹션 - 크게 표시 */}
      {(isValidUrl(selectedProject.thumbnail_url) || isValidUrl(selectedProject.panel_url)) && (
        <div className="mb-8">
          {isValidUrl(selectedProject.thumbnail_url) && (
              <div className="mb-6">
              <Image
                  src={getThumbnailUrl(selectedProject.thumbnail_url!, 800)}
                alt="프로젝트 썸네일"
                  className="w-full max-w-4xl mx-auto rounded-lg shadow-lg object-cover"
                  width={800}
                  height={400}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== selectedProject.thumbnail_url!) {
                    target.src = selectedProject.thumbnail_url!;
                  }
                }}
              />
            </div>
          )}
          {isValidUrl(selectedProject.panel_url) && (
              <div className="mb-6">
              <Image
                  src={getThumbnailUrl(selectedProject.panel_url!, 1000)}
                alt="프로젝트 패널 이미지"
                  className="w-full max-w-5xl mx-auto rounded-lg shadow-lg object-cover"
                  width={1000}
                  height={500}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== selectedProject.panel_url!) {
                    target.src = selectedProject.panel_url!;
                  }
                }}
              />
            </div>
          )}
        </div>
      )}

        {/* 액션 버튼들 */}
        <div className="mb-8 flex items-center space-x-2">
          {isMember && !isActiveProject && (
            <div className="inline-flex items-center px-3 py-1.5 rounded bg-gray-500/20 border border-gray-500/30 text-gray-300 cursor-not-allowed" title="완료되거나 중지된 프로젝트는 수정할 수 없습니다">
              <FontAwesomeIcon icon={faEdit} className="mr-1 h-3 w-3" />
              수정 불가
            </div>
          )}
        </div>
      </div>

      <div className="w-full">
        <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-white flex items-center">
              <FontAwesomeIcon icon={faUsers} className="mr-2" />
                구성원
            </h2>
            {isLoadingMembers ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {projectMembers.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white/10 border border-white/20 rounded-lg p-3 text-center"
                  >
                    <div className="flex items-center justify-center gap-1 mb-2">
                        {m.member_gen !== null && m.member_gen !== undefined && (
                        <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium flex items-center gap-1 bg-[#8B0000] text-[#ffa282]`}>
                            {m.member_gen}기
                          </span>
                        )}
                      <h3 className="text-lg font-semibold text-white">{m.member_name || '알 수 없음'}</h3>
                      
                      <div className="text-xs text-gray-300">/ {m.role === 'team_leader' ? '팀장' : m.role === 'team_member' ? '팀원' : m.role || '팀원'}</div>
                      </div>
                        {m.contribution && (
                      <div className="text-xs text-gray-300 mt-2 truncate" title={m.contribution}>
                        {m.contribution}
                      </div>
                    )}
                  </div>
                ))}

                {projectMembers.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-400">
                    등록된 구성원이 없습니다.
                  </div>
                )}
              </div>
            )}
        </div>
      </div>

      <ConfirmModal
        show={confirmDelete}
        title="프로젝트 삭제"
        message="정말 삭제하시겠습니까?"
        confirmText="삭제"
        onConfirm={handleDeleteProject}
        onCancel={() => setConfirmDelete(false)}
      />

      <AddMemberModal
        show={showMemberModal}
        mode={memberModalMode}
        member={selectedMember}
        onClose={closeMemberModal}
        onSubmit={submitMember}
      />
    </div>
  );
}
