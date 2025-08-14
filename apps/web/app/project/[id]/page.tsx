'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useProject } from '@prometheus-fe/hooks';

interface Project {
  id: number;
  title: string;
  description: string;
  gen: number;
  status: 'active' | 'completed' | 'paused';
  start_date: string;
  end_date?: string;
  github_url?: string;
  demo_url?: string;
  panel_url?: string;
  thumbnail_url?: string;
}

interface Member {
  id: string;
  member_id: string;
  role?: string | null;
  contribution?: string | null;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-white rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-gray-600 mt-2">{message}</p>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md border hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

interface MemberModalProps {
  show: boolean;
  mode: 'add' | 'edit';
  member?: Member | null;
  onClose: () => void;
  onSubmit: (member: any) => void;
}

function MemberModal({ show, mode, member, onClose, onSubmit }: MemberModalProps) {
  const [formData, setFormData] = useState({
    id: '',
    member_id: '',
    role: '',
    contribution: ''
  });

  useEffect(() => {
    if (member) {
      setFormData({
        id: member.id || '',
        member_id: member.member_id || '',
        role: member.role || '',
        contribution: member.contribution || ''
      });
    } else {
      setFormData({
        id: '',
        member_id: '',
        role: '',
        contribution: ''
      });
    }
  }, [member, show]);

  const handleSubmit = () => {
    const payload = {
      id: formData.id || undefined,
      member_id: formData.member_id,
      role: formData.role || undefined,
      contribution: formData.contribution || undefined
    };
    onSubmit(payload);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {mode === 'add' ? '멤버 추가' : '멤버 수정'}
          </h2>
          <button className="text-gray-500" onClick={onClose}>
            닫기
          </button>
        </div>
        <div className="space-y-3">
          <input
            value={formData.member_id}
            onChange={(e) => setFormData(prev => ({ ...prev, member_id: e.target.value }))}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="멤버 ID (예: 0001)"
            disabled={mode === 'edit'}
          />
          <input
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="역할 (예: 리더/팀원)"
          />
          <input
            value={formData.contribution}
            onChange={(e) => setFormData(prev => ({ ...prev, contribution: e.target.value }))}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="기여 (100자 이내)"
          />
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <button
            className="px-4 py-2 rounded-md border hover:bg-gray-50"
            onClick={onClose}
          >
            취소
          </button>
          <button
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleSubmit}
          >
            저장
          </button>
        </div>
      </div>
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
  } = useProject();

  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberModalMode, setMemberModalMode] = useState<'add' | 'edit'>('add');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // TODO: Replace with actual auth logic
  const canManage = true; // Manager 이상
  const isLeader = false; // 현재 사용자가 리더인지
  const canEdit = canManage || isLeader;
  const canEditMembers = canEdit;

  const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString('ko-KR') : '');

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="py-20 text-center text-gray-500">불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="py-8 text-center text-red-600">{error}</div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="py-8 text-center text-gray-500">프로젝트가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{selectedProject.title}</h1>
          <div className="mt-2 text-sm text-gray-500 space-x-2 flex items-center">
            <span>{selectedProject.gen}기</span>
            <span className="px-2 py-0.5 rounded-full border bg-gray-50">
              {getStatusText(selectedProject.status)}
            </span>
            <span>시작: {formatDate(selectedProject.start_date)}</span>
            {selectedProject.end_date && <span>종료: {formatDate(selectedProject.end_date)}</span>}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {canEdit && (
            <Link
              href={`/project/${projectId}/edit`}
              className="px-3 py-1.5 rounded border hover:bg-gray-50 transition-colors"
            >
              수정
            </Link>
          )}
          {canManage && (
            <button
              className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
              onClick={() => setConfirmDelete(true)}
            >
              삭제
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line">{selectedProject.description}</p>
            <div className="mt-4 space-y-2">
              {isValidUrl(selectedProject.github_url) && (
                <div>
                  <a
                    href={selectedProject.github_url!}
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                </div>
              )}
              {isValidUrl(selectedProject.demo_url) && (
                <div>
                  <a
                    href={selectedProject.demo_url!}
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Demo
                  </a>
                </div>
              )}
              {isValidUrl(selectedProject.thumbnail_url) && (
                <div className="mt-4">
                  <Image
                    src={selectedProject.thumbnail_url!}
                    alt="thumbnail"
                    className="rounded border max-w-full h-auto"
                    width={600}
                    height={400}
                  />
                </div>
              )}
              {isValidUrl(selectedProject.panel_url) && (
                <div className="mt-4">
                  <Image
                    src={selectedProject.panel_url!}
                    alt="panel"
                    className="rounded border max-w-full h-auto"
                    width={1000}
                    height={1000}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">팀원</h2>
          {isLoadingMembers ? (
            <div className="text-sm text-gray-500">멤버 불러오는 중...</div>
          ) : (
            <div className="space-y-2">
              {projectMembers.map((m) => (
                <div
                  key={m.id}
                  className="border rounded p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">
                      {m.member_id}{' '}
                      <span className="text-xs text-gray-500">/ {m.role || '팀원'}</span>
                    </div>
                    {m.contribution && (
                      <div className="text-xs text-gray-500">{m.contribution}</div>
                    )}
                  </div>
                  {canEditMembers && (
                    <div className="flex items-center space-x-2">
                      <button
                        className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                        onClick={() => openEditMember(m)}
                      >
                        수정
                      </button>
                      <button
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
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
                    className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    onClick={openAddMember}
                  >
                    멤버 추가
                  </button>
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

      <MemberModal
        show={showMemberModal}
        mode={memberModalMode}
        member={selectedMember}
        onClose={closeMemberModal}
        onSubmit={submitMember}
      />
    </div>
  );
}
