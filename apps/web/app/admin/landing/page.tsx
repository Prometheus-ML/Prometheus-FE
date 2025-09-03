'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuthStore } from '@prometheus-fe/stores';
import { useLanding } from '@prometheus-fe/hooks';
import { useImage } from '@prometheus-fe/hooks';
import { 
  LandingSponsor, 
  LandingHonorHall, 
  LandingInterview,
  LandingLink,
  LandingSponsorCreateRequest,
  LandingHonorHallCreateRequest,
  LandingInterviewCreateRequest,
  LandingLinkCreateRequest
} from '@prometheus-fe/types';
import GlassCard from '../../../src/components/GlassCard';
import RedButton from '../../../src/components/RedButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faUpload, faTimes, faBuilding, faHandshake, faCalendarAlt, faStickyNote, faStar, faLink, faCrown } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

// 후원사 추가/수정 모달 컴포넌트
interface SponsorModalProps {
  isOpen: boolean;
  sponsor: LandingSponsor | null;
  onClose: () => void;
  onSubmit: (data: LandingSponsorCreateRequest) => void;
}

function SponsorModal({ isOpen, sponsor, onClose, onSubmit }: SponsorModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    isUploading: isUploadingImage,
    uploadError,
    uploadImage,
    validateImageFile,
    getThumbnailUrl,
    clearError
  } = useImage({
    onUploadStart: () => {
      setImageLoading(true);
      setImageError(false);
      clearError();
    },
    onUploadSuccess: (response) => {
      setForm(prev => ({ ...prev, logo_url: response.publicCdnUrl || response.webViewLink || `https://lh3.googleusercontent.com/d/${response.id}` }));
      setImageLoading(false);
    },
    onUploadError: (error) => {
      console.error('이미지 업로드 실패:', error);
      alert(error.message);
      setImageLoading(false);
      setImageError(true);
    }
  });

  const [form, setForm] = useState<LandingSponsorCreateRequest>({
    name: '',
    logo_url: '',
    purpose: '',
    amount: 0,
    note: '',
    sponsored_at: new Date().toISOString().split('T')[0]
  });

  // sponsor가 있으면 수정 모드로 폼 초기화
  useEffect(() => {
    if (sponsor) {
      setForm({
        name: sponsor.name,
        logo_url: sponsor.logo_url || '',
        purpose: sponsor.purpose || '',
        amount: sponsor.amount || 0,
        note: sponsor.note || '',
        sponsored_at: sponsor.sponsored_at?.split('T')[0] || new Date().toISOString().split('T')[0]
      });
    } else {
      setForm({
        name: '',
        logo_url: '',
        purpose: '',
        amount: 0,
        note: '',
        sponsored_at: new Date().toISOString().split('T')[0]
      });
    }
  }, [sponsor]);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const imageUrl = await uploadImage(file, 'sponsor');
      if (imageUrl) {
        setForm(prev => ({ ...prev, logo_url: imageUrl }));
      }
    } catch (error) {
      // 에러는 useImage 훅에서 처리되므로 여기서는 추가 처리만
      console.error('이미지 업로드 처리 중 오류:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      alert('기업명을 입력해주세요.');
      return;
    }
    
    if (!form.purpose.trim()) {
      alert('후원 목적을 입력해주세요.');
      return;
    }
    
    if (form.amount <= 0) {
      alert('후원 금액을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(form);
      onClose();
    } catch (error) {
      console.error('후원사 저장 실패:', error);
      alert('후원사 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <FontAwesomeIcon icon={faBuilding} className="mr-2" />
            {sponsor ? '후원사 수정' : '후원사 추가'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기업명 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              기업명 *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-white/20 text-black border border-white/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="기업명을 입력하세요"
              required
            />
          </div>

          {/* 로고 이미지 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              로고 이미지
            </label>
            <div className="space-y-3">
              {/* 이미지 미리보기 */}
              {form.logo_url && (
                <div className="relative inline-block group">
                  <Image
                    src={getThumbnailUrl(form.logo_url, 200)}
                    alt="로고"
                    width={200}
                    height={150}
                    className="rounded-lg border border-white/20 object-cover transition-all group-hover:border-white/40"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== form.logo_url) {
                        target.src = form.logo_url;
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, logo_url: '' }))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-all shadow-lg opacity-0 group-hover:opacity-100"
                    title="이미지 제거"
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              {/* 파일 업로드 */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  disabled={isUploadingImage}
                  className="w-full text-sm text-gray-300 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#c2402a] file:text-white hover:file:bg-[#a03522] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                />
              </div>
              
              {/* 업로드 에러 표시 */}
              {uploadError && (
                <div className="text-red-400 text-sm p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  {uploadError}
                </div>
              )}
            </div>
          </div>

          {/* 후원 목적 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              후원 목적 *
            </label>
            <input
              type="text"
              value={form.purpose}
              onChange={(e) => setForm(prev => ({ ...prev, purpose: e.target.value }))}
              className="w-full bg-white/20 text-black border border-white/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="후원 목적을 입력하세요"
              required
            />
          </div>

          {/* 후원 금액 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              후원 금액 (원) *
            </label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
              className="w-full bg-white/20 text-black border border-white/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="후원 금액을 입력하세요"
              min="0"
              required
            />
          </div>

          {/* 후원일 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              후원일 *
            </label>
            <input
              type="date"
              value={form.sponsored_at}
              onChange={(e) => setForm(prev => ({ ...prev, sponsored_at: e.target.value }))}
              className="w-full bg-white/20 text-black border border-white/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          {/* 비고 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              비고
            </label>
            <textarea
              value={form.note}
              onChange={(e) => setForm(prev => ({ ...prev, note: e.target.value }))}
              rows={3}
              className="w-full bg-white/20 text-black border border-white/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="추가 정보를 입력하세요"
            />
          </div>

          {/* 버튼 */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
            >
              취소
            </button>
            <RedButton type="submit" disabled={isSubmitting || isUploadingImage}>
              {isSubmitting ? '저장 중...' : isUploadingImage ? '업로드 중...' : (sponsor ? '수정' : '추가')}
            </RedButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}

// 명예의전당 추가/수정 모달 컴포넌트
interface HonorHallModalProps {
  isOpen: boolean;
  honorHall: LandingHonorHall | null;
  onClose: () => void;
  onSubmit: (data: LandingHonorHallCreateRequest) => void;
}

function HonorHallModal({ isOpen, honorHall, onClose, onSubmit }: HonorHallModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    isUploading: isUploadingImage,
    uploadError,
    uploadImage,
    validateImageFile,
    getThumbnailUrl,
    clearError
  } = useImage({
    onUploadStart: () => {
      setImageLoading(true);
      setImageError(false);
      clearError();
    },
    onUploadSuccess: (response) => {
      // 이미지 업로드는 성공했지만 폼에는 저장하지 않음 (타입에 image_url 필드가 없음)
      setImageLoading(false);
      alert('이미지가 업로드되었습니다. (명예의전당에는 이미지 필드가 지원되지 않습니다.)');
    },
    onUploadError: (error) => {
      console.error('이미지 업로드 실패:', error);
      alert(error.message);
      setImageLoading(false);
      setImageError(true);
    }
  });

  const [form, setForm] = useState<LandingHonorHallCreateRequest>({
    name: '',
    purpose: '',
    amount: 0,
    note: '',
    honored_at: new Date().toISOString().split('T')[0]
  });

  // honorHall이 있으면 수정 모드로 폼 초기화
  useEffect(() => {
    if (honorHall) {
      setForm({
        name: honorHall.name,
        purpose: honorHall.purpose,
        amount: 0,
        note: '',
        honored_at: new Date().toISOString().split('T')[0]
      });
    } else {
      setForm({
        name: '',
        purpose: '',
        amount: 0,
        note: '',
        honored_at: new Date().toISOString().split('T')[0]
      });
    }
  }, [honorHall]);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      // useImage 훅을 사용하여 이미지 업로드 (sponsor 카테고리 사용)
      const imageUrl = await uploadImage(file, 'sponsor');
      if (imageUrl) {
        // 이미지 업로드는 성공했지만 폼에는 저장하지 않음
        console.log('이미지 업로드 성공:', imageUrl);
      }
    } catch (error) {
      // 에러는 useImage 훅에서 처리되므로 여기서는 추가 처리만
      console.error('이미지 업로드 처리 중 오류:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    
    if (!form.purpose.trim()) {
      alert('기여 목적을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(form);
      onClose();
    } catch (error) {
      console.error('명예의전당 저장 실패:', error);
      alert('명예의전당 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <FontAwesomeIcon icon={faCrown} className="mr-2" />
            {honorHall ? '명예의전당 수정' : '명예의전당 추가'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              이름 *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-white/20 text-black border border-white/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="이름을 입력하세요"
              required
            />
          </div>

          {/* 기여 목적 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              기여 목적 *
            </label>
            <input
              type="text"
              value={form.purpose}
              onChange={(e) => setForm(prev => ({ ...prev, purpose: e.target.value }))}
              className="w-full bg-white/20 text-black border border-white/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="기여 목적을 입력하세요"
              required
            />
          </div>

          {/* 기여 금액 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              기여 금액 (원)
            </label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
              className="w-full bg-white/20 text-black border border-white/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="기여 금액을 입력하세요"
              min="0"
            />
          </div>

          {/* 기여일 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              기여일
            </label>
            <input
              type="date"
              value={form.honored_at}
              onChange={(e) => setForm(prev => ({ ...prev, honored_at: e.target.value }))}
              className="w-full bg-white/20 text-black border border-white/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* 비고 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              비고
            </label>
            <textarea
              value={form.note}
              onChange={(e) => setForm(prev => ({ ...prev, note: e.target.value }))}
              rows={3}
              className="w-full bg-white/20 text-black border border-white/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="추가 정보를 입력하세요"
            />
          </div>

          {/* 버튼 */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
            >
              취소
            </button>
            <RedButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : (honorHall ? '수정' : '추가')}
            </RedButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}

export default function AdminLandingPage() {
  const canAccessAdministrator = useAuthStore((s) => s.canAccessAdministrator);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  // Hydration 완료 상태 관리
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'sponsors' | 'honor-hall' | 'interviews' | 'links'>('sponsors');
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [showHonorHallModal, setShowHonorHallModal] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<LandingSponsor | null>(null);
  const [selectedHonorHall, setSelectedHonorHall] = useState<LandingHonorHall | null>(null);
  
  const {
    adminSponsors,
    adminHonorHall,
    adminInterviews,
    adminLinks,
    isLoadingAdminSponsors,
    isLoadingAdminHonorHall,
    isLoadingAdminInterviews,
    isLoadingAdminLinks,
    getAdminSponsors,
    getAdminHonorHall,
    getAdminInterviews,
    getAdminLinks,
    createSponsor,
    deleteSponsor,
    createHonorHall,
    deleteHonorHall,
    createAdminInterview,
    updateAdminInterview,
    deleteAdminInterview,
    createAdminLink,
    updateAdminLink,
    deleteAdminLink,
  } = useLanding();

  // Hydration 완료 감지
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 권한 체크 (hydration 완료 후에만)
  useEffect(() => {
    if (!isMounted) return;

    if (!isAuthenticated()) {
      alert('로그인이 필요합니다.');
      window.location.href = '/auth/login';
      return;
    }

    if (!canAccessAdministrator()) {
      alert('관리자가 아닙니다.');
      window.location.href = '/';
      return;
    }
  }, [isMounted, isAuthenticated, canAccessAdministrator]);

  // 데이터 로드
  const loadData = useCallback(async (): Promise<void> => {
    try {
      setError('');
      if (activeTab === 'sponsors') {
        await getAdminSponsors();
      } else if (activeTab === 'honor-hall') {
        await getAdminHonorHall();
      } else if (activeTab === 'interviews') {
        await getAdminInterviews();
      } else if (activeTab === 'links') {
        await getAdminLinks();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    }
  }, [activeTab, getAdminSponsors, getAdminHonorHall, getAdminInterviews, getAdminLinks]);

  useEffect(() => {
    if (!isMounted || !isAuthenticated() || !canAccessAdministrator()) return;
    loadData();
  }, [isMounted, loadData, isAuthenticated, canAccessAdministrator]);

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    if (!isMounted || !isAuthenticated() || !canAccessAdministrator()) return;
    loadData();
  }, [activeTab, loadData, isAuthenticated, canAccessAdministrator]);

  const handleCreateSponsor = async (data: LandingSponsorCreateRequest) => {
    try {
      await createSponsor(data);
      await loadData(); // 목록 새로고침
      alert('후원사가 추가되었습니다!');
    } catch (error) {
      console.error('후원사 생성 실패:', error);
      throw error;
    }
  };

  const handleCreateHonorHall = async (data: LandingHonorHallCreateRequest) => {
    try {
      await createHonorHall(data);
      await loadData(); // 목록 새로고침
      alert('명예의전당이 추가되었습니다!');
    } catch (error) {
      console.error('명예의전당 생성 실패:', error);
      throw error;
    }
  };

  const openSponsorModal = (sponsor?: LandingSponsor) => {
    setSelectedSponsor(sponsor || null);
    setShowSponsorModal(true);
  };

  const closeSponsorModal = () => {
    setShowSponsorModal(false);
    setSelectedSponsor(null);
  };

  const openHonorHallModal = (honorHall?: LandingHonorHall) => {
    setSelectedHonorHall(honorHall || null);
    setShowHonorHallModal(true);
  };

  const closeHonorHallModal = () => {
    setShowHonorHallModal(false);
    setSelectedHonorHall(null);
  };

  return (
    <div className="py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Landing 관리</h1>
          <p className="text-sm text-gray-300 mt-1">프로메테우스 Landing 페이지 관리</p>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <GlassCard className="p-4 mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('sponsors')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'sponsors'
                ? 'bg-red-500 text-white'
                : 'text-white hover:bg-white/10'
            }`}
          >
            후원사 관리
          </button>
          <button
            onClick={() => setActiveTab('honor-hall')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'honor-hall'
                ? 'bg-red-500 text-white'
                : 'text-white hover:bg-white/10'
            }`}
          >
            명예의전당 관리
          </button>
          <button
            onClick={() => setActiveTab('interviews')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'interviews'
                ? 'bg-red-500 text-white'
                : 'text-white hover:bg-white/10'
            }`}
          >
            인터뷰 관리
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'links'
                ? 'bg-red-500 text-white'
                : 'text-white hover:bg-white/10'
            }`}
          >
            링크 관리
          </button>
        </div>
      </GlassCard>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-400">
          {error}
        </div>
      )}

      {/* 후원사 관리 탭 */}
      {activeTab === 'sponsors' && (
        <GlassCard className="overflow-hidden">
          {isLoadingAdminSponsors ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">후원사 목록</h2>
                <RedButton
                  onClick={() => openSponsorModal()}
                  className="inline-flex items-center"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                  후원사 추가
                </RedButton>
              </div>
              
              {adminSponsors.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={faHandshake} className="text-gray-400 text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">후원사가 없습니다</h3>
                  <p className="text-gray-300">첫 번째 후원사를 추가해보세요.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adminSponsors.map((sponsor) => (
                    <GlassCard key={sponsor.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-white">{sponsor.name}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openSponsorModal(sponsor)}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            <FontAwesomeIcon icon={faEdit} className="mr-1" />
                            수정
                          </button>
                          <button
                            onClick={() => deleteSponsor(sponsor.id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            <FontAwesomeIcon icon={faTrash} className="mr-1" />
                            삭제
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-300">
                        <p><span className="font-medium">목적:</span> {sponsor.purpose}</p>
                        <p><span className="font-medium">금액:</span> {sponsor.amount?.toLocaleString() || '0'}원</p>
                        <p><span className="font-medium">후원일:</span> {new Date(sponsor.sponsored_at).toLocaleDateString()}</p>
                        {sponsor.note && <p><span className="font-medium">비고:</span> {sponsor.note}</p>}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
          )}
        </GlassCard>
      )}

      {/* 명예의전당 관리 탭 */}
      {activeTab === 'honor-hall' && (
        <GlassCard className="overflow-hidden">
          {isLoadingAdminHonorHall ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">명예의전당 목록</h2>
                <RedButton
                  onClick={() => openHonorHallModal()}
                  className="inline-flex items-center"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                  명예의전당 추가
                </RedButton>
              </div>
              
              {adminHonorHall.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={faCrown} className="text-gray-400 text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">명예의전당이 없습니다</h3>
                  <p className="text-gray-300">첫 번째 명예의전당을 추가해보세요.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adminHonorHall.map((honor, index) => (
                    <GlassCard key={index} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-white">{honor.name}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openHonorHallModal(honor)}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            <FontAwesomeIcon icon={faEdit} className="mr-1" />
                            수정
                          </button>
                          <button
                            onClick={() => deleteHonorHall(index)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            <FontAwesomeIcon icon={faTrash} className="mr-1" />
                            삭제
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-300">
                        <p><span className="font-medium">기여 목적:</span> {honor.purpose}</p>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
          )}
        </GlassCard>
      )}

      {/* 인터뷰 관리 탭 */}
      {activeTab === 'interviews' && (
        <GlassCard className="overflow-hidden">
          {isLoadingAdminInterviews ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">인터뷰 목록</h2>
                <RedButton className="inline-flex items-center">
                  <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                  인터뷰 추가
                </RedButton>
              </div>
              
              {adminInterviews.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={faStar} className="text-gray-400 text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">인터뷰가 없습니다</h3>
                  <p className="text-gray-300">첫 번째 인터뷰를 추가해보세요.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adminInterviews.map((interview) => (
                    <GlassCard key={interview.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white">{interview.member_id}</h3>
                          {interview.gen !== undefined && (
                            <p className="text-sm text-gray-400">{interview.gen}기</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => deleteAdminInterview(interview.id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            <FontAwesomeIcon icon={faTrash} className="mr-1" />
                            삭제
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-300">
                        <p><span className="font-medium">기수:</span> {interview.gen}기</p>
                        <p><span className="font-medium">내용:</span> {interview.content}</p>
                        <p><span className="font-medium">작성일:</span> {new Date(interview.created_at).toLocaleDateString()}</p>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
          )}
        </GlassCard>
      )}

      {/* 링크 관리 탭 */}
      {activeTab === 'links' && (
        <GlassCard className="overflow-hidden">
          {isLoadingAdminLinks ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">링크 목록</h2>
                <RedButton className="inline-flex items-center">
                  <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                  링크 추가
                </RedButton>
              </div>
              
              {adminLinks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={faLink} className="text-gray-400 text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">링크가 없습니다</h3>
                  <p className="text-gray-300">첫 번째 링크를 추가해보세요.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adminLinks.map((link) => (
                    <GlassCard key={link.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-white">{link.title}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => deleteAdminLink(link.id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            <FontAwesomeIcon icon={faTrash} className="mr-1" />
                            삭제
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-300">
                        <p><span className="font-medium">URL:</span> {link.url}</p>
                        <p><span className="font-medium">생성일:</span> {new Date(link.created_at).toLocaleDateString()}</p>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
          )}
        </GlassCard>
      )}

      {/* 후원사 모달 */}
      <SponsorModal
        isOpen={showSponsorModal}
        sponsor={selectedSponsor}
        onClose={closeSponsorModal}
        onSubmit={handleCreateSponsor}
      />

      {/* 명예의전당 모달 */}
      <HonorHallModal
        isOpen={showHonorHallModal}
        honorHall={selectedHonorHall}
        onClose={closeHonorHallModal}
        onSubmit={handleCreateHonorHall}
      />
    </div>
  );
}
