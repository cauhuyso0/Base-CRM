import { PrismaService } from '../../prisma/prisma.service';
import { IRepository } from '../interfaces/repository.interface';

// Type definitions for filters
export interface BaseFilterOptions {
  type?: string;
  companyUuid?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  includeDeleted?: boolean;
  status?: string;
  search?: string;
  orderBy?: Record<string, 'asc' | 'desc'> | string;
  skip?: number;
  take?: number;
  where?: Record<string, unknown>;
}

// Type for Prisma model delegate
// Using any here is necessary for generic base repository pattern
type PrismaModelDelegate = {
  create: (args: { data: any; include?: any }) => Promise<any>;

  findMany: (args: {
    where?: any;

    include?: any;

    orderBy?: any;
    skip?: number;
    take?: number;
  }) => Promise<any[]>;

  findUnique: (args: { where: any; include?: any }) => Promise<any>;

  findFirst: (args: { where: any; include?: any }) => Promise<any>;

  update: (args: { where: any; data: any; include?: any }) => Promise<any>;

  delete: (args: { where: any }) => Promise<any>;

  count: (args: { where?: any }) => Promise<number>;
};

export abstract class BaseRepository<
  T,
  CreateDto,
  UpdateDto,
> implements IRepository<T, CreateDto, UpdateDto> {
  protected abstract get model(): PrismaModelDelegate;
  protected abstract get include(): Record<string, boolean> | undefined;
  protected get select(): Record<string, boolean> | undefined {
    return undefined;
  }

  constructor(protected readonly prisma: PrismaService) {}

  async create(data: CreateDto): Promise<T> {
    const createOptions: {
      data: CreateDto;
      include?: Record<string, boolean>;
    } = { data };
    const include = this.include;
    if (include) {
      createOptions.include = include;
    }
    return (await this.model.create(createOptions)) as T;
  }

  async findAll(filters?: BaseFilterOptions): Promise<T[]> {
    const where = this.buildWhereClause(filters);
    const parsedOrderBy =
      typeof filters?.orderBy === 'string'
        ? (() => {
            const [field, direction] = filters.orderBy.split(':');
            return {
              [field]: direction === 'desc' ? 'desc' : 'asc',
            } as Record<string, 'asc' | 'desc'>;
          })()
        : filters?.orderBy;

    const parsedSkip =
      filters?.skip !== undefined
        ? typeof filters.skip === 'string'
          ? Number(filters.skip)
          : filters.skip
        : undefined;

    const parsedTake =
      filters?.take !== undefined
        ? typeof filters.take === 'string'
          ? Number(filters.take)
          : filters.take
        : undefined;

    const findOptions: {
      where: Record<string, unknown>;
      orderBy?: Record<string, 'asc' | 'desc'>;
      include?: Record<string, boolean>;
      select?: Record<string, boolean>;
      skip?: number;
      take?: number;
    } = {
      where,
      orderBy: parsedOrderBy || { createdAt: 'desc' },
    };

    // Use select if available, otherwise use include
    const select = this.select;
    const include = this.include;
    if (select) {
      findOptions.select = select;
    } else if (include) {
      findOptions.include = include;
    }

    if (parsedSkip !== undefined && !Number.isNaN(parsedSkip)) {
      findOptions.skip = parsedSkip;
    }
    if (parsedTake !== undefined && !Number.isNaN(parsedTake)) {
      findOptions.take = parsedTake;
    }
    return (await this.model.findMany(findOptions)) as T[];
  }

  async findOne(id: number): Promise<T | null> {
    const findOptions: {
      where: { id: number };
      include?: Record<string, boolean>;
    } = { where: { id } };
    const include = this.include;
    if (include) {
      findOptions.include = include;
    }
    return (await this.model.findUnique(findOptions)) as T | null;
  }

  async findOneBy(where: Record<string, unknown>): Promise<T | null> {
    const findOptions: {
      where: Record<string, unknown>;
      include?: Record<string, boolean>;
    } = { where };
    const include = this.include;
    if (include) {
      findOptions.include = include;
    }
    return (await this.model.findFirst(findOptions)) as T | null;
  }

  async update(id: number, data: UpdateDto): Promise<T> {
    const updateOptions: {
      where: { id: number };
      data: UpdateDto;
      include?: Record<string, boolean>;
    } = {
      where: { id },
      data,
    };
    const include = this.include;
    if (include) {
      updateOptions.include = include;
    }
    return (await this.model.update(updateOptions)) as T;
  }

  async remove(id: number): Promise<T> {
    // Soft delete by default - set isDeleted = true
    const updateOptions: {
      where: { id: number };
      data: { isDeleted: boolean };
      include?: Record<string, boolean>;
    } = {
      where: { id },
      data: { isDeleted: true },
    };
    const include = this.include;
    if (include) {
      updateOptions.include = include;
    }
    return (await this.model.update(updateOptions)) as T;
  }

  async delete(id: number): Promise<T> {
    // Hard delete
    return (await this.model.delete({
      where: { id },
    })) as T;
  }

  async count(filters?: BaseFilterOptions): Promise<number> {
    const where = this.buildWhereClause(filters);
    return await this.model.count({
      where,
    });
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.model.count({
      where: { id },
    });
    return count > 0;
  }

  protected buildWhereClause(
    filters?: BaseFilterOptions,
  ): Record<string, unknown> {
    if (!filters) {
      // Default: exclude deleted records
      return { isDeleted: false };
    }

    const where: Record<string, unknown> = {};

    // Only set isActive if explicitly provided
    if (filters.isActive !== undefined) {
      where.isActive =
        filters.isActive === true ||
        String(filters.isActive) === 'true' ||
        String(filters.isActive) === '1';
    }

    // Default: exclude deleted records unless explicitly included
    if (
      filters.includeDeleted === true ||
      String(filters.includeDeleted) === 'true'
    ) {
      // Include all records including deleted ones - don't set isDeleted filter
    } else if (filters.isDeleted !== undefined) {
      where.isDeleted =
        filters.isDeleted === true ||
        String(filters.isDeleted) === 'true' ||
        String(filters.isDeleted) === '1';
    } else {
      // Default: exclude deleted records
      where.isDeleted = false;
    }
    if (filters.status !== undefined) {
      where.status = filters.status;
    }

    if (filters.companyUuid !== undefined) {
      where.companyUuid = filters.companyUuid;
    }

    if (filters.type !== undefined) {
      where.type = filters.type;
    }

    if (filters.search) {
      where.OR = this.buildSearchClause(filters.search);
    }

    // Merge any additional where conditions
    if (filters.where) {
      Object.assign(where, filters.where);
    }

    return where;
  }

  protected buildSearchClause(_search: string): Array<Record<string, unknown>> {
    // Override in child classes for specific search fields
    // Parameter is prefixed with _ to indicate it's intentionally unused in base class
    void _search;
    return [];
  }
}
