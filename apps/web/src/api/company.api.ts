import { Company } from '@base-crm/shared';
import apiClient from './client';

export const companyApi = {
  getAll: async (params?: {
    search?: string;
    isActive?: boolean;
    skip?: number;
    take?: number;
    orderBy?: string;
  }): Promise<Company[]> => {
    const response = await apiClient.get('/companies', { params });
    return response.data;
  },
};
