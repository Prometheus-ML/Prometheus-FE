'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import Image from 'next/image';
import { useImage } from '@prometheus-fe/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faTimes } from '@fortawesome/free-solid-svg-icons';

const CATEGORIES = [
  { value: 'free', label: '자유게시판' },
  { value: 'activity', label: '활동' },
  { value: 'career', label: '진로' },
  { value: 'promotion', label: '홍보' },
  { value: 'announcement', label: '공지사항' },
] as const;

interface PostFormProps {
  onSubmit: (post: { category: string; title: string; content: string; images?: string[] }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function PostForm({ onSubmit, onCancel, isSubmitting = false }: PostFormProps) {
  const [newPost, setNewPost] = useState({
    category: 'free',
    title: '',
    content: '',
    images: [] as string[],
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPost.title.trim() || !newPost.content.trim()) {
      return;
    }

    await onSubmit(newPost);
    setNewPost({ category: 'free', title: '', content: '', images: [] });
  };

  const handleImageFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
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
        setNewPost(prev => ({
          ...prev,
          images: [...prev.images, imageUrl]
        }));
      }
    } catch (error) {
      // 에러는 useImage 훅에서 처리되므로 여기서는 추가 처리만
      console.error('이미지 업로드 처리 중 오류:', error);
    }
  };

  const removeImage = (index: number) => {
    setNewPost(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="mb-6 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">새 게시글 작성</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            카테고리
          </label>
          <select
            value={newPost.category}
            onChange={(e) => setNewPost((prev) => ({ ...prev, category: e.target.value }))}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목
          </label>
          <input
            type="text"
            value={newPost.title}
            onChange={(e) => setNewPost((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="게시글 제목을 입력하세요"
            maxLength={200}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            내용
          </label>
          <textarea
            value={newPost.content}
            onChange={(e) => setNewPost((prev) => ({ ...prev, content: e.target.value }))}
            rows={6}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="게시글 내용을 입력하세요"
          />
        </div>
        
        {/* 이미지 업로드 필드 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이미지 업로드
          </label>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              disabled={isUploading}
              className="text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-500 file:text-white hover:file:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            
            {/* 업로드된 이미지 목록 */}
            {newPost.images.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">업로드된 이미지 ({newPost.images.length}개):</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {newPost.images.map((imageUrl, index) => (
                    <div key={index} className="relative inline-block">
                      <Image
                        src={getThumbnailUrl(imageUrl, 200)}
                        alt={`게시글 이미지 ${index + 1}`}
                        className="rounded border object-cover"
                        width={200}
                        height={150}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== imageUrl) {
                            target.src = imageUrl;
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                        title="이미지 제거"
                      >
                        <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 업로드 에러 표시 */}
            {uploadError && (
              <div className="text-red-500 text-sm p-2 bg-red-50 border border-red-200 rounded">
                {uploadError}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? '작성 중...' : isUploading ? '업로드 중...' : '게시글 작성'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
