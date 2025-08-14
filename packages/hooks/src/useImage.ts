import { useState, useCallback } from 'react';
import { useApi } from '@prometheus-fe/context';
import type { ImageUploadResponse, ImageCategory } from '@prometheus-fe/types';

interface UseImageOptions {
  onUploadStart?: () => void;
  onUploadSuccess?: (response: ImageUploadResponse) => void;
  onUploadError?: (error: Error) => void;
  onUploadComplete?: () => void;
}

export function useImage(options: UseImageOptions = {}) {
  const { storage } = useApi();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // 이미지 URL 최적화 함수
  const getOptimizedImageUrl = useCallback((response: ImageUploadResponse, size?: number) => {
    // 우선순위: publicCdnUrl > publicEmbedUrlAlt > publicEmbedUrl > id 기반 폴백
    if (response.publicCdnUrl) {
      return size ? `${response.publicCdnUrl}=s${size}-c` : response.publicCdnUrl;
    }
    
    if (response.publicEmbedUrlAlt) {
      return size ? `${response.publicEmbedUrlAlt}=s${size}-c` : response.publicEmbedUrlAlt;
    }
    
    if (response.publicEmbedUrl) {
      return response.publicEmbedUrl;
    }
    
    // 폴백: Google Drive 직접 링크
    const baseUrl = `https://lh3.googleusercontent.com/d/${response.id}`;
    return size ? `${baseUrl}=s${size}-c` : baseUrl;
  }, []);

  // 이미지 업로드 함수
  const uploadImage = useCallback(async (file: File, category: ImageCategory): Promise<string | null> => {
    try {
      setIsUploading(true);
      setUploadError(null);
      options.onUploadStart?.();

      const response = await storage.upload(file, category);
      const optimizedUrl = getOptimizedImageUrl(response);
      
      options.onUploadSuccess?.(response);
      return optimizedUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.';
      setUploadError(errorMessage);
      options.onUploadError?.(error instanceof Error ? error : new Error(errorMessage));
      return null;
    } finally {
      setIsUploading(false);
      options.onUploadComplete?.();
    }
  }, [getOptimizedImageUrl, options]);

  // 파일 선택 검증 함수
  const validateImageFile = useCallback((file: File): string | null => {
    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      return '이미지 파일만 업로드 가능합니다.';
    }

    // 파일 크기 검증 (10MB 제한)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return '파일 크기는 10MB를 초과할 수 없습니다.';
    }

    return null;
  }, []);

  // 이미지 URL에서 크기 조정
  const resizeImageUrl = useCallback((url: string, size: number): string => {
    // Google Drive URL 패턴 감지 및 크기 조정
    if (url.includes('googleusercontent.com') || url.includes('drive.google.com')) {
      // 기존 크기 파라미터 제거
      const baseUrl = url.split('=')[0];
      return `${baseUrl}=s${size}-c`;
    }
    
    // 다른 URL은 그대로 반환
    return url;
  }, []);

  // 썸네일 URL 생성
  const getThumbnailUrl = useCallback((url: string, size: number = 200): string => {
    return resizeImageUrl(url, size);
  }, [resizeImageUrl]);

  // 이미지 로딩 에러 처리용 폴백 URL
  const getDefaultImageUrl = useCallback((initials?: string): string => {
    if (initials) {
      // 이니셜 기반 아바타 URL (예: UI Avatars 서비스)
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=e5e7eb&color=374151&size=200`;
    }
    
    // 기본 아바타 URL
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRTVFN0VCIi8+CjxwYXRoIGQ9Ik0xMDAgODBDMTE2LjU2OSA4MCAxMzAgOTMuNDMxNSAxMzAgMTEwQzEzMCAxMjYuNTY5IDExNi41NjkgMTQwIDEwMCAxNDBDODMuNDMxNSAxNDAgNzAgMTI2LjU2OSA3MCAxMTBDNzAgOTMuNDMxNSA4My40MzE1IDgwIDEwMCA4MFoiIGZpbGw9IiM2QjczODAiLz4KPHBhdGggZD0iTTYwIDE3MEM2MCA5OS4yMDUxIDc5LjIwNTEgODAgMTAwIDgwQzEyMC43OTUgODAgMTQwIDk5LjIwNTEgMTQwIDE3MEg2MFoiIGZpbGw9IiM2QjczODAiLz4KPC9zdmc+';
  }, []);

  return {
    // 상태
    isUploading,
    uploadError,
    
    // 함수들
    uploadImage,
    validateImageFile,
    getOptimizedImageUrl,
    resizeImageUrl,
    getThumbnailUrl,
    getDefaultImageUrl,
    
    // 유틸리티
    clearError: useCallback(() => setUploadError(null), [])
  };
}

export default useImage;
