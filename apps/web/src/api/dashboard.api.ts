import apiClient from './client';
import { DashboardStats } from '@base-crm/shared';

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },
};
