import { Injectable } from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { CustomerRepository } from './repositories/customer.repository';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { Customer } from '@prisma/client';
import { ListCustomer } from '@base-crm/shared';
import { BaseFilterOptions } from 'src/common/repositories/base.repository';

@Injectable()
export class CustomerService extends BaseService<
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto
> {
  constructor(protected readonly repository: CustomerRepository) {
    super(repository);
  }

  async findByEmail(email: string, companyId: number) {
    return this.repository.findByEmail(email, companyId);
  }

  async findByCode(code: string, companyId: number) {
    return this.repository.findByCode(code, companyId);
  }

  // Override findAll to return ListCustomer[] instead of Customer[]
  // Using type assertion to satisfy base class signature
  async findAll(filters?: BaseFilterOptions): Promise<Customer[]> {
    const result = await this.repository.findAll(filters);
    return result as unknown as Customer[];
  }

  // Public method that returns the correct type for consumers
  async getAll(filters?: BaseFilterOptions): Promise<ListCustomer[]> {
    const result = await this.findAll(filters);
    return result as unknown as ListCustomer[];
  }
}
