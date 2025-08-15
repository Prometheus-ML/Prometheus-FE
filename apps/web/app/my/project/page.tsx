'use client';

import Link from 'next/link';
import { useAuthStore } from '@prometheus-fe/stores';

export default function ProjectPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="px-6 py-6">
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">내 프로젝트</h2>
        <div className="text-gray-600 text-center py-8">
          프로젝트 탭 준비 중...
        </div>
      </div>
    </div>
  );
}
