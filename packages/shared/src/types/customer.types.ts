/**
 * Customer types
 */

export interface CreateCustomerDto {
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

export interface UpdateCustomerDto {
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

export interface ListCustomer {
  id: number;
  code: string;
  uuid: string;
  name: string;
  type: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  rating: number | null;
  status: string;
}
