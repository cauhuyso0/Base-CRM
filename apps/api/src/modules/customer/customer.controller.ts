import { Controller, Get, Query, ParseIntPipe, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BaseController } from '../../common/controllers/base.controller';
import { CustomerService } from './customer.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { Customer } from '@prisma/client';
import type { BaseFilterOptions } from '../../common/repositories/base.repository';

@ApiTags('customers')
@ApiBearerAuth('JWT-auth')
@Controller('customers')
export class CustomerController extends BaseController<
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto
> {
  constructor(protected readonly service: CustomerService) {
    super(service);
    console.log('✅ CustomerController initialized');
  }

  @Get()
  @ApiOperation({
    summary: 'Get all customers',
    description: 'Get all customers with optional filters',
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term',
    example: 'ABC',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Customers retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
      },
    },
  })
  // Override findAll to return ListCustomer[] instead of Customer[]
  // Using type assertion to satisfy base class signature
  override findAll(
    @Request() req: any,
    @Query() rawFilters: Record<string, unknown>,
  ): Promise<Customer[]> {
    // Parse query parameters to correct types
    const filters: BaseFilterOptions = {
      ...rawFilters,
      companyId: req.user?.isSuperAdmin ? rawFilters.companyId as number | undefined : req.user?.companyId,
      // Parse boolean values
      isActive:
        rawFilters.isActive !== undefined
          ? rawFilters.isActive === 'true' ||
            rawFilters.isActive === true ||
            rawFilters.isActive === '1'
          : undefined,
      isDeleted:
        rawFilters.isDeleted !== undefined
          ? rawFilters.isDeleted === 'true' ||
            rawFilters.isDeleted === true ||
            rawFilters.isDeleted === '1'
          : undefined,
      includeDeleted:
        rawFilters.includeDeleted !== undefined
          ? rawFilters.includeDeleted === 'true' ||
            rawFilters.includeDeleted === true ||
            rawFilters.includeDeleted === '1'
          : undefined,
      // Parse number values
      skip:
        rawFilters.skip !== undefined
          ? parseInt(
              typeof rawFilters.skip === 'string' ||
                typeof rawFilters.skip === 'number'
                ? String(rawFilters.skip)
                : '0',
              10,
            )
          : undefined,
      take:
        rawFilters.take !== undefined
          ? parseInt(
              typeof rawFilters.take === 'string' ||
                typeof rawFilters.take === 'number'
                ? String(rawFilters.take)
                : '10',
              10,
            )
          : undefined,
      // Parse orderBy from string "field:asc" to object { field: 'asc' }
      orderBy:
        rawFilters.orderBy && typeof rawFilters.orderBy === 'string'
          ? (() => {
              const [field, direction] = String(rawFilters.orderBy).split(':');
              return { [field]: (direction || 'asc') as 'asc' | 'desc' };
            })()
          : (rawFilters.orderBy as Record<string, 'asc' | 'desc'> | undefined),
    };

    console.log('📍 Parsed filters:', filters);

    // Use getAll() to get ListCustomer[] instead of full Customer[]
    // Type assertion: return ListCustomer[] at runtime but satisfy base class signature
    return this.service.getAll(filters) as unknown as Promise<Customer[]>;
  }

  @Get('by-email')
  @ApiOperation({
    summary: 'Find customer by email',
    description: 'Get customer by email address and company ID',
  })
  @ApiQuery({
    name: 'email',
    required: true,
    type: String,
    description: 'Customer email address',
    example: 'contact@abc.com',
  })
  @ApiQuery({
    name: 'companyId',
    required: true,
    type: Number,
    description: 'Company ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Customer found',
    schema: {
      type: 'object',
      example: {
        id: 1,
        code: 'CUST001',
        name: 'ABC Company',
        email: 'contact@abc.com',
        phone: '+84123456789',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  findByEmail(
    @Query('email') email: string,
    @Query('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.service.findByEmail(email, companyId);
  }

  @Get('by-code')
  @ApiOperation({
    summary: 'Find customer by code',
    description: 'Get customer by code and company ID',
  })
  @ApiQuery({
    name: 'code',
    required: true,
    type: String,
    description: 'Customer code',
    example: 'CUST001',
  })
  @ApiQuery({
    name: 'companyId',
    required: true,
    type: Number,
    description: 'Company ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Customer found',
    schema: {
      type: 'object',
      example: {
        id: 1,
        code: 'CUST001',
        name: 'ABC Company',
        email: 'contact@abc.com',
        phone: '+84123456789',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  findByCode(
    @Query('code') code: string,
    @Query('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.service.findByCode(code, companyId);
  }
}
