"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@prometheus-fe/stores';
import { useRouter } from 'next/navigation';
import { useDashBoard } from '@prometheus-fe/hooks';
import GlassCard from '@/src/components/GlassCard';

export default function AdminDashboard() {
  const canAccessAdministrator = useAuthStore((s) => s.canAccessAdministrator);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const { dashboardData, isLoadingDashboard, getDashboardStats } = useDashBoard();

  // API 데이터를 기반으로 최근 활동 생성
  const getRecentActivities = (dashboardData: any) => {
    const activities: any[] = [];

    // 최근 가입자 활동 추가
    if (dashboardData?.member_stats?.recent_registrations) {
      dashboardData.member_stats.recent_registrations.forEach((member: any, index: number) => {
        activities.push({
          id: `member-${member.id}`,
          type: 'member',
          action: '새 멤버 가입',
          user: member.name,
          time: '최근'
        });
      });
    }

    // 최근 게시글 활동 추가
    if (dashboardData?.post_stats?.recent_posts) {
      dashboardData.post_stats.recent_posts.forEach((post: any, index: number) => {
        activities.push({
          id: `post-${post.id}`,
          type: 'post',
          action: '게시글 작성',
          user: post.author_id,
          time: '최근'
        });
      });
    }

    // 최대 5개로 제한
    return activities.slice(0, 5);
  };

  const recentActivities = dashboardData ? getRecentActivities(dashboardData) : [];

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    if (!canAccessAdministrator()) {
      router.push('/');
      return;
    }

    // 대시보드 데이터 로드
    getDashboardStats().catch(error => {
      console.error('Failed to load dashboard data:', error);
    });
  }, [isAuthenticated, canAccessAdministrator, router, getDashboardStats]);

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

  if (isLoadingDashboard) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-white">대시보드 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 멤버 통계 */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">총 멤버</p>
              <p className="text-3xl font-bold text-white">{dashboardData?.member_stats.total_members || 0}</p>
              <p className="text-xs text-gray-400">
                멤버: {dashboardData?.member_stats.members_by_grant?.Member || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
          </div>
        </GlassCard>

        {/* 프로젝트 통계 */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">프로젝트</p>
              <p className="text-3xl font-bold text-white">{dashboardData?.project_stats.total_projects || 0}</p>
              <p className="text-xs text-gray-400">
                진행중: {dashboardData?.project_stats.projects_by_status?.active || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </GlassCard>

        {/* 이벤트 통계 */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">이벤트</p>
              <p className="text-3xl font-bold text-white">{dashboardData?.event_stats.total_events || 0}</p>
              <p className="text-xs text-gray-400">
                총 이벤트 수
              </p>
            </div>
            <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </GlassCard>

        {/* 그룹 통계 */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">모임</p>
              <p className="text-3xl font-bold text-white">{dashboardData?.group_stats.total_groups || 0}</p>
              <p className="text-xs text-gray-400">
                총 모임 수
              </p>
            </div>
            <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 게시글 통계 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">게시글 통계</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">총 게시글</span>
              <span className="text-lg font-bold text-white">{dashboardData?.post_stats.total_posts || 0}</span>
            </div>
            {dashboardData?.post_stats.posts_by_category && (
              <div className="space-y-2">
                {Object.entries(dashboardData.post_stats.posts_by_category).map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 capitalize">{category}</span>
                    <span className="text-gray-300">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">시스템 현황</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">블랙리스트</span>
              <span className="text-lg font-bold text-red-400">{dashboardData?.system_stats.blacklisted_users || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">승인 대기</span>
              <span className="text-lg font-bold text-white">{dashboardData?.system_stats.pending_approvals || 0}</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 멤버 기수별 분포 */}
      {dashboardData?.member_stats.members_by_gen && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">기수별 멤버 분포</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(dashboardData.member_stats.members_by_gen)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([gen, count]) => (
                <div key={gen} className="text-center">
                  <div className="text-2xl font-bold text-white">{count}</div>
                  <div className="text-sm text-gray-400">{gen}기</div>
                </div>
              ))}
          </div>
        </GlassCard>
      )}

      {/* 최근 활동 */}
      {recentActivities.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">최근 활동</h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="text-red-400">
                    {getIcon(activity.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{activity.action}</p>
                  <p className="text-xs text-gray-400">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
