'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import Image from 'next/image';
import { useImage, useProject, useMember } from '@prometheus-fe/hooks';
import AddMemberModal from './AddMemberModal';

interface ProjectMember {
  member_id: string;
  role?: string;
  contribution?: string;
}

interface ProjectFormData {
  id?: string | number;
  title: string;
  description: string;
  keywords: string[];
  start_date: string;
  end_date: string;
  github_url: string;
  demo_url: string;
  panel_url: string;
  gen?: number;
  status: 'active' | 'completed' | 'paused';
  members: ProjectMember[];
}

interface ProjectFormProps {
  initial?: Partial<ProjectFormData>;
  mode?: 'create' | 'edit';
  showStatus?: boolean;
  onSubmit: (data: ProjectFormData) => void;
}

export default function ProjectForm({ 
  initial = {}, 
  mode = 'create', 
  showStatus = false, 
  onSubmit 
}: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    keywords: [],
    start_date: '',
    end_date: '',
    github_url: '',
    demo_url: '',
    panel_url: '',
    gen: undefined,
    status: 'active',
    members: []
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<ProjectMember | null>(null);
  
  // useImage 훅 사용
  const {
    isUploading,
    uploadError,
    uploadImage,
    validateImageFile,
    getThumbnailUrl,
    clearError
  } = useImage({
    onUploadStart: () => console.log('이미지 업로드 시작'),
    onUploadSuccess: (response) => {
      console.log('이미지 업로드 성공:', response);
    },
    onUploadError: (error) => {
      console.error('이미지 업로드 실패:', error);
    }
  });

  // useProject 훅 사용
  const { fetchProjectMembers, projectMembers } = useProject();
  
  // useMember 훅 사용
  const { getMember } = useMember();
  
  // 멤버 상세 정보를 저장할 상태
  const [membersWithDetails, setMembersWithDetails] = useState<Array<ProjectMember & { name?: string; email?: string }>>([]);

  useEffect(() => {
    const applyInitial = async (p: Partial<ProjectFormData>) => {
      setFormData({
        title: p?.title || '',
        description: p?.description || '',
        keywords: Array.isArray(p?.keywords) ? [...p.keywords] : [],
        start_date: p?.start_date ? String(p.start_date).substring(0, 10) : '',
        end_date: p?.end_date ? String(p.end_date).substring(0, 10) : '',
        github_url: p?.github_url || '',
        demo_url: p?.demo_url || '',
        panel_url: p?.panel_url || '',
        gen: p?.gen ?? undefined,
        status: p?.status || 'active',
        members: Array.isArray(p?.members) ? [...p.members] : []
      });

      // 수정 모드이고 프로젝트 ID가 있으면 멤버 목록을 불러옴
      if (mode === 'edit' && p?.id) {
        try {
          await fetchProjectMembers(p.id, { page: 1, size: 100 });
        } catch (error) {
          console.error('프로젝트 멤버 조회 실패:', error);
        }
      }
    };
    
    applyInitial(initial);
  }, [initial, mode, fetchProjectMembers]);

  // projectMembers가 변경될 때 formData.members 업데이트 및 상세 정보 로드
  useEffect(() => {
    if (projectMembers.length > 0 && mode === 'edit') {
      // ProjectMember 형식으로 변환
      const convertedMembers: ProjectMember[] = projectMembers.map(member => ({
        member_id: member.member_id,
        role: member.role || undefined,
        contribution: member.contribution || undefined
      }));
      
      setFormData(prev => ({
        ...prev,
        members: convertedMembers
      }));

      // 멤버 상세 정보 로드
      loadMemberDetails(convertedMembers);
    }
  }, [projectMembers, mode]);

  // 멤버 상세 정보 로드 함수
  const loadMemberDetails = async (members: ProjectMember[]) => {
    try {
      const membersWithDetails = await Promise.all(
        members.map(async (member) => {
          try {
            const memberDetail = await getMember(member.member_id);
            return {
              ...member,
              name: memberDetail.name,
              email: memberDetail.email
            };
          } catch (error) {
            console.error(`멤버 ${member.member_id} 정보 로드 실패:`, error);
            return {
              ...member,
              name: '알 수 없음',
              email: '알 수 없음'
            };
          }
        })
      );
      
      setMembersWithDetails(membersWithDetails);
    } catch (error) {
      console.error('멤버 상세 정보 로드 실패:', error);
    }
  };

  const updateFormData = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 멤버 추가/수정 모달 관련 함수들
  const openAddMember = () => {
    setEditingMember(null);
    setShowMemberModal(true);
  };

  const openEditMember = (member: ProjectMember) => {
    setEditingMember(member);
    setShowMemberModal(true);
  };

  const closeMemberModal = () => {
    setShowMemberModal(false);
    setEditingMember(null);
  };

  const handleMemberSubmit = (payload: any) => {
    if (editingMember) {
      // 기존 멤버 수정
      const updatedMembers = formData.members.map(m => 
        m.member_id === editingMember.member_id 
          ? { ...m, member_id: payload.member_id, role: payload.role, contribution: payload.contribution }
          : m
      );
      updateFormData('members', updatedMembers);
    } else {
      // 새 멤버 추가
      const newMember: ProjectMember = {
        member_id: payload.member_id,
        role: payload.role,
        contribution: payload.contribution
      };
      updateFormData('members', [...formData.members, newMember]);
    }
    closeMemberModal();
  };

  const removeMember = (memberId: string) => {
    const updatedMembers = formData.members.filter(m => m.member_id !== memberId);
    updateFormData('members', updatedMembers);
  };

  const addKeywordFromInput = () => {
    const raw = (keywordInput || '').split(',').map(s => s.trim()).filter(Boolean);
    const newKeywords = [...formData.keywords];
    
    for (const r of raw) {
      if (!newKeywords.includes(r)) {
        newKeywords.push(r);
      }
    }
    
    updateFormData('keywords', newKeywords);
    setKeywordInput('');
  };

  const removeKeyword = (index: number) => {
    const newKeywords = [...formData.keywords];
    newKeywords.splice(index, 1);
    updateFormData('keywords', newKeywords);
  };

  const handleKeywordKeydown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeywordFromInput();
    }
  };

  const handlePanelFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    
    // 이미지 파일 검증
    const validationError = validateImageFile(file);
    if (validationError) {
      alert(validationError);
      return;
    }

    // 이전 에러 클리어
    clearError();
    
    try {
      // useImage 훅을 사용하여 이미지 업로드
      const imageUrl = await uploadImage(file, 'project');
      if (imageUrl) {
        updateFormData('panel_url', imageUrl);
      }
    } catch (error) {
      // 에러는 useImage 훅에서 처리되므로 여기서는 추가 처리만
      console.error('이미지 업로드 처리 중 오류:', error);
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.title.trim()) {
      alert('프로젝트 제목을 입력해주세요.');
      return;
    }
    
    if (!formData.start_date) {
      alert('프로젝트 시작일을 선택해주세요.');
      return;
    }
    
    // Convert date strings to ISO 8601 format
    const convertToISO = (dateString: string) => {
      if (!dateString) return '';
      // HTML date input returns YYYY-MM-DD, convert to ISO format
      return new Date(dateString + 'T00:00:00.000Z').toISOString();
    };
    
    // Clean up empty strings and prepare payload
    const payload: ProjectFormData = {
      title: formData.title.trim(),
      description: formData.description.trim() || '',
      keywords: formData.keywords.length ? formData.keywords : [],
      start_date: convertToISO(formData.start_date),
      end_date: formData.end_date ? convertToISO(formData.end_date) : '',
      github_url: formData.github_url.trim() || '',
      demo_url: formData.demo_url.trim() || '',
      panel_url: formData.panel_url.trim() || '',
      gen: typeof formData.gen === 'number' ? formData.gen : undefined,
      status: formData.status,
      members: formData.members,
      ...(showStatus ? { status: formData.status } : {})
    };
    
    console.log('Submitting project form data:', payload);
    console.log('Converted dates:', {
      start_date: payload.start_date,
      end_date: payload.end_date
    });
    onSubmit(payload);
  };

  return (
    <div className="space-y-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
      <input
        value={formData.title}
        onChange={(e) => updateFormData('title', e.target.value)}
        className="border border-white/30 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/20 text-black placeholder-gray-600"
        placeholder="제목 (필수)"
      />
      
      <textarea
        value={formData.description}
        onChange={(e) => updateFormData('description', e.target.value)}
        className="border border-white/30 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/20 text-black placeholder-gray-600"
        rows={6}
        placeholder="설명"
      />

      <div>
        <label className="block text-sm mb-1 font-medium text-white">키워드</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.keywords.map((keyword, i) => (
            <span
              key={keyword + i}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-white/30 bg-white/20 text-white"
            >
              {keyword}
              <button
                type="button"
                className="ml-1 text-xs text-white hover:text-gray-300"
                onClick={() => removeKeyword(i)}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <input
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onKeyDown={handleKeywordKeydown}
          className="border border-white/30 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/20 text-black placeholder-gray-600"
          placeholder="키워드를 입력하고 Enter로 추가"
        />
      </div>

      {/* 멤버 관리 섹션 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-white">팀원</label>
          <span className="text-xs text-gray-500">
            {formData.members.length}명
          </span>
        </div>
        

        
        {formData.members.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="text-gray-500 mb-2">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium mb-2">아직 팀원이 없습니다</p>
            <p className="text-gray-500 text-sm mb-4">프로젝트에 참여할 팀원을 추가해보세요</p>
            <button
              type="button"
              onClick={openAddMember}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              첫 번째 팀원 추가
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-3">
              {membersWithDetails.length > 0 ? (
                // 상세 정보가 로드된 경우 이름 표시
                membersWithDetails.map((member, index) => (
                  <div
                    key={member.member_id}
                    className="flex items-center justify-between p-3 border border-white/30 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-white">
                        {member.name || member.member_id}
                        {member.role && <span className="text-gray-300 ml-2">/ {member.role}</span>}
                      </div>
                      <div className="text-xs text-gray-300 mt-1">
                        {member.email && `${member.email}`}
                        {member.contribution && member.email && ` • `}
                        {member.contribution && `${member.contribution}`}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditMember(member)}
                        className="px-2 py-1 text-xs border border-white/30 rounded hover:bg-white/20 transition-colors text-white"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMember(member.member_id)}
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        제거
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                // 상세 정보가 아직 로드되지 않은 경우 ID 표시
                formData.members.map((member, index) => (
                  <div
                    key={member.member_id}
                    className="flex items-center justify-between p-3 border border-white/30 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-white">
                        {member.member_id}
                        {member.role && <span className="text-gray-300 ml-2">/ {member.role}</span>}
                      </div>
                      {member.contribution && (
                        <div className="text-xs text-gray-300 mt-1">{member.contribution}</div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditMember(member)}
                        className="px-2 py-1 text-xs border border-white/30 rounded hover:bg-white/20 transition-colors text-white"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMember(member.member_id)}
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        제거
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button
              type="button"
              onClick={openAddMember}
              className="px-3 py-2 text-sm border border-dashed border-white/30 rounded-lg text-white hover:border-white/50 hover:bg-white/10 transition-colors w-full"
            >
              + 팀원 추가
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          type="date"
          value={formData.start_date}
          onChange={(e) => updateFormData('start_date', e.target.value)}
          className="border border-white/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/20 text-black"
          placeholder="시작일(필수)"
        />
        <input
          type="date"
          value={formData.end_date}
          onChange={(e) => updateFormData('end_date', e.target.value)}
          className="border border-white/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/20 text-black"
          placeholder="종료일"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          value={formData.github_url}
          onChange={(e) => updateFormData('github_url', e.target.value)}
          className="border border-white/30 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/20 text-black placeholder-gray-600"
          placeholder="GitHub URL"
        />
        <input
          value={formData.demo_url}
          onChange={(e) => updateFormData('demo_url', e.target.value)}
          className="border border-white/30 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/20 text-black placeholder-gray-600"
          placeholder="Demo URL"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <input
            type="file"
            accept="image/*"
            onChange={handlePanelFileChange}
            disabled={isUploading}
            className="text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-white/20 file:text-white hover:file:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {isUploading && <span className="text-sm text-gray-300">업로드 중...</span>}
        </div>
        {uploadError && (
          <div className="text-sm text-red-400 bg-red-500/20 border border-red-500/30 rounded px-3 py-2">
            {uploadError}
            <button
              type="button"
              onClick={clearError}
              className="ml-2 text-red-300 hover:text-red-200"
            >
              ✕
            </button>
          </div>
        )}
        {formData.panel_url && (
          <div className="mt-2">
            <div className="relative inline-block">
              <Image
                src={getThumbnailUrl(formData.panel_url, 300)}
                alt="프로젝트 썸네일"
                className="rounded border object-cover"
                width={300}
                height={200}
                onError={(e) => {
                  // 이미지 로드 실패 시 원본 URL로 재시도
                  const target = e.target as HTMLImageElement;
                  if (target.src !== formData.panel_url) {
                    target.src = formData.panel_url;
                  }
                }}
              />
              <button
                type="button"
                onClick={() => updateFormData('panel_url', '')}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                title="이미지 제거"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          type="number"
          value={formData.gen || ''}
          onChange={(e) => updateFormData('gen', e.target.value ? Number(e.target.value) : undefined)}
          className="border border-white/30 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/20 text-black placeholder-gray-600"
          placeholder="기수 (숫자)"
        />
        {showStatus && (
          <select
            value={formData.status}
            onChange={(e) => updateFormData('status', e.target.value as 'active' | 'completed' | 'paused')}
            className="border border-white/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/20 text-white"
          >
            <option value="active" className="bg-gray-800 text-white">진행중</option>
            <option value="completed" className="bg-gray-800 text-white">완료</option>
            <option value="paused" className="bg-gray-800 text-white">중지</option>
          </select>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors border border-red-700 shadow-lg"
        >
          {mode === 'edit' ? '저장' : '생성'}
        </button>
      </div>

      {/* AddMemberModal 사용 */}
      <AddMemberModal
        show={showMemberModal}
        mode={editingMember ? 'edit' : 'add'}
        member={editingMember ? {
          id: editingMember.member_id,
          member_id: editingMember.member_id,
          role: editingMember.role || '',
          contribution: editingMember.contribution || ''
        } : undefined}
        onClose={closeMemberModal}
        onSubmit={handleMemberSubmit}
      />
    </div>
  );
}
