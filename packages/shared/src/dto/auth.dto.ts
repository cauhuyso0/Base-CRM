/**
 * Auth DTOs - TypeScript interfaces (no decorators)
 * These can be used in both frontend and backend
 */

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  companyId: number;
  branchId?: number;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

