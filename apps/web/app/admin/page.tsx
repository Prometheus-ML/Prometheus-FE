"use client";
import { useEffect } from 'react';
import { useAuthStore } from '@prometheus-fe/stores';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const canAccessManager = useAuthStore((s) => s.canAccessManager);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      alert('로그인이 필요합니다.');
      router.push('/auth/login');
      return;
    }

    if (!canAccessManager()) {
      alert('관리자가 아닙니다.');
      router.push('/');
      return;
    }
  }, [isAuthenticated, canAccessManager, router]);

  // 권한 체크가 완료되지 않았으면 로딩 표시
  if (!isAuthenticated() || !canAccessManager()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">권한 확인 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">관리자 페이지</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">관리자 기능</h2>
          <p className="text-gray-600">관리자 전용 기능들이 여기에 표시됩니다.</p>
        </div>
      </div>
    </div>
  );
}
