"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@prometheus-fe/stores';
import { useRouter } from 'next/navigation';
import GlassCard from '../../src/components/GlassCard';
import RedButton from '../../src/components/RedButton';

// 임시 통계 데이터
const statsData = {
  totalMembers: 156,
  activeMembers: 142,
  totalProjects: 23,
  activeProjects: 18,
  totalPosts: 89,
  thisMonthPosts: 12,
  totalEvents: 8,
  upcomingEvents: 3,
  totalSponsors: 5,
  activeSponsors: 4,
  blacklistedUsers: 2
};

const recentActivities = [
  { id: 1, type: 'member', action: '새 멤버 가입', user: '김철수', time: '2시간 전' },
  { id: 2, type: 'project', action: '프로젝트 생성', user: '이영희', time: '4시간 전' },
  { id: 3, type: 'post', action: '게시글 작성', user: '박민수', time: '6시간 전' },
  { id: 4, type: 'event', action: '이벤트 등록', user: '최지영', time: '1일 전' },
  { id: 5, type: 'sponsor', action: '스폰서십 계약', user: '정현우', time: '2일 전' }
];

export default function AdminDashboard() {
  const canAccessAdministrator = useAuthStore((s) => s.canAccessAdministrator);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    if (!canAccessAdministrator()) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, canAccessAdministrator, router]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'member':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'project':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'post':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'event':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'sponsor':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <GlassCard className="p-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-white sm:text-3xl sm:truncate">
              관리자 대시보드
            </h2>
            <p className="mt-1 text-sm text-gray-300">
              프로메테우스 전체 현황을 한눈에 확인하세요
            </p>
          </div>
        </div>
      </GlassCard>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">총 멤버</p>
              <p className="text-2xl font-bold">{statsData.totalMembers}</p>
              <p className="text-xs opacity-75">활성: {statsData.activeMembers}</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">프로젝트</p>
              <p className="text-2xl font-bold">{statsData.totalProjects}</p>
              <p className="text-xs opacity-75">진행중: {statsData.activeProjects}</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">게시글</p>
              <p className="text-2xl font-bold">{statsData.totalPosts}</p>
              <p className="text-xs opacity-75">이번달: {statsData.thisMonthPosts}</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">이벤트</p>
              <p className="text-2xl font-bold">{statsData.totalEvents}</p>
              <p className="text-xs opacity-75">예정: {statsData.upcomingEvents}</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 추가 통계 */}
      <div className="grid grid-cols-1 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">스폰서십 현황</h3>
            <span className="text-sm text-gray-300">총 {statsData.totalSponsors}개</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex-1 bg-gray-200/20 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${(statsData.activeSponsors / statsData.totalSponsors) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-300">
              {statsData.activeSponsors}개 활성
            </span>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">블랙리스트</h3>
              <p className="text-sm text-gray-300">차단된 사용자 수</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-red-400">{statsData.blacklistedUsers}</p>
              <p className="text-xs text-gray-300">명</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 최근 활동 */}
      <GlassCard className="p-4">
        <h3 className="text-lg font-semibold text-white mb-4">최근 활동</h3>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
              <div className="w-8 h-8 bg-blue-100/20 rounded-lg flex items-center justify-center">
                <div className="text-blue-400">
                  {getIcon(activity.type)}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{activity.action}</p>
                <p className="text-xs text-gray-300">{activity.user} • {activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
