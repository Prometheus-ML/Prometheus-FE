'use client';

import { useEffect, useState, useRef } from 'react';
import { useImage } from '@prometheus-fe/hooks';
import { 
  LandingHonorHall, 
  LandingHonorHallCreateRequest
} from '@prometheus-fe/types';
import GlassCard from '@/src/components/GlassCard';
import RedButton from '@/src/components/RedButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCrown } from '@fortawesome/free-solid-svg-icons';

interface HonorHallModalProps {
  isOpen: boolean;
  honorHall: LandingHonorHall | null;
  onClose: () => void;
  onSubmit: (data: LandingHonorHallCreateRequest) => void;
}

export default function HonorHallModal({ isOpen, honorHall, onClose, onSubmit }: HonorHallModalProps) {
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-8">
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
