/**
 * Company DTOs - TypeScript interfaces
 */

export interface CreateCompanyRequest {
  code: string;
  name: string;
  taxCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  isActive?: boolean;
  createdBy?: string;
}

export interface UpdateCompanyRequest {
  name?: string;
  taxCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  isActive?: boolean;
  updatedBy?: string;
}
