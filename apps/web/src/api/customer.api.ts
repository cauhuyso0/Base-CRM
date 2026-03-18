import apiClient from './client';
import {
  CreateCustomerRequest,
  UpdateCustomerRequest,
  Customer,
  ListCustomer,
} from '@base-crm/shared';

export const customerApi = {
  getAll: async (params?: {
    companyId?: number;
    search?: string;
    isActive?: boolean;
    skip?: number;
    take?: number;
    orderBy?: string;
    status?: string;
  }): Promise<ListCustomer[]> => {
    const response = await apiClient.get('/customers', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  },

  getByUuid: async (uuid: string): Promise<Customer> => {
    const response = await apiClient.get(`/customers/find-one?uuid=${uuid}`);
    return response.data;
  },

  create: async (data: CreateCustomerRequest): Promise<Customer> => {
    const response = await apiClient.post('/customers', data);
    return response.data;
  },

  update: async (
    id: number,
    data: UpdateCustomerRequest,
  ): Promise<Customer> => {
    const response = await apiClient.patch(`/customers/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
  },

  count: async (params?: {
    companyId?: number;
    isActive?: boolean;
    search?: string;
    status?: string;
  }): Promise<number> => {
    const response = await apiClient.get('/customers/count', { params });
    return response.data;
  },
};
