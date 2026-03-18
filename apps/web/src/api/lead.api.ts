import apiClient from './client';

export const leadApi = {
  getAll: async (params?: {
    search?: string;
    skip?: number;
    take?: number;
    orderBy?: string;
  }) => {
    const response = await apiClient.get('/leads', { params });
    return response.data;
  },
  create: async (data: Record<string, unknown>) => {
    const response = await apiClient.post('/leads', data);
    return response.data;
  },
  update: async (id: number, data: Record<string, unknown>) => {
    const response = await apiClient.patch(`/leads/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await apiClient.delete(`/leads/${id}`);
  },
};
