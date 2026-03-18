import apiClient from './client';

export const branchApi = {
  getAll: async (params?: {
    search?: string;
    skip?: number;
    take?: number;
    orderBy?: string;
  }) => {
    const response = await apiClient.get('/branches', { params });
    return response.data;
  },
  create: async (data: Record<string, unknown>) => {
    const response = await apiClient.post('/branches', data);
    return response.data;
  },
  update: async (id: number, data: Record<string, unknown>) => {
    const response = await apiClient.patch(`/branches/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await apiClient.delete(`/branches/${id}`);
  },
};
