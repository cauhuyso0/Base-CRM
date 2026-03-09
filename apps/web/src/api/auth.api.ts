import apiClient from './client';
import { LoginDto, RegisterDto, AuthResponse, UserProfile } from '@base-crm/shared';

export const authApi = {
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },
  
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },
  
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },
};

