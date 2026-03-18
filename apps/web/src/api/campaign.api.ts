import apiClient from './client';

export const campaignApi = {
  getAll: async (params?: {
    search?: string;
    skip?: number;
    take?: number;
    orderBy?: string;
  }) => {
    const response = await apiClient.get('/campaigns', { params });
    return response.data;
  },
  create: async (data: Record<string, unknown>) => {
    const response = await apiClient.post('/campaigns', data);
    return response.data;
  },
  update: async (id: number, data: Record<string, unknown>) => {
    const response = await apiClient.patch(`/campaigns/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await apiClient.delete(`/campaigns/${id}`);
  },
};
