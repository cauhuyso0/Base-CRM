/**
 * Company types
 */

export interface CreateCompanyDto {
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

export interface UpdateCompanyDto {
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

export interface ListCompany {
  id: number;
  uuid: string;
  code: string;
  name: string;
  taxCode: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo: string | null;
  isActive: boolean;
}
