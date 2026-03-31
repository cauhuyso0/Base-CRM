import apiClient from './client';
import { DashboardStats } from '@base-crm/shared';

export type DashboardPeriod = '7d' | '30d' | '90d' | '12m' | 'all';
export type DashboardStatsResponse = DashboardStats & {
  period: DashboardPeriod;
  revenueSeries: Array<{
    label: string;
    value: number;
  }>;
};

export const dashboardApi = {
  getStats: async (
    period: DashboardPeriod = '30d',
  ): Promise<DashboardStatsResponse> => {
    const response = await apiClient.get('/dashboard/stats', {
      params: { period },
    });
    return response.data;
  },
};
