import apiClient from './client';

export const ticketApi = {
  getAll: async (params?: {
    search?: string;
    skip?: number;
    take?: number;
    orderBy?: string;
  }) => {
    const response = await apiClient.get('/tickets', { params });
    return response.data;
  },
  create: async (data: Record<string, unknown>) => {
    const response = await apiClient.post('/tickets', data);
    return response.data;
  },
  update: async (id: number, data: Record<string, unknown>) => {
    const response = await apiClient.patch(`/tickets/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await apiClient.delete(`/tickets/${id}`);
  },
};
