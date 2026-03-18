import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  BaseRepository,
  BaseFilterOptions,
} from '../../../common/repositories/base.repository';
import { Customer } from '@prisma/client';
import { CreateCustomerDto, UpdateCustomerDto } from '../dto/customer.dto';

// Extend BaseFilterOptions for customer-specific filters
interface CustomerFilterOptions extends BaseFilterOptions {
  lastCustomerId?: number;
}
@Injectable()
export class CustomerRepository extends BaseRepository<
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  protected get model() {
    return this.prisma.customer;
  }

  protected get include() {
    return undefined;
  }

  protected get select() {
    return {
      id: true,
      code: true,
      uuid: true,
      name: true,
      type: true,
      email: true,
      phone: true,
      isActive: true,
      rating: true,
      status: true,
    };
  }

  protected buildSearchClause(search: string): any[] {
    return [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { status: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Override findAll to return ListCustomer[] instead of Customer[]
  // Using type assertion to satisfy base class signature while returning correct type
  async findAll(filters?: CustomerFilterOptions): Promise<Customer[]> {
    const rawOrderBy = filters?.orderBy as unknown;
    const parsedOrderBy =
      typeof rawOrderBy === 'string'
        ? (() => {
            const [field, direction] = rawOrderBy.split(':');
            return { [field]: direction === 'desc' ? 'desc' : 'asc' } as Record<
              string,
              'asc' | 'desc'
            >;
          })()
        : rawOrderBy && typeof rawOrderBy === 'object'
          ? (rawOrderBy as Record<string, 'asc' | 'desc'>)
          : undefined;

    const parsedSkip =
      filters?.skip !== undefined ? Number(filters.skip) || 0 : 0;
    const parsedTake =
      filters?.take !== undefined ? Number(filters.take) || 10 : 10;

    const where = this.buildWhereClause(filters);
    const findOptions: {
      where: Record<string, unknown>;
      orderBy?: Record<string, 'asc' | 'desc'>;
      select?: Record<string, boolean>;
      skip?: number;
      take?: number;
      cursor?: { id: number };
    } = {
      where,
      orderBy: parsedOrderBy || { createdAt: 'desc' },
      select: this.select, // Use select to return only specific fields
    };

    findOptions.skip = parsedSkip;
    findOptions.take = parsedTake;

    if (filters?.lastCustomerId !== undefined) {
      findOptions.cursor = { id: filters.lastCustomerId };
    }

    // Type assertion: Prisma returns ListCustomer[] when using select,
    // but we cast to Customer[] to satisfy base class signature
    // The actual runtime type is ListCustomer[]
    return this.model.findMany(findOptions) as unknown as Promise<Customer[]>;
  }

  async findByEmail(
    email: string,
    companyId: number,
  ): Promise<Customer | null> {
    return this.model.findFirst({
      where: {
        email,
        companyId,
      },
      include: this.include,
    });
  }

  async findByCode(code: string, companyId: number): Promise<Customer | null> {
    return this.model.findFirst({
      where: {
        code,
        companyId,
      },
      include: this.include,
    });
  }
}
