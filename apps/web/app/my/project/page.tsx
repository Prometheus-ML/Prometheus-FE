'use client';

import Link from 'next/link';
import { useAuthStore } from '@prometheus-fe/stores';
import GlassCard from '../../../src/components/GlassCard';

export default function ProjectPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">내 프로젝트</h2>
        <div className="text-gray-300 text-center py-8">
          프로젝트 탭 준비 중...
        </div>
      </GlassCard>
    </div>
  );
}
