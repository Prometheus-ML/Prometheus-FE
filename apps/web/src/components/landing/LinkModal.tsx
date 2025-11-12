'use client';

import { useEffect, useState, useRef } from 'react';
import { useImage } from '@prometheus-fe/hooks';
import { LandingLinkCreateRequest } from '@prometheus-fe/types';
import GlassCard from '@/src/components/GlassCard';
import RedButton from '@/src/components/RedButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faLink, faImage } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import Portal from '@/src/components/Portal';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LandingLinkCreateRequest) => void;
}

export default function LinkModal({ isOpen, onClose, onSubmit }: LinkModalProps) {
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
      setForm(prev => ({ ...prev, image_url: response.publicCdnUrl || response.webViewLink || `https://lh3.googleusercontent.com/d/${response.id}` }));
      setImageLoading(false);
    },
    onUploadError: (error) => {
      console.error('이미지 업로드 실패:', error);
      alert(error.message);
      setImageLoading(false);
      setImageError(true);
    }
  });

  const [form, setForm] = useState<LandingLinkCreateRequest>({
    title: '',
    url: '',
    image_url: '',
    post_date: new Date().toISOString().split('T')[0]
  });

  // 모달이 열릴 때 폼 초기화
  useEffect(() => {
    if (isOpen) {
      setForm({
        title: '',
        url: '',
        image_url: '',
        post_date: new Date().toISOString().split('T')[0]
      });
    }
  }, [isOpen]);

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
      const imageUrl = await uploadImage(file, 'post');
      if (imageUrl) {
        setForm(prev => ({ ...prev, image_url: imageUrl }));
      }
    } catch (error) {
      // 에러는 useImage 훅에서 처리되므로 여기서는 추가 처리만
      console.error('이미지 업로드 처리 중 오류:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!form.url.trim()) {
      alert('URL을 입력해주세요.');
      return;
    }

    // URL 유효성 검사
    try {
      new URL(form.url);
    } catch {
      alert('유효한 URL을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(form);
      onClose();
    } catch (error) {
      console.error('링크 저장 실패:', error);
      alert('링크 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-48">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <FontAwesomeIcon icon={faLink} className="mr-2" />
            링크 추가
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              제목 *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-white/20 text-black border border-white/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="링크 제목을 입력하세요"
              required
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              URL *
            </label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm(prev => ({ ...prev, url: e.target.value }))}
              className="w-full bg-white/20 text-black border border-white/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="https://example.com"
              required
            />
          </div>

          {/* 게시일 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              게시일 *
            </label>
            <input
              type="date"
              value={form.post_date}
              onChange={(e) => setForm(prev => ({ ...prev, post_date: e.target.value }))}
              className="w-full bg-white/20 text-black border border-white/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          {/* 이미지 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              이미지
            </label>
            <div className="space-y-3">
              {/* 이미지 미리보기 */}
              {form.image_url && (
                <div className="relative inline-block group">
                  <Image
                    src={getThumbnailUrl(form.image_url, 200)}
                    alt="링크 이미지"
                    width={200}
                    height={150}
                    className="rounded-lg border border-white/20 object-cover transition-all group-hover:border-white/40"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== form.image_url && form.image_url) {
                        target.src = form.image_url;
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, image_url: '' }))}
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
              {isSubmitting ? '저장 중...' : isUploadingImage ? '업로드 중...' : '추가'}
            </RedButton>
          </div>
        </form>
      </GlassCard>
    </div>
    </Portal>
  );
}
