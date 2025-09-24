'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useImage } from '@prometheus-fe/hooks';
import type { ImageCategory } from '@prometheus-fe/types';

interface GroupFormData {
  name: string;
  description?: string;  // Made optional to match backend schema
  category: 'STUDY' | 'CASUAL';
  max_members?: number;
  deadline?: string;
  thumbnail_url?: string;  // Changed from 'thumbnail' to 'thumbnail_url'
}

interface GroupFormProps {
  onSubmit: (data: GroupFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function GroupForm({ onSubmit, onCancel, isSubmitting = false }: GroupFormProps) {
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    description: '',
    category: 'STUDY',
    max_members: undefined,
    deadline: '',
    thumbnail_url: undefined
  });

  const {
    uploadImage,
    validateImageFile,
    getThumbnailUrl,
    isUploading: isImageUploading,
    uploadError: imageUploadError,
    clearError: clearImageError
  } = useImage({
    onUploadSuccess: (response) => {
      setFormData(prev => ({ ...prev, thumbnail_url: response.id }));
    },
    onUploadError: (error) => {
      console.error('이미지 업로드 실패:', error);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return;
    }

    // 데이터 정리: 빈 문자열을 undefined로 변환
    const cleanedData = {
      ...formData,
      description: formData.description?.trim() || undefined,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
      max_members: formData.max_members || undefined,
      thumbnail_url: formData.thumbnail_url || undefined
    };

    console.log('Original form data:', formData);
    console.log('Cleaned data for API:', cleanedData);
    console.log('Data types:', {
      name: typeof cleanedData.name,
      description: typeof cleanedData.description,
      category: typeof cleanedData.category,
      max_members: typeof cleanedData.max_members,
      deadline: typeof cleanedData.deadline,
      thumbnail_url: typeof cleanedData.thumbnail_url
    });
    
    onSubmit(cleanedData);
  };

  const handleChange = (field: keyof GroupFormData, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'max_members' && value === 0 ? undefined : value
    }));
  };

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
    clearImageError();
    
    try {
      // useImage 훅을 사용하여 이미지 업로드
      const imageUrl = await uploadImage(file, 'group' as ImageCategory);
      if (imageUrl) {
        setFormData(prev => ({ ...prev, thumbnail_url: imageUrl }));
      }
    } catch (error) {
      // 에러는 useImage 훅에서 처리되므로 여기서는 추가 처리만
      console.error('썸네일 업로드 처리 중 오류:', error);
    }
  };

  const removeThumbnail = () => {
    setFormData(prev => ({ ...prev, thumbnail_url: undefined }));
    clearImageError();
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-kimm-bold text-white mb-6">새 그룹 생성</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 썸네일 업로드 필드 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            그룹 썸네일
          </label>
          <div className="space-y-3">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                disabled={isImageUploading}
                className="w-full text-sm text-gray-300 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#c2402a] file:text-white hover:file:bg-[#a03522] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              />
            </div>
            
            {/* 업로드된 썸네일 목록 */}
            {formData.thumbnail_url && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">업로드된 썸네일:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="relative inline-block group">
                    <Image
                      src={getThumbnailUrl(formData.thumbnail_url, 200)}
                      alt="그룹 썸네일"
                      className="rounded-lg border border-white/20 object-cover transition-all group-hover:border-white/40"
                      width={200}
                      height={150}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== formData.thumbnail_url) {
                          target.src = formData.thumbnail_url || '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-all shadow-lg opacity-0 group-hover:opacity-100"
                      title="썸네일 제거"
                    >
                      <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* 업로드 에러 표시 */}
            {imageUploadError && (
              <div className="text-red-400 text-sm p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                {imageUploadError}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            그룹명 *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c2402a] focus:border-transparent transition-all"
            placeholder="그룹명을 입력하세요"
            maxLength={100}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            설명 *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c2402a] focus:border-transparent transition-all resize-none"
            placeholder="그룹에 대한 설명을 입력하세요"
            maxLength={500}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            카테고리 *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value as 'STUDY' | 'CASUAL')}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c2402a] focus:border-transparent transition-all"
          >
            <option value="STUDY" className="bg-gray-800 text-white">스터디 그룹</option>
            <option value="CASUAL" className="bg-gray-800 text-white">취미 그룹</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            최대 인원수
          </label>
          <input
            type="number"
            value={formData.max_members || ''}
            onChange={(e) => handleChange('max_members', e.target.value ? parseInt(e.target.value) : undefined)}
            min="1"
            max="100"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c2402a] focus:border-transparent transition-all"
            placeholder="최대 인원수를 입력하세요 (선택사항)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            마감일
          </label>
          <input
            type="date"
            value={formData.deadline || ''}
            onChange={(e) => handleChange('deadline', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c2402a] focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center space-x-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || isImageUploading || !formData.name.trim()}
            className="px-6 py-3 rounded-lg bg-[#c2402a] text-white font-medium hover:bg-[#a03522] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? '생성 중...' : isImageUploading ? '업로드 중...' : '그룹 생성'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-lg border border-white/20 text-gray-300 font-medium hover:bg-white/10 hover:text-white transition-all"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
