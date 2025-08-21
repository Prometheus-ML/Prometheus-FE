'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import Image from 'next/image';
import { useImage, useProject } from '@prometheus-fe/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder } from '@fortawesome/free-solid-svg-icons';

interface ProjectMember {
  member_id: string;
  member_name?: string;
  member_gen?: number;
  role?: string;
  contribution?: string;
}

interface ProjectFormData {
  id?: string | number;
  title: string;
  description: string;
  keywords: string[];
  github_url: string;
  demo_url: string;
  panel_url: string;
  thumbnail_url?: string; // 썸네일 이미지 URL
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
    github_url: '',
    demo_url: '',
    panel_url: '',
    thumbnail_url: '',
    gen: undefined,
    status: 'active',
    members: []
  });

  const [keywordInput, setKeywordInput] = useState('');

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

  useEffect(() => {
    const applyInitial = async (p: Partial<ProjectFormData>) => {
      setFormData({
        title: p?.title || '',
        description: p?.description || '',
        keywords: Array.isArray(p?.keywords) ? [...p.keywords] : [],
        github_url: p?.github_url || '',
        demo_url: p?.demo_url || '',
        panel_url: p?.panel_url || '',
        thumbnail_url: p?.thumbnail_url || '',
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

  // projectMembers가 변경될 때 formData.members 업데이트
  useEffect(() => {
    if (projectMembers.length > 0 && mode === 'edit') {
      const convertedMembers = projectMembers.map(member => ({
        member_id: member.member_id,
        member_name: member.member_name || undefined,
        member_gen: member.member_gen || undefined,
        role: member.role || undefined,
        contribution: member.contribution || undefined
      }));
      
      setFormData(prev => ({
        ...prev,
        members: convertedMembers
      }));
    }
  }, [projectMembers, mode]);

  const updateFormData = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addKeywordFromInput = () => {
    const raw = (keywordInput || '').split(',').map(s => s.trim()).filter(Boolean);
    const newKeywords = [...formData.keywords];
    
    for (const r of raw) {
      if (!newKeywords.includes(r) && newKeywords.length < 3) { // 3개 제한
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

  const handleThumbnailFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      alert(validationError);
      return;
    }

    clearError();

    try {
      const imageUrl = await uploadImage(file, 'project');
      if (imageUrl) {
        updateFormData('thumbnail_url', imageUrl);
      }
    } catch (error) {
      console.error('썸네일 이미지 업로드 처리 중 오류:', error);
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.title.trim()) {
      alert('프로젝트 제목을 입력해주세요.');
      return;
    }
    
    // Clean up empty strings and prepare payload
    const payload: ProjectFormData = {
      title: formData.title.trim(),
      description: formData.description.trim() || '',
      keywords: formData.keywords.length ? formData.keywords : [],
      github_url: formData.github_url.trim() || '',
      demo_url: formData.demo_url.trim() || '',
      panel_url: formData.panel_url.trim() || '',
      thumbnail_url: formData.thumbnail_url || '',
      gen: typeof formData.gen === 'number' ? formData.gen : undefined,
      status: formData.status,
      members: formData.members,
      ...(showStatus ? { status: formData.status } : {})
    };
    
    console.log('Submitting project form data:', payload);
    onSubmit(payload);
  };

  return (
    <div className="space-y-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
      <div>
        <label className="block text-sm mb-1 font-medium text-white">제목</label>
        <input
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          className="border border-white/30 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-black placeholder-gray-600"
          placeholder="프로젝트 제목을 입력하세요"
        />
      </div>
      
      <div>
        <label className="block text-sm mb-1 font-medium text-white">설명</label>
        <textarea
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          className="border border-white/30 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-black placeholder-gray-600"
          rows={6}
          placeholder="프로젝트 설명을 입력하세요"
        />
      </div>

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
          className="border border-white/30 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-black placeholder-gray-600"
          placeholder="키워드를 입력하고 Enter로 추가 (최대 3개)"
          disabled={formData.keywords.length >= 3}
        />
      </div>

      {/* 멤버 관리 섹션 */}
      <div>
        <label className="block text-sm mb-1 font-medium text-white">팀원</label>
        <div className="space-y-2 mb-3">
          {formData.members.map((member, index) => (
            <div
              key={member.member_id}
              className="p-3 border border-white/30 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {member.member_gen !== null && member.member_gen !== undefined && (
                    <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium flex items-center gap-1 bg-[#8B0000] text-[#ffa282]`}>
                      {member.member_gen}기
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-white">{member.member_name || '알 수 없음'}</h3>
                        
                  <span className="text-gray-300 ml-2">/ {member.role === 'team_leader' ? '팀장' : member.role === 'team_member' ? '팀원' : member.role || '팀원'}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1 font-medium text-gray-300">기여 내용</label>
                <input
                  value={member.contribution || ''}
                  onChange={(e) => {
                    const updatedMembers = [...formData.members];
                    updatedMembers[index] = { ...member, contribution: e.target.value };
                    updateFormData('members', updatedMembers);
                  }}
                  className="w-full text-sm text-white bg-white/20 border border-white/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400"
                  placeholder="기여 내용을 입력하세요"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label className="block text-sm mb-1 font-medium text-white">GitHub URL</label>
          <input
            value={formData.github_url}
            onChange={(e) => updateFormData('github_url', e.target.value)}
            className="border border-white/30 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-black placeholder-gray-600"
            placeholder="GitHub 저장소 URL"
          />
        </div>
        <div>
          <label className="block text-sm mb-1 font-medium text-white">Demo URL</label>
          <input
            value={formData.demo_url}
            onChange={(e) => updateFormData('demo_url', e.target.value)}
            className="border border-white/30 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-black placeholder-gray-600"
            placeholder="데모 사이트 URL"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1 font-medium text-white">썸네일 이미지</label>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailFileChange}
              disabled={isUploading}
              className="text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-white/20 file:text-white hover:file:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {formData.thumbnail_url ? (
              <div className="relative inline-block">
                <Image
                  src={getThumbnailUrl(formData.thumbnail_url, 300)}
                  alt="프로젝트 썸네일"
                  className="rounded border object-cover"
                  width={300}
                  height={200}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== formData.thumbnail_url && formData.thumbnail_url) {
                      target.src = formData.thumbnail_url;
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => updateFormData('thumbnail_url', '')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                  title="이미지 제거"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="w-full h-48 bg-white/10 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faFolder} className="text-white/30 text-4xl" />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium text-white">패널 이미지</label>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handlePanelFileChange}
              disabled={isUploading}
              className="text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-white/20 file:text-white hover:file:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {formData.panel_url ? (
              <div className="relative inline-block">
                <Image
                  src={getThumbnailUrl(formData.panel_url, 300)}
                  alt="프로젝트 패널"
                  className="rounded border object-cover"
                  width={300}
                  height={200}
                  onError={(e) => {
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
            ) : (
              <div className="w-full h-48 bg-white/10 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faFolder} className="text-white/30 text-4xl" />
              </div>
            )}
          </div>
        </div>
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
      {/* <AddMemberModal
        show={false} // 모달 자체를 제거하고 폼 내부에서 직접 처리
        mode="add" // 모달 자체를 제거하고 폼 내부에서 직접 처리
        member={undefined} // 모달 자체를 제거하고 폼 내부에서 직접 처리
        onClose={() => {}} // 모달 자체를 제거하고 폼 내부에서 직접 처리
        onSubmit={() => {}} // 모달 자체를 제거하고 폼 내부에서 직접 처리
      /> */}
    </div>
  );
}
