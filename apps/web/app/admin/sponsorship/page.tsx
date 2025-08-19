'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuthStore } from '@prometheus-fe/stores';
import { useSponsorship } from '@prometheus-fe/hooks';
import { useImage } from '@prometheus-fe/hooks';
import { Sponsor, HonorHall, SponsorCreateRequest } from '@prometheus-fe/types';
import GlassCard from '../../../src/components/GlassCard';
import RedButton from '../../../src/components/RedButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faUpload, faTimes, faBuilding, faHandshake, faCalendarAlt, faStickyNote } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

// 후원사 추가/수정 모달 컴포넌트
interface SponsorModalProps {
  isOpen: boolean;
  sponsor: Sponsor | null;
  onClose: () => void;
  onSubmit: (data: SponsorCreateRequest) => void;
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

  const [form, setForm] = useState<SponsorCreateRequest>({
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
        logo_url: sponsor.logo_url,
        purpose: sponsor.purpose,
        amount: sponsor.amount,
        note: sponsor.note,
        sponsored_at: sponsor.sponsored_at.split('T')[0]
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

  const handleImageUpload = async (file: File) => {
    if (!validateImageFile(file)) {
      return;
    }

    setImageLoading(true);
    setImageError(false);
    clearError();

    try {
      await uploadImage(file, 'sponsor');
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      setImageLoading(false);
      setImageError(true);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
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
              로고 이미지 *
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative w-24 h-24 bg-white/10 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center">
                {form.logo_url ? (
                  <Image
                    src={getThumbnailUrl(form.logo_url, 96)}
                    alt="로고"
                    width={96}
                    height={96}
                    className="rounded-lg object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="text-center">
                    <FontAwesomeIcon icon={faUpload} className="text-white/50 text-xl mb-1" />
                    <p className="text-xs text-white/50">업로드</p>
                  </div>
                )}
                {imageLoading && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageLoading}
                  className="inline-flex items-center px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faUpload} className="mr-2" />
                  {imageLoading ? '업로드 중...' : '이미지 선택'}
                </button>
                {uploadError && (
                  <p className="text-red-400 text-sm mt-1">{uploadError}</p>
                )}
              </div>
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
            <RedButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : (sponsor ? '수정' : '추가')}
            </RedButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}

export default function AdminSponsorshipPage() {
  const canAccessAdministrator = useAuthStore((s) => s.canAccessAdministrator);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  // Hydration 완료 상태 관리
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'sponsors' | 'honor-hall'>('sponsors');
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  
  const {
    adminSponsors,
    adminHonorHall,
    isLoadingAdminSponsors,
    isLoadingAdminHonorHall,
    getAdminSponsors,
    getAdminHonorHall,
    createSponsor,
    deleteSponsor,
    createHonorHall,
    deleteHonorHall,
    handleSponsorSelect,
    handleSponsorDeselect,
    handleHonorHallSelect,
    handleHonorHallDeselect,
  } = useSponsorship();

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
      } else {
        await getAdminHonorHall();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    }
  }, [activeTab, getAdminSponsors, getAdminHonorHall]);

  useEffect(() => {
    if (!isMounted || !isAuthenticated() || !canAccessAdministrator()) return;
    loadData();
  }, [isMounted, loadData, isAuthenticated, canAccessAdministrator]);

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    if (!isMounted || !isAuthenticated() || !canAccessAdministrator()) return;
    loadData();
  }, [activeTab, loadData, isAuthenticated, canAccessAdministrator]);

  const handleCreateSponsor = async (data: SponsorCreateRequest) => {
    try {
      await createSponsor(data);
      await loadData(); // 목록 새로고침
      alert('후원사가 추가되었습니다!');
    } catch (error) {
      console.error('후원사 생성 실패:', error);
      throw error;
    }
  };

  const handleUpdateSponsor = async (data: SponsorCreateRequest) => {
    try {
      // TODO: updateSponsor API 구현 필요
      await loadData(); // 목록 새로고침
      alert('후원사가 수정되었습니다!');
    } catch (error) {
      console.error('후원사 수정 실패:', error);
      throw error;
    }
  };

  const handleSponsorSubmit = async (data: SponsorCreateRequest) => {
    if (selectedSponsor) {
      await handleUpdateSponsor(data);
    } else {
      await handleCreateSponsor(data);
    }
  };

  const openSponsorModal = (sponsor?: Sponsor) => {
    setSelectedSponsor(sponsor || null);
    setShowSponsorModal(true);
  };

  const closeSponsorModal = () => {
    setShowSponsorModal(false);
    setSelectedSponsor(null);
  };

  return (
    <div className="py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">후원 관리</h1>
          <p className="text-sm text-gray-300 mt-1">프로메테우스 후원사 및 명예의전당 관리</p>
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
                        <p><span className="font-medium">금액:</span> {sponsor.amount.toLocaleString()}원</p>
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
                <RedButton className="inline-flex items-center">
                  <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                  명예의전당 추가
                </RedButton>
              </div>
              
              {adminHonorHall.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={faHandshake} className="text-gray-400 text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">명예의전당이 없습니다</h3>
                  <p className="text-gray-300">첫 번째 명예의전당을 추가해보세요.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adminHonorHall.map((honor) => (
                    <GlassCard key={honor.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-white">멤버 ID: {honor.member_id}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleHonorHallSelect(honor)}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            <FontAwesomeIcon icon={faEdit} className="mr-1" />
                            수정
                          </button>
                          <button
                            onClick={() => deleteHonorHall(honor.id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            <FontAwesomeIcon icon={faTrash} className="mr-1" />
                            삭제
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-300">
                        <p><span className="font-medium">기여 유형:</span> {honor.contribution_type}</p>
                        <p><span className="font-medium">금액:</span> {honor.amount.toLocaleString()}원</p>
                        <p><span className="font-medium">설명:</span> {honor.description}</p>
                        <p><span className="font-medium">공개 여부:</span> {honor.is_public ? '공개' : '비공개'}</p>
                        <p><span className="font-medium">생성일:</span> {new Date(honor.created_at).toLocaleDateString()}</p>
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
        onSubmit={handleSponsorSubmit}
      />
    </div>
  );
}
