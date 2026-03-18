import apiClient from './client';

export const salesOrderApi = {
  getAll: async (params?: {
    search?: string;
    skip?: number;
    take?: number;
    orderBy?: string;
  }) => {
    const response = await apiClient.get('/sales-orders', { params });
    return response.data;
  },
  create: async (data: Record<string, unknown>) => {
    const response = await apiClient.post('/sales-orders', data);
    return response.data;
  },
  update: async (id: number, data: Record<string, unknown>) => {
    const response = await apiClient.patch(`/sales-orders/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await apiClient.delete(`/sales-orders/${id}`);
  },
};
