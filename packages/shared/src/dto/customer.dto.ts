/**
 * Customer DTOs - TypeScript interfaces
 */

export interface CreateCustomerRequest {
  company_uuid: string;
  code: string;
  name: string;
  type?: string;
  taxCode?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  industry?: string;
  employeeCount?: number;
  annualRevenue?: number;
  rating?: number;
  status?: string;
  source?: string;
  assignedTo?: number;
  tags?: string;
  notes?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  type?: string;
  taxCode?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  industry?: string;
  employeeCount?: number;
  annualRevenue?: number;
  rating?: number;
  status?: string;
  source?: string;
  assignedTo?: number;
  tags?: string;
  notes?: string;
  isActive?: boolean;
}
