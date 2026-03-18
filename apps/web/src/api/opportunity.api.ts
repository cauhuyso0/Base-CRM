import apiClient from './client';

export const opportunityApi = {
  getAll: async (params?: {
    search?: string;
    skip?: number;
    take?: number;
    orderBy?: string;
  }) => {
    const response = await apiClient.get('/opportunities', { params });
    return response.data;
  },
  create: async (data: Record<string, unknown>) => {
    const response = await apiClient.post('/opportunities', data);
    return response.data;
  },
  update: async (id: number, data: Record<string, unknown>) => {
    const response = await apiClient.patch(`/opportunities/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await apiClient.delete(`/opportunities/${id}`);
  },
};
