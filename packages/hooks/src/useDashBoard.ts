import { useState, useCallback } from 'react';
import { useApi } from '@prometheus-fe/context';
import type { AdminDashboardResponse } from '@prometheus-fe/types';

export function useDashBoard() {
  const { dashboard } = useApi();

  // 상태 관리
  const [dashboardData, setDashboardData] = useState<AdminDashboardResponse | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState<boolean>(false);

  // 관리자 대시보드 통계 조회
  const getDashboardStats = useCallback(async (): Promise<AdminDashboardResponse> => {
    if (!dashboard) {
      throw new Error('Dashboard API not available');
    }
    try {
      setIsLoadingDashboard(true);
      const data = await dashboard.getDashboardStats();
      setDashboardData(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    } finally {
      setIsLoadingDashboard(false);
    }
  }, [dashboard]);

  return {
    // 데이터
    dashboardData,

    // 로딩 상태
    isLoadingDashboard,

    // API 함수들
    getDashboardStats,
  };
}
