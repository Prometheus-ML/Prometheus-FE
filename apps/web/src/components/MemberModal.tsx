"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@prometheus-fe/stores';
import { useImage } from '@prometheus-fe/hooks';
import type { MemberResponse, MemberCreateRequest, MemberUpdateRequest, ImageCategory } from '@prometheus-fe/types';

interface MemberModalProps {
  isOpen: boolean;
  member: MemberResponse | null;
  onClose: () => void;
  onSubmit: (data: MemberCreateRequest | MemberUpdateRequest) => void;
  onDelete?: (member: MemberResponse) => void;
}

interface MemberForm {
  name: string;
  email: string;
  gen: number;
  school: string;
  major: string;
  student_id: string;
  birthdate: string;
  phone: string;
  gender: string;
  grant: string;
  status: string;
  activity_start_date: string;
  profile_image_url: string;
  github: string;
  notion: string;
  figma: string;
  kakao_id: string;
  instagram_id: string;
  mbti: string;
  self_introduction: string;
  additional_career: string;
  coffee_chat_enabled: boolean;
  active_gens: number[];
  history: string[];
}

type GrantLevel = 'Member' | 'Manager' | 'Administrator' | 'Super' | 'Root';

interface GrantHierarchy {
  readonly [key: string]: number;
}

/**
 * MemberModal 컴포넌트
 * 멤버 정보를 추가하거나 수정할 수 있는 모달
 * 
 * @param isOpen - 모달 열림 상태
 * @param member - 수정할 멤버 정보 (null이면 새 멤버 추가)
 * @param onClose - 모달 닫기 콜백
 * @param onSubmit - 폼 제출 콜백
 * @param onDelete - 멤버 삭제 콜백 (선택사항)
 */
export default function MemberModal({ isOpen, member, onClose, onSubmit, onDelete }: MemberModalProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 태그 입력을 위한 변수들
  const [activeGenInput, setActiveGenInput] = useState('');
  const [historyInput, setHistoryInput] = useState('');
  
  // 전화번호 분리 입력을 위한 변수들
  const [phoneParts, setPhoneParts] = useState(['', '', '']);
  
  // 이미지 로딩 상태
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const authStore = useAuthStore();
  
  // useImage 훅 사용
  const {
    isUploading: isUploadingImage,
    uploadError,
    uploadImage,
    validateImageFile,
    getThumbnailUrl,
    getBestThumbnailUrl,
    getDefaultImageUrl,
    clearError
  } = useImage({
    onUploadSuccess: (response) => {
      // useImage 훅의 getOptimizedImageUrl이 이미 최적화된 URL을 반환하므로 
      // onUploadSuccess에서는 단순히 폼 업데이트만 하면 됩니다
      // uploadImage가 이미 최적화된 URL을 반환하므로 여기서는 불필요
    },
    onUploadError: (error) => {
      console.error('이미지 업로드 실패:', error);
      alert(error.message);
    }
  });

  // 폼 데이터
  const [form, setForm] = useState({
    name: '',
    email: '',
    gen: 0,
    school: '',
    major: '',
    student_id: '',
    birthdate: '',
    phone: '',
    gender: '',
    grant: 'Member',
    status: 'active',
    activity_start_date: '',
    profile_image_url: '',
    github: '',
    notion: '',
    figma: '',
    kakao_id: '',
    instagram_id: '',
    mbti: '',
    self_introduction: '',
    additional_career: '',
    coffee_chat_enabled: false,
    active_gens: [] as number[],
    history: [] as string[]
  });

  // 편집 모드인지 확인
  const isEdit = !!member;

  // 권한 레벨 매핑
  const grantHierarchy: GrantHierarchy = {
    'Member': 1,
    'Manager': 2,
    'Administrator': 3,
    'Super': 4,
    'Root': 5
  } as const;

  // 현재 사용자가 권한을 수정할 수 있는지 확인
  const canModifyEntireMember = useCallback((): boolean => {
    const currentUserGrant = authStore.user?.grant as GrantLevel || 'Member';
    const currentLevel = grantHierarchy[currentUserGrant] || 0;
    const memberLevel = grantHierarchy[form.grant as GrantLevel] || 0;
    
    return currentLevel > memberLevel;
  }, [authStore.user?.grant, form.grant, grantHierarchy]);

  // 멤버 삭제 권한 확인 (Super, Root만)
  const canDeleteMember = useCallback((): boolean => {
    const currentUserGrant = authStore.user?.grant as GrantLevel || 'Member';
    const currentLevel = grantHierarchy[currentUserGrant] || 0;
    const requiredLevel = grantHierarchy['Super'] || 4;
    
    return currentLevel >= requiredLevel;
  }, [authStore.user?.grant, grantHierarchy]);

  // 권한 할당 가능한지 확인
  const canAssignGrant = useCallback((grant: GrantLevel): boolean => {
    const currentUserGrant = authStore.user?.grant as GrantLevel || 'Member';
    const currentLevel = grantHierarchy[currentUserGrant] || 0;
    const targetLevel = grantHierarchy[grant] || 0;
    return currentLevel > targetLevel;
  }, [authStore.user?.grant, grantHierarchy]);

  // 수정 가능한 권한 레벨 반환
  const getModifiableGrantLevel = useCallback((): GrantLevel => {
    const currentUserGrant = authStore.user?.grant as GrantLevel || 'Member';
    const currentLevel = grantHierarchy[currentUserGrant] || 0;
    
    if (currentLevel >= grantHierarchy['Super']) return 'Super';
    if (currentLevel >= grantHierarchy['Administrator']) return 'Administrator';
    if (currentLevel >= grantHierarchy['Manager']) return 'Manager';
    return 'Member';
  }, [authStore.user?.grant, grantHierarchy]);

  // 활동 기수 추가 함수
  const addActiveGen = useCallback((): void => {
    const gen = parseInt(activeGenInput);
    if (gen && gen >= 1 && gen <= 15 && !form.active_gens.includes(gen)) {
      setForm(prev => ({
        ...prev,
        active_gens: [...prev.active_gens, gen].sort((a, b) => a - b)
      }));
      setActiveGenInput('');
    }
  }, [activeGenInput, form.active_gens]);

  // 활동 기수 제거 함수
  const removeActiveGen = useCallback((gen: number): void => {
    setForm(prev => ({
      ...prev,
      active_gens: prev.active_gens.filter(g => g !== gen)
    }));
  }, []);

  // 이력 추가 함수
  const addHistory = useCallback((): void => {
    const item = historyInput.trim();
    if (item && !form.history.includes(item)) {
      if (item.length > 300) {
        alert('이력은 300자를 초과할 수 없습니다.');
        return;
      }
      setForm(prev => ({
        ...prev,
        history: [...prev.history, item]
      }));
      setHistoryInput('');
    }
  }, [historyInput, form.history]);

  // 이력 제거 함수
  const removeHistory = useCallback((index: number): void => {
    setForm(prev => ({
      ...prev,
      history: prev.history.filter((_, i) => i !== index)
    }));
  }, []);

  // 전화번호 업데이트 함수
  const updatePhone = useCallback((): void => {
    const parts = phoneParts.filter(part => part.trim() !== '');
    setForm(prev => ({
      ...prev,
      phone: parts.join('-')
    }));
  }, [phoneParts]);

  // 전화번호를 분리된 부분으로 변환
  const parsePhone = useCallback((phone: string): void => {
    if (!phone) {
      setPhoneParts(['', '', '']);
      return;
    }
    
    const parts = phone.split('-');
    setPhoneParts([
      parts[0] || '',
      parts[1] || '',
      parts[2] || ''
    ]);
  }, []);

  // 폼 초기화
  const resetForm = useCallback((): void => {
    setForm({
      name: '',
      email: '',
      gen: 0,
      school: '',
      major: '',
      student_id: '',
      birthdate: '',
      phone: '',
      gender: '',
      grant: 'Member',
      status: 'active',
      activity_start_date: '',
      profile_image_url: '',
      github: '',
      notion: '',
      figma: '',
      kakao_id: '',
      instagram_id: '',
      mbti: '',
      self_introduction: '',
      additional_career: '',
      coffee_chat_enabled: false,
      active_gens: [],
      history: []
    });
    setActiveTab('basic');
    setActiveGenInput('');
    setHistoryInput('');
    setPhoneParts(['', '', '']);
    setImageError(false);
    setImageLoading(false);
  }, []);

  // 멤버 데이터로 폼 초기화
  const initializeForm = useCallback((): void => {
    if (member) {
      setForm({
        name: member.name || '',
        email: member.email || '',
        gen: member.gen || 0,
        school: member.school || '',
        major: member.major || '',
        student_id: member.student_id || '',
        birthdate: member.birthdate || '',
        phone: member.phone || '',
        gender: member.gender || '',
        grant: member.grant || 'Member',
        status: member.status || 'active',
        activity_start_date: member.activity_start_date || '',
        profile_image_url: member.profile_image_url || '',
        github: member.github || '',
        notion: member.notion || '',
        figma: member.figma || '',
        kakao_id: member.kakao_id || '',
        instagram_id: member.instagram_id || '',
        mbti: member.mbti || '',
        self_introduction: member.self_introduction || '',
        additional_career: member.additional_career || '',
        coffee_chat_enabled: member.coffee_chat_enabled || false,
        active_gens: Array.isArray(member.active_gens) ? member.active_gens : [],
        history: Array.isArray(member.history) ? member.history : []
      });
      
      parsePhone(member.phone || '');
    }
    
    setActiveGenInput('');
    setHistoryInput('');
    setImageError(false);
    setImageLoading(false);
  }, [member, parsePhone]);

  // 모달 닫기
  const closeModal = useCallback((): void => {
    onClose();
    resetForm();
  }, [onClose, resetForm]);

  // 폼 제출 처리
  const handleSubmit = useCallback(async (): Promise<void> => {
    if (isEdit) {
      if (!confirm(`정말로 ${form.name}님의 정보를 수정하시겠습니까?`)) {
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      
      const submitData = { ...form };
      
      // 빈 문자열을 null로 변환
      Object.keys(submitData).forEach(key => {
        if ((submitData as any)[key] === '') {
          (submitData as any)[key] = null;
        }
      });
      
      // 수정 모드에서 권한이 없으면 grant 제외
      if (isEdit && !canModifyEntireMember()) {
        delete (submitData as any).grant;
      }
      
      onSubmit(submitData);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isEdit, form, canModifyEntireMember, onSubmit]);

  // 삭제 처리
  const handleDelete = useCallback(async (): Promise<void> => {
    if (!confirm(`정말로 ${form.name}님을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      if (onDelete && member) {
        onDelete(member);
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [form.name, member, onDelete]);

  // 이미지 업로드
  const triggerProfileImageSelect = useCallback((): void => {
    if (isEdit && !canModifyEntireMember()) return;
    clearError(); // 이전 에러 클리어
    fileInputRef.current?.click();
  }, [isEdit, canModifyEntireMember, clearError]);

  const onProfileImageFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = event.target?.files;
    const file = files && files[0] ? files[0] : null;
    if (!file) return;

    // 파일 검증
    const validationError = validateImageFile(file);
    if (validationError) {
      alert(validationError);
      if (event.target) event.target.value = '';
      return;
    }

    // 이미지 업로드 (useImage 훅이 API 호출하고 최적화된 URL 반환)
    const uploadedUrl = await uploadImage(file, 'member');
    
    // 업로드 성공 시 폼 업데이트
    if (uploadedUrl) {
      setForm(prev => ({ ...prev, profile_image_url: uploadedUrl }));
      setImageError(false);
      setImageLoading(false);
    }
    
    // 파일 입력 초기화
    if (event.target) {
      event.target.value = '';
    }
  }, [validateImageFile, uploadImage]);

  // 이미지 에러 처리
  const onProfileImageError = useCallback((): void => {
    console.warn('Profile image failed to load:', form.profile_image_url);
    setImageError(true);
    setImageLoading(false);
  }, [form.profile_image_url]);

  // 이미지 로딩 시작
  const onProfileImageLoadStart = useCallback((): void => {
    setImageLoading(true);
    setImageError(false);
  }, []);

  // 이미지 로딩 완료
  const onProfileImageLoad = useCallback((): void => {
    setImageLoading(false);
    setImageError(false);
  }, []);

  // 멤버 데이터가 변경될 때 폼 초기화
  useEffect(() => {
    if (member) {
      initializeForm();
    } else {
      resetForm();
    }
  }, [member]);

  // 전화번호 파트 변경 시 업데이트
  useEffect(() => {
    updatePhone();
  }, [phoneParts]);

  // 프로필 이미지 URL 변경 시 에러 상태 리셋
  useEffect(() => {
    if (form.profile_image_url) {
      setImageError(false);
      setImageLoading(false);
    }
  }, [form.profile_image_url]);

  // Early return for closed modal
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Prometheus background */}
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0 relative z-10">
        {/* 배경 오버레이 */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={!isUploadingImage ? closeModal : undefined} />

        {/* 모달 컨텐츠 */}
        <div className="inline-block align-bottom bg-black/80 backdrop-blur-lg rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle md:max-w-4xl max-w-lg sm:w-full relative border border-white/20 max-h-[90vh] flex flex-col">
          {/* 헤더 */}
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 flex-shrink-0">
            <div className="text-center w-full">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 mb-4">
                <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-kimm-bold text-white mb-2">
                  {isEdit ? '멤버 수정' : '멤버 추가'}
                </h3>
                
                {/* 권한 제한 메시지 */}
                {isEdit && !canModifyEntireMember() && (
                <div className="mt-2 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-300">
                      {getModifiableGrantLevel()} 권한 이하의 정보만 수정하실 수 있습니다.
                    </p>
                  </div>
                )}
                
                {/* 탭 네비게이션 */}
              <div className="mt-4 border-b border-white/20">
                <nav className="-mb-px flex space-x-8 justify-center">
                    {['basic', 'club', 'optional'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab
                          ? 'border-red-500 text-red-400'
                          : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        {tab === 'basic' ? '기본 정보' : tab === 'club' ? '동아리 정보' : '선택 정보'}
                      </button>
                    ))}
                  </nav>
              </div>
              
              {/* 버튼 영역 */}
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isUploadingImage || (isEdit && !canModifyEntireMember())}
                  className={`inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 ${
                    isEdit 
                      ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                >
                  {isSubmitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  )}
                  {isEdit ? '수정 완료' : '멤버 추가'}
                </button>
                {isEdit && canDeleteMember() && onDelete && (
                  <button
                    onClick={handleDelete}
                    disabled={isSubmitting || isUploadingImage}
                    className="inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    삭제
                  </button>
                )}
                <button
                  onClick={!isUploadingImage ? closeModal : undefined}
                  disabled={isUploadingImage}
                  className="inline-flex justify-center rounded-lg border border-white/30 shadow-sm px-4 py-2 bg-white/10 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  닫기
                </button>
              </div>
                </div>
          </div>

          {/* 스크롤 가능한 컨텐츠 영역 */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 sm:px-6">
            {/* 기본 정보 탭 */}
            {activeTab === 'basic' && (
              <div className="mt-6">
                <div className="grid grid-cols-1 gap-4">
                  {/* 이름 */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                      이름 <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      disabled={isEdit && !canModifyEntireMember()}
                      type="text"
                      placeholder="홍길동"
                      required
                      className={`mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm ${
                        isEdit && !canModifyEntireMember() ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''
                      }`}
                    />
                  </div>
                      
                      {/* 이메일 */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-white">
                          이메일 <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="email"
                          value={form.email}
                          onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                          disabled={isEdit && !canModifyEntireMember()}
                          type="email"
                          placeholder="hong@example.com"
                          required
                          className={`mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm ${
                            isEdit && !canModifyEntireMember() ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''
                          }`}
                        />
                      </div>
                      
                      {/* 학번 */}
                      <div>
                        <label htmlFor="student_id" className="block text-sm font-medium text-white">
                          학번 <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="student_id"
                          value={form.student_id}
                          onChange={(e) => setForm(prev => ({ ...prev, student_id: e.target.value }))}
                          disabled={isEdit && !canModifyEntireMember()}
                          type="text"
                          placeholder="21"
                          className={`mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm ${
                            isEdit && !canModifyEntireMember() ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''
                          }`}
                        />
                      </div>
                      
                      {/* 전화번호 */}
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-white">
                          전화번호 <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-1 flex space-x-1">
                          <input
                            value={phoneParts[0]}
                            onChange={(e) => {
                              const newParts = [...phoneParts];
                              newParts[0] = e.target.value;
                              setPhoneParts(newParts);
                            }}
                            disabled={isEdit && !canModifyEntireMember()}
                            type="text"
                            maxLength={3}
                            placeholder="010"
                            className={`w-16 bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm text-center ${
                              isEdit && !canModifyEntireMember() ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''
                            }`}
                          />
                          <span className="flex items-center text-gray-300 text-sm">-</span>
                          <input
                            value={phoneParts[1]}
                            onChange={(e) => {
                              const newParts = [...phoneParts];
                              newParts[1] = e.target.value;
                              setPhoneParts(newParts);
                            }}
                            disabled={isEdit && !canModifyEntireMember()}
                            type="text"
                            maxLength={4}
                            placeholder="1234"
                            className={`w-20 bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm text-center ${
                              isEdit && !canModifyEntireMember() ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''
                            }`}
                          />
                          <span className="flex items-center text-gray-300 text-sm">-</span>
                          <input
                            value={phoneParts[2]}
                            onChange={(e) => {
                              const newParts = [...phoneParts];
                              newParts[2] = e.target.value;
                              setPhoneParts(newParts);
                            }}
                            disabled={isEdit && !canModifyEntireMember()}
                            type="text"
                            maxLength={4}
                            placeholder="5678"
                            className={`w-20 bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm text-center ${
                              isEdit && !canModifyEntireMember() ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''
                            }`}
                          />
                        </div>
                      </div>

                      {/* 학교 */}
                      <div>
                        <label htmlFor="school" className="block text-sm font-medium text-white">
                          학교 <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="school"
                          value={form.school}
                          onChange={(e) => setForm(prev => ({ ...prev, school: e.target.value }))}
                          disabled={isEdit && !canModifyEntireMember()}
                          type="text"
                          placeholder="프메대학교"
                          className={`mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm ${
                            isEdit && !canModifyEntireMember() ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''
                          }`}
                        />
                      </div>
                      
                      {/* 전공 */}
                      <div>
                        <label htmlFor="major" className="block text-sm font-medium text-white">
                          전공 <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="major"
                          value={form.major}
                          onChange={(e) => setForm(prev => ({ ...prev, major: e.target.value }))}
                          disabled={isEdit && !canModifyEntireMember()}
                          type="text"
                          placeholder="인공지능학과"
                          className={`mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm ${
                            isEdit && !canModifyEntireMember() ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''
                          }`}
                        />
                      </div>
                      
                      {/* 생년월일 */}
                      <div>
                        <label htmlFor="birthdate" className="block text-sm font-medium text-white">
                          생년월일 <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="birthdate"
                          value={form.birthdate}
                          onChange={(e) => setForm(prev => ({ ...prev, birthdate: e.target.value }))}
                          disabled={isEdit && !canModifyEntireMember()}
                          type="date"
                          className={`mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm ${
                            isEdit && !canModifyEntireMember() ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''
                          }`}
                        />
                      </div>

                      {/* 성별 */}
                      <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-white">성별</label>
                        <select
                          id="gender"
                          value={form.gender}
                          onChange={(e) => setForm(prev => ({ ...prev, gender: e.target.value }))}
                          disabled={isEdit && !canModifyEntireMember()}
                          className={`mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm ${
                            isEdit && !canModifyEntireMember() ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''
                          }`}
                        >
                          <option value="">선택</option>
                          <option value="남성">남성</option>
                          <option value="여성">여성</option>
                        </select>
                      </div>
                      
                      {/* 프로필 이미지 */}
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-white">프로필 이미지</label>
                        <div className="mt-2 flex items-center space-x-4">
                          {/* 현재 이미지 표시 */}
                          <div className="flex-shrink-0">
                            {form.profile_image_url && !imageError ? (
                              <div className="relative w-16 h-16">
                                {imageLoading && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-white/10 rounded-full">
                                    <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                    </svg>
                                  </div>
                                )}
                                <Image 
                                  src={getThumbnailUrl(form.profile_image_url, 128)} 
                                  alt="프로필 이미지" 
                                  fill
                                  className="rounded-full object-cover border-2 border-white/20"
                                  onLoadingComplete={onProfileImageLoad}
                                  onError={onProfileImageError}
                                  unoptimized // useImage로 이미 최적화된 이미지이므로
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {/* 이미지 업로드 버튼 */}
                          <div className="flex-1">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={onProfileImageFileChange}
                            />
                            <button
                              type="button"
                              onClick={triggerProfileImageSelect}
                              disabled={isUploadingImage || (isEdit && !canModifyEntireMember())}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-white bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {!isUploadingImage ? (
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                              ) : (
                                <svg className="animate-spin h-4 w-4 mr-2 text-gray-300" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                              )}
                              {isUploadingImage ? '업로드 중...' : (form.profile_image_url ? '이미지 변경' : '이미지 업로드')}
                            </button>
                            {isEdit && !canModifyEntireMember() && (
                              <p className="mt-1 text-sm text-gray-300">
                                권한이 없어 이미지를 변경할 수 없습니다.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 동아리 정보 탭 */}
                {activeTab === 'club' && (
                  <div className="mt-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {/* 기수 */}
                      <div>
                        <label htmlFor="gen" className="block text-sm font-medium text-white">
                          기수 <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="gen"
                          value={form.gen}
                          onChange={(e) => setForm(prev => ({ ...prev, gen: parseInt(e.target.value) || 0 }))}
                          disabled={isEdit && !canModifyEntireMember()}
                          type="number"
                          min="0"
                          placeholder="0"
                          required
                          className={`mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm ${
                            isEdit && !canModifyEntireMember() ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''
                          }`}
                        />
                      </div>
                      
                      {/* 상태 */}
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-white">
                          상태 <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="status"
                          value={form.status}
                          onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                          disabled={isEdit && !canModifyEntireMember()}
                          className={`mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm ${
                            isEdit && !canModifyEntireMember() ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''
                          }`}
                        >
                          <option value="active">활동기수</option>
                          <option value="alumni">알럼나이</option>
                        </select>
                      </div>
                      
                      {/* 권한 */}
                      <div>
                        <label htmlFor="grant" className="block text-sm font-medium text-white">
                          권한 <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="grant"
                          value={form.grant}
                          onChange={(e) => setForm(prev => ({ ...prev, grant: e.target.value }))}
                          disabled={isEdit && !canModifyEntireMember()}
                          className={`mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm ${
                            isEdit && !canModifyEntireMember() ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''
                          }`}
                        >
                          <option value="Root" disabled={!canAssignGrant('Root')}>Root</option>
                          <option value="Super" disabled={!canAssignGrant('Super')}>Super</option>
                          <option value="Administrator" disabled={!canAssignGrant('Administrator')}>Administrator</option>
                          <option value="Manager" disabled={!canAssignGrant('Manager')}>Manager</option>
                          <option value="Member" disabled={!canAssignGrant('Member')}>Member</option>
                        </select>
                        {isEdit && !canModifyEntireMember() && (
                          <p className="mt-1 text-sm text-gray-300">
                            자신보다 높은 권한은 할당할 수 없습니다.
                          </p>
                        )}
                      </div>
                      
                      {/* 활동 시작일 */}
                      <div>
                        <label htmlFor="activity_start_date" className="block text-sm font-medium text-white">활동 시작일</label>
                        <input
                          id="activity_start_date"
                          value={form.activity_start_date}
                          onChange={(e) => setForm(prev => ({ ...prev, activity_start_date: e.target.value }))}
                          disabled={isEdit && !canModifyEntireMember()}
                          type="date"
                          className={`mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm ${
                            isEdit && !canModifyEntireMember() ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''
                          }`}
                        />
                      </div>
                      
                      {/* 활동 기수 */}
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-white">활동 기수</label>
                        <div className="mt-2">
                          {/* 입력 필드 */}
                          <div className="flex items-center space-x-2 mb-2">
                            <input
                              value={activeGenInput}
                              onChange={(e) => setActiveGenInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addActiveGen())}
                              disabled={isEdit && !canModifyEntireMember()}
                              type="number"
                              min="0"
                              placeholder="기수를 입력하고 엔터를 누르세요"
                              className={`flex-1 bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm ${
                                isEdit && !canModifyEntireMember() ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''
                              }`}
                            />
                            <button
                              type="button"
                              onClick={addActiveGen}
                              disabled={isEdit && !canModifyEntireMember()}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              추가
                            </button>
                          </div>
                          {/* 태그 목록 */}
                          <div className="flex flex-wrap gap-2">
                            {form.active_gens.map((gen) => (
                              <div
                                key={gen}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-300"
                              >
                                <span>{gen}기</span>
                                <button
                                  type="button"
                                  onClick={() => removeActiveGen(gen)}
                                  disabled={isEdit && !canModifyEntireMember()}
                                  className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-red-400 hover:bg-red-500/30 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 이력 */}
                      <div className="sm:col-span-2">
                        <div className="flex justify-between items-center">
                          <label htmlFor="history" className="block text-sm font-medium text-white">이력</label>
                          <span className="text-sm text-gray-300">{historyInput.length}/300</span>
                        </div>
                        <div className="mt-2">
                          {/* 입력 필드 */}
                          <div className="flex items-center space-x-2 mb-2">
                            <input
                              value={historyInput}
                              onChange={(e) => setHistoryInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHistory())}
                              disabled={isEdit && !canModifyEntireMember()}
                              type="text"
                              maxLength={300}
                              placeholder="이력을 입력하고 엔터를 누르세요 (예: AI 챗봇 개발, 웹 애플리케이션 프로젝트, 머신러닝 스터디)"
                              className={`flex-1 bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm ${
                                isEdit && !canModifyEntireMember() ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''
                              }`}
                            />
                            <button
                              type="button"
                              onClick={addHistory}
                              disabled={isEdit && !canModifyEntireMember()}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              추가
                            </button>
                          </div>
                          {/* 태그 목록 */}
                          <div className="flex flex-wrap gap-2">
                            {form.history.map((item, index) => (
                              <div
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300"
                              >
                                <span>{item}</span>
                                <button
                                  type="button"
                                  onClick={() => removeHistory(index)}
                                  disabled={isEdit && !canModifyEntireMember()}
                                  className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-500/30 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 선택 정보 탭 */}
                {activeTab === 'optional' && (
                  <div className="mt-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {/* GitHub */}
                      <div>
                        <label htmlFor="github" className="block text-sm font-medium text-white">GitHub</label>
                        <input
                          id="github"
                          value={form.github}
                          onChange={(e) => setForm(prev => ({ ...prev, github: e.target.value }))}
                          disabled={isEdit && !canModifyEntireMember()}
                          type="url"
                          className={`mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm ${
                            isEdit && !canModifyEntireMember() ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''
                          }`}
                        />
                      </div>
                      
                      {/* Notion */}
                      <div>
                        <label htmlFor="notion" className="block text-sm font-medium text-white">Notion</label>
                        <input
                          id="notion"
                          value={form.notion}
                          onChange={(e) => setForm(prev => ({ ...prev, notion: e.target.value }))}
                          disabled={isEdit && !canModifyEntireMember()}
                          type="url"
                          className={`mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm ${
                            isEdit && !canModifyEntireMember() ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''
                          }`}
                        />
                      </div>
                      
                      {/* Figma */}
                      <div>
                        <label htmlFor="figma" className="block text-sm font-medium text-white">Figma</label>
                        <input
                          id="figma"
                          value={form.figma}
                          onChange={(e) => setForm(prev => ({ ...prev, figma: e.target.value }))}
                          disabled={isEdit && !canModifyEntireMember()}
                          type="url"
                          className={`mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm ${
                            isEdit && !canModifyEntireMember() ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''
                          }`}
                        />
                      </div>
                      
                      {/* 카카오 ID */}
                      <div>
                        <label htmlFor="kakao_id" className="block text-sm font-medium text-white">카카오 ID</label>
                        <input
                          id="kakao_id"
                          value={form.kakao_id}
                          onChange={(e) => setForm(prev => ({ ...prev, kakao_id: e.target.value }))}
                          disabled={isEdit && !canModifyEntireMember()}
                          type="text"
                          className={`mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm ${
                            isEdit && !canModifyEntireMember() ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''
                          }`}
                        />
                      </div>
                      
                      {/* 인스타그램 ID */}
                      <div>
                        <label htmlFor="instagram_id" className="block text-sm font-medium text-white">인스타그램 ID</label>
                        <input
                          id="instagram_id"
                          value={form.instagram_id}
                          onChange={(e) => setForm(prev => ({ ...prev, instagram_id: e.target.value }))}
                          disabled={isEdit && !canModifyEntireMember()}
                          type="text"
                          className={`mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm ${
                            isEdit && !canModifyEntireMember() ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''
                          }`}
                        />
                      </div>

                      {/* MBTI와 커피챗 활성화 */}
                      <div className="flex space-x-4">
                        <div className="flex-1">
                          <label htmlFor="mbti" className="block text-sm font-medium text-white">MBTI</label>
                          <input
                            id="mbti"
                            value={form.mbti}
                            onChange={(e) => setForm(prev => ({ ...prev, mbti: e.target.value }))}
                            disabled={isEdit && !canModifyEntireMember()}
                            type="text"
                            maxLength={4}
                            placeholder="ENFP"
                            className={`mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm ${
                              isEdit && !canModifyEntireMember() ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''
                            }`}
                          />
                        </div>
                        
                        <div className="flex-1">
                          <label htmlFor="coffee_chat_enabled" className="block text-sm font-medium text-white">커피챗 활성화</label>
                          <select
                            id="coffee_chat_enabled"
                            value={form.coffee_chat_enabled ? 'true' : 'false'}
                            onChange={(e) => setForm(prev => ({ ...prev, coffee_chat_enabled: e.target.value === 'true' }))}
                            disabled={isEdit && !canModifyEntireMember()}
                            className={`mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm ${
                              isEdit && !canModifyEntireMember() ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''
                            }`}
                          >
                            <option value="true">활성화</option>
                            <option value="false">비활성화</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* 자기소개 */}
                      <div className="sm:col-span-2">
                        <div className="flex justify-between items-center">
                          <label htmlFor="self_introduction" className="block text-sm font-medium text-white">자기소개</label>
                          <span className="text-sm text-gray-300">{form.self_introduction.length}/300</span>
                        </div>
                        <textarea
                          id="self_introduction"
                          value={form.self_introduction}
                          onChange={(e) => setForm(prev => ({ ...prev, self_introduction: e.target.value }))}
                          disabled={isEdit && !canModifyEntireMember()}
                          rows={5}
                          maxLength={300}
                          placeholder="자신에 대해 간단히 소개해주세요. (예: 안녕하세요! 저는 AI에 관심이 많은 학생입니다. 다양한 프로젝트를 통해 실력을 키우고 싶습니다.)"
                          className={`mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm ${
                            isEdit && !canModifyEntireMember() ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''
                          }`}
                        />
                      </div>
                      
                      {/* 추가 경력 */}
                      <div className="sm:col-span-2">
                        <div className="flex justify-between items-center">
                          <label htmlFor="additional_career" className="block text-sm font-medium text-white">추가 경력</label>
                          <span className="text-sm text-gray-300">{form.additional_career.length}/300</span>
                        </div>
                        <textarea
                          id="additional_career"
                          value={form.additional_career}
                          onChange={(e) => setForm(prev => ({ ...prev, additional_career: e.target.value }))}
                          disabled={isEdit && !canModifyEntireMember()}
                          rows={5}
                          maxLength={300}
                          placeholder="추가 경력이나 활동을 입력해주세요. (예: AI 스터디 그룹 리더, 웹 개발 프로젝트 참여, 해커톤 수상 경험 등)"
                          className={`mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm ${
                            isEdit && !canModifyEntireMember() ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>



            {/* 업로드 중 오버레이 */}
            {isUploadingImage && (
              <div className="absolute inset-0 z-20 bg-white bg-opacity-60 backdrop-blur-sm flex items-center justify-center">
                <div className="flex items-center space-x-3 text-white">
                  <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <span className="text-sm font-medium">이미지 업로드 중...</span>
                </div>
              </div>
            )}
          </div>
        </div>


  );
}
