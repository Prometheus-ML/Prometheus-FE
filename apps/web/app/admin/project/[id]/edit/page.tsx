'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProjectForm from '../../../../../src/components/ProjectForm';
import { useProject } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';
import GlassCard from '../../../../../src/components/GlassCard';
import RedButton from '../../../../../src/components/RedButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ProjectMember } from '@prometheus-fe/types';

export default function AdminEditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<ProjectMember | null>(null);
  
  // useProject 훅 사용
  const {
    selectedProject,
    isLoadingProject,
    fetchProject,
    updateProject,
    updateProjectForAdmin,
    projectMembers,
    fetchProjectMembers,
    addProjectMember,
    updateProjectMemberForAdmin,
    removeProjectMember
  } = useProject();
  
  // 권한 확인
  const { canAccessAdministrator, isAuthenticated } = useAuthStore();
  const canManage = canAccessAdministrator(); // Administrator 이상만 수정 가능

  const loadProject = async () => {
    try {
      setError('');
      await fetchProject(parseInt(projectId));
      await fetchProjectMembers(parseInt(projectId));
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
      
      // Admin 모드이므로 admin용 API 호출
      await updateProjectForAdmin(parseInt(projectId), formData);
      
      alert('프로젝트가 수정되었습니다!');
      router.push(`/admin/project`);
    } catch (e: any) {
      console.error('프로젝트 수정 실패:', e);
      const errorMessage = e?.message || '프로젝트 수정에 실패했습니다.';
      setError(errorMessage);
      alert('저장 실패: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMember = async (memberData: any) => {
    try {
      await addProjectMember(parseInt(projectId), memberData);
      alert('팀원이 추가되었습니다!');
      setShowMemberModal(false);
    } catch (e: any) {
      console.error('팀원 추가 실패:', e);
      alert('팀원 추가 실패: ' + (e?.message || '알 수 없는 오류'));
    }
  };

  const handleUpdateMember = async (memberId: string, memberData: any) => {
    try {
      await updateProjectMemberForAdmin(parseInt(projectId), memberId, memberData);
      alert('팀원 정보가 수정되었습니다!');
      setShowMemberModal(false);
      setEditingMember(null);
    } catch (e: any) {
      console.error('팀원 수정 실패:', e);
      alert('팀원 수정 실패: ' + (e?.message || '알 수 없는 오류'));
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('정말로 이 팀원을 제거하시겠습니까?')) {
      return;
    }

    try {
      await removeProjectMember(parseInt(projectId), memberId);
      alert('팀원이 제거되었습니다!');
    } catch (e: any) {
      console.error('팀원 제거 실패:', e);
      alert('팀원 제거 실패: ' + (e?.message || '알 수 없는 오류'));
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
      alert('관리자 권한이 필요합니다.');
      router.push('/admin/project');
    }
  }, [canManage, router]);

  // Check permissions
  if (!canManage) {
    return (
      <div className="md:max-w-6xl max-w-xl mx-auto min-h-screen font-pretendard">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-white mb-4">접근 권한 없음</h1>
          <p className="text-gray-300 mb-4">관리자 권한이 필요합니다.</p>
          <Link 
            href="/admin/project"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            프로젝트 목록으로
          </Link>
        </div>
      </div>
    );
  }

  if (isLoadingProject) {
    return (
      <div className="md:max-w-6xl max-w-xl mx-auto min-h-screen font-pretendard">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="text-gray-300 mt-4">프로젝트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="md:max-w-6xl max-w-xl mx-auto min-h-screen font-pretendard">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-white mb-4">프로젝트를 찾을 수 없습니다</h1>
          <Link 
            href="/admin/project"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            프로젝트 목록으로
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
            <Link 
              href="/admin/project"
              className="w-10 h-10 flex items-center justify-center text-[#FFFFFF] hover:text-[#e0e0e0] transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-kimm-bold text-[#FFFFFF]">프로젝트 수정 (관리자)</h1>
              <p className="text-sm font-pretendard text-[#e0e0e0]">{selectedProject.title}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-400">
            {error}
          </div>
        )}

        {/* 프로젝트 폼 */}
        <GlassCard className="mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">프로젝트 정보</h2>
            <ProjectForm
              initial={selectedProject}
              mode="edit"
              showStatus={true}
              onSubmit={handleSave}
            />
          </div>
        </GlassCard>

        {/* 팀원 관리 */}
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">팀원 관리</h2>
              <RedButton
                onClick={() => {
                  setEditingMember(null);
                  setShowMemberModal(true);
                }}
                className="inline-flex items-center"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                팀원 추가
              </RedButton>
            </div>

            {/* 팀원 목록 */}
            <div className="space-y-3">
              {projectMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-4 border border-white/30 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {member.member_gen !== null && member.member_gen !== undefined && (
                            <span className="px-1.5 py-0.5 text-xs rounded-full font-medium bg-[#8B0000] text-[#ffa282]">
                              {member.member_gen}기
                            </span>
                          )}
                          <h3 className="text-lg font-semibold text-white">
                            {member.member_name || '알 수 없음'}
                          </h3>
                          <span className="text-gray-300 text-sm">
                            / {member.role === 'team_leader' ? '팀장' : member.role === 'team_member' ? '팀원' : member.role || '팀원'}
                          </span>
                        </div>
                        {member.contribution && (
                          <p className="text-sm text-gray-300">{member.contribution}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <RedButton
                        onClick={() => {
                          setEditingMember(member);
                          setShowMemberModal(true);
                        }}
                        className="px-3 py-1 text-sm"
                      >
                        <FontAwesomeIcon icon={faEdit} className="mr-1 h-3 w-3" />
                        수정
                      </RedButton>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        <FontAwesomeIcon icon={faTrash} className="mr-1 h-3 w-3" />
                        제거
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {projectMembers.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  등록된 팀원이 없습니다.
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 팀원 추가/수정 모달 */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingMember ? '팀원 수정' : '팀원 추가'}
            </h3>
            
            <MemberForm
              member={editingMember}
              onSubmit={editingMember 
                ? (data) => handleUpdateMember(editingMember.id, data)
                : handleAddMember
              }
              onCancel={() => {
                setShowMemberModal(false);
                setEditingMember(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// 팀원 폼 컴포넌트
interface MemberFormProps {
  member?: ProjectMember | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

function MemberForm({ member, onSubmit, onCancel }: MemberFormProps) {
  const [formData, setFormData] = useState({
    member_id: member?.member_id || '',
    role: member?.role || 'team_member',
    contribution: member?.contribution || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white mb-1">멤버 ID</label>
        <input
          type="text"
          value={formData.member_id}
          onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
          className="w-full text-white bg-white/20 border border-white/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="멤버 ID를 입력하세요"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1">역할</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full text-white bg-white/20 border border-white/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="team_leader">팀장</option>
          <option value="team_member">팀원</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1">기여 내용</label>
        <textarea
          value={formData.contribution}
          onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
          className="w-full text-white bg-white/20 border border-white/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="기여 내용을 입력하세요"
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <RedButton type="submit" className="flex-1">
          {member ? '수정' : '추가'}
        </RedButton>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  );
}
