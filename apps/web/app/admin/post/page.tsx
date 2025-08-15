"use client";
import { useState, useEffect } from 'react';
import { useAuthStore } from '@prometheus-fe/stores';


export default function AdminPostPage() {
  const canAccessManager = useAuthStore((s) => s.canAccessManager);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  // Hydration 완료 상태 관리
  const [isMounted, setIsMounted] = useState<boolean>(false);

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

    if (!canAccessManager()) {
      alert('관리자가 아닙니다.');
      window.location.href = '/';
      return;
    }
  }, [isMounted, isAuthenticated, canAccessManager]);

  // Hydration이 완료되지 않았거나 권한이 없는 경우
  if (!isMounted || !isAuthenticated() || !canAccessManager()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">
          {!isMounted ? '로딩 중...' : '권한 확인 중...'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <div className="text-center text-white">
        <h3 className="text-lg font-medium mb-2">게시글 관리</h3>
        <p className="text-gray-300">게시글 관리 기능이 곧 제공됩니다.</p>
      </div>
    </div>
  );
}
