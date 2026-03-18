import apiClient from './client';

export const caseApi = {
  getAll: async (params?: {
    search?: string;
    skip?: number;
    take?: number;
    orderBy?: string;
  }) => {
    const response = await apiClient.get('/cases', { params });
    return response.data;
  },
  create: async (data: Record<string, unknown>) => {
    const response = await apiClient.post('/cases', data);
    return response.data;
  },
  update: async (id: number, data: Record<string, unknown>) => {
    const response = await apiClient.patch(`/cases/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await apiClient.delete(`/cases/${id}`);
  },
};
