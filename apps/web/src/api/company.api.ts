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
  create: async (data: Record<string, unknown>): Promise<Company> => {
    const response = await apiClient.post('/companies', data);
    return response.data;
  },
  update: async (id: number, data: Record<string, unknown>): Promise<Company> => {
    const response = await apiClient.patch(`/companies/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/companies/${id}`);
  },
};
