'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useProject, useImage, useMember } from '@prometheus-fe/hooks';
import AddMemberModal from '../../../src/components/AddMemberModal';
import GlassCard from '../../../src/components/GlassCard';
import RedButton from '../../../src/components/RedButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faExternalLinkAlt, faUsers, faCalendarAlt, faUserGraduate, faHeart, faHeartBroken } from '@fortawesome/free-solid-svg-icons';

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-md p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="gray-300 mt-2">{message}</p>
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
  } = useProject();

  const { getMember } = useMember();

  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberModalMode, setMemberModalMode] = useState<'add' | 'edit'>('add');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);


  // TODO: Replace with actual auth logic
  const canManage = true; // Manager 이상
  const isLeader = false; // 현재 사용자가 리더인지
  const canEdit = canManage || isLeader;
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

  const isValidUrl = (url?: string | null): boolean => {
    if (!url || url.trim() === '') return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // 좋아요 토글 처리
  const handleLikeToggle = async () => {
    if (!selectedProject || likeLoading) return;
    
    try {
      setLikeLoading(true);
      
      if (selectedProject.is_liked) {
        await removeProjectLike(selectedProject.id);
      } else {
        await addProjectLike(selectedProject.id);
      }
    } catch (error: any) {
      console.error('좋아요 처리 실패:', error);
      alert('좋아요 처리에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    } finally {
      setLikeLoading(false);
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

  useEffect(() => {
    if (projectId) {
      Promise.all([loadProject(), loadMembers()]);
    }
  }, [projectId]);



  if (isLoadingProject) {
    return (
      <div className="py-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-400 text-center">
          {error}
        </div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="py-6">
        <div className="text-center text-gray-300">프로젝트가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* 프로젝트 이미지 섹션 - 제목보다 위에 배치 */}
      {(isValidUrl(selectedProject.thumbnail_url) || isValidUrl(selectedProject.panel_url)) && (
        <div className="mb-8">
          {isValidUrl(selectedProject.thumbnail_url) && (
            <div className="mb-4">
              <Image
                src={getThumbnailUrl(selectedProject.thumbnail_url!, 400)}
                alt="프로젝트 썸네일"
                className="w-full max-w-xl mx-auto rounded-lg shadow-lg object-cover"
                width={200}
                height={100}
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
            <div>
              <Image
                src={getThumbnailUrl(selectedProject.panel_url!, 500)}
                alt="프로젝트 패널 이미지"
                className="mx-auto rounded-lg shadow-lg object-cover"
                width={400}
                height={100}
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

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{selectedProject.title}</h1>
          <div className="mt-2 text-sm text-gray-300 space-x-2 flex items-center">
            <span className="flex items-center">
              <FontAwesomeIcon icon={faUserGraduate} className="mr-1" />
              {selectedProject.gen}기
            </span>
            <span className="px-2 py-0.5 rounded-full border bg-white/10">
              {getStatusText(selectedProject.status)}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* 좋아요 버튼 */}
          <button
            onClick={handleLikeToggle}
            disabled={likeLoading}
            className={`inline-flex items-center px-3 py-1.5 rounded transition-colors ${
              selectedProject.is_liked
                ? 'bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30'
                : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
            } ${likeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FontAwesomeIcon 
              icon={selectedProject.is_liked ? faHeart : faHeartBroken} 
              className="mr-1 h-3 w-3" 
            />
            {selectedProject.like_count || 0}
          </button>
          
          {canEdit && (
            <Link
              href={`/project/${projectId}/edit`}
              className="inline-flex items-center px-3 py-1.5 rounded bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
            >
              <FontAwesomeIcon icon={faEdit} className="mr-1 h-3 w-3" />
              수정
            </Link>
          )}
          {canManage && (
            <RedButton
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center px-3 py-1.5"
            >
              <FontAwesomeIcon icon={faTrash} className="mr-1 h-3 w-3" />
              삭제
            </RedButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">프로젝트 소개</h2>
            <p className="text-gray-300 whitespace-pre-line leading-relaxed">{selectedProject.description}</p>
            
            <div className="mt-6 space-y-3">
              {isValidUrl(selectedProject.github_url) && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300 font-medium">GitHub:</span>
                  <a
                    href={selectedProject.github_url!}
                    className="text-blue-400 hover:text-blue-300 hover:underline transition-colors inline-flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="mr-1">📁</span>
                    {selectedProject.github_url}
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-1 h-2 w-2" />
                  </a>
                </div>
              )}
              {isValidUrl(selectedProject.demo_url) && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300 font-medium">Demo:</span>
                  <a
                    href={selectedProject.demo_url!}
                    className="text-blue-400 hover:text-blue-300 hover:underline transition-colors inline-flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-1" />
                    {selectedProject.demo_url}
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-1 h-2 w-2" />
                  </a>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-1">
          <GlassCard className="p-6 sticky top-8">
            <h2 className="text-lg font-semibold mb-4 text-white flex items-center">
              <FontAwesomeIcon icon={faUsers} className="mr-2" />
              팀원
            </h2>
            {isLoadingMembers ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
              </div>
            ) : (
              <div className="space-y-3">
                {projectMembers.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white/10 border border-white/20 rounded-lg p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium flex items-center">
                        <span className="truncate text-white">{m.member_name || '알 수 없음'}</span>
                        <span className="text-xs text-gray-300 ml-2 flex-shrink-0">/ {m.role || '팀원'}</span>
                        {m.member_gen !== null && m.member_gen !== undefined && (
                          <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded ml-2 flex-shrink-0">
                            {m.member_gen}기
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-300 mt-1 break-words">
                        {m.contribution && (
                          <div className="truncate">{m.contribution}</div>
                        )}
                      </div>
                    </div>
                    {canEditMembers && (
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          className="px-2 py-1 text-xs border rounded hover:bg-gray-100 whitespace-nowrap transition-colors"
                          onClick={() => openEditMember(m)}
                        >
                          수정
                        </button>
                        <button
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 whitespace-nowrap transition-colors"
                          onClick={() => handleRemoveMember(m)}
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {canEditMembers && (
                  <div className="pt-2">
                    <button
                      className="w-full px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      onClick={openAddMember}
                    >
                      멤버 추가
                    </button>
                  </div>
                )}
              </div>
            )}
          </GlassCard>
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
