import { useState, useCallback } from 'react';
import { useApi } from '@prometheus-fe/context';
import type { ImageUploadResponse, ImageCategory } from '@prometheus-fe/types';

interface UseImageOptions {
  onUploadStart?: () => void;
  onUploadSuccess?: (response: ImageUploadResponse) => void;
  onUploadError?: (error: Error) => void;
  onUploadComplete?: () => void;
}

// 커스텀 에러 타입
class ImageUploadError extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error,
    public readonly file?: File
  ) {
    super(message);
    this.name = 'ImageUploadError';
  }
}

export function useImage(options: UseImageOptions = {}) {
  const { storage } = useApi();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // 이미지 URL 최적화 함수
  const getOptimizedImageUrl = useCallback((response: ImageUploadResponse, size?: number): string => {
    // 우선순위: webViewLink > publicCdnUrl > publicEmbedUrlAlt > publicEmbedUrl > id 기반 폴백
    if (response.webViewLink) {
      // webViewLink는 Google Drive 웹 뷰 링크로 안정적
      return response.webViewLink;
    }
    
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
      const customError = new ImageUploadError(errorMessage, error instanceof Error ? error : undefined, file);
      
      setUploadError(errorMessage);
      options.onUploadError?.(customError);
      return null;
    } finally {
      setIsUploading(false);
      options.onUploadComplete?.();
    }
  }, [getOptimizedImageUrl, options, storage]);

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
    if (!url || typeof url !== 'string') {
      return '';
    }
    
    // Google Drive URL 패턴 감지 및 크기 조정
    if (url.includes('googleusercontent.com') || url.includes('drive.google.com')) {
      // webViewLink의 경우 썸네일 URL로 변환
      if (url.includes('/view?usp=')) {
        // webViewLink를 썸네일 URL로 변환
        const fileId = url.match(/\/d\/([^\/]+)/)?.[1];
        if (fileId) {
          return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
        }
      }
      
      // 기존 크기 파라미터 제거
      const baseUrl = url.split('=')[0];
      return `${baseUrl}=s${size}-c`;
    }
    
    // 다른 URL은 그대로 반환
    return url;
  }, []);

  // 썸네일 URL 생성
  const getThumbnailUrl = useCallback((url: string, size: number = 200): string => {
    if (!url) return '';
    return resizeImageUrl(url, size);
  }, [resizeImageUrl]);

  // 응답에서 최적의 썸네일 URL 가져오기
  const getBestThumbnailUrl = useCallback((response: ImageUploadResponse, size: number = 200): string => {
    // 우선순위: thumbnailLink > publicCdnUrl > webViewLink 변환
    if (response.thumbnailLink) {
      return response.thumbnailLink;
    }
    
    if (response.publicCdnUrl) {
      return size ? `${response.publicCdnUrl}=s${size}-c` : response.publicCdnUrl;
    }
    
    if (response.webViewLink) {
      // webViewLink를 썸네일 URL로 변환
      const fileId = response.id;
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
    }
    
    // 폴백: Google Drive 직접 링크
    return `https://lh3.googleusercontent.com/d/${response.id}=s${size}-c`;
  }, []);

  // 이미지 로딩 에러 처리용 폴백 URL
  const getDefaultImageUrl = useCallback((initials?: string): string => {
    if (initials && typeof initials === 'string') {
      // 이니셜 기반 아바타 URL (예: UI Avatars 서비스)
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=e5e7eb&color=374151&size=200`;
    }
    
    // 기본 아바타 URL
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRTVFN0VCIi8+CjxwYXRoIGQ9Ik0xMDAgODBDMTE2LjU2OSA4MCAxMzAgOTMuNDMxNSAxMzAgMTEwQzEzMCAxMjYuNTY5IDExNi41NjkgMTQwIDEwMCAxNDBDODMuNDMxNSA4MCA3MCAxMjYuNTY5IDcwIDExMDBDMzAgOTMuNDMxNSA4My40MzE1IDgwIDEwMCA4MFoiIGZpbGw9IiM2QjcwODAiLz4KPHBhdGggZD0iTTYwIDE3MEM2MCA5OS4yMDUxIDc5LjIwNTEgODAgMTAwIDgwQzEyMC43OTUgODAgMTQwIDk5LjIwNTEgMTQwIDE3MEggNjBaIiBmaWxsPSIjQjcwODAiLz4KPC9zdmc+';
  }, []);

  // Google Drive URL을 썸네일 URL로 변환하는 함수 추가
  const getGoogleDriveThumbnailUrl = useCallback((url: string, size: number = 200): string => {
    if (!url || typeof url !== 'string') {
      return '';
    }
    
    // Google Drive webViewLink 패턴 감지
    if (url.includes('drive.google.com/file/d/')) {
      const fileId = url.match(/\/d\/([^\/]+)/)?.[1];
      if (fileId) {
        // Google Drive 썸네일 API 사용
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
      }
    }
    
    // Google Drive 직접 링크 패턴
    if (url.includes('lh3.googleusercontent.com/d/')) {
      const fileId = url.match(/\/d\/([^\/]+)/)?.[1];
      if (fileId) {
        return `https://lh3.googleusercontent.com/d/${fileId}=s${size}-c`;
      }
    }
    
    // 다른 URL은 그대로 반환
    return url;
  }, []);

  // 범용 이미지 URL 처리 함수 (Google Drive 포함)
  const getImageUrl = useCallback((url: string, size: number = 200): string => {
    if (!url) return '';
    
    // Google Drive URL인 경우 썸네일로 변환
    if (url.includes('drive.google.com') || url.includes('googleusercontent.com')) {
      return getGoogleDriveThumbnailUrl(url, size);
    }
    
    // 일반 URL은 기존 로직 사용
    return resizeImageUrl(url, size);
  }, [getGoogleDriveThumbnailUrl, resizeImageUrl]);

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
    getBestThumbnailUrl,
    getDefaultImageUrl,
    getGoogleDriveThumbnailUrl, // 새로 추가
    getImageUrl, // 새로 추가
    
    // 유틸리티
    clearError: useCallback(() => setUploadError(null), [])
  };
}

export default useImage;
