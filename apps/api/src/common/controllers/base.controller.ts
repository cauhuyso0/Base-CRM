import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { IBaseService } from '../interfaces/service.interface';

export abstract class BaseController<T, CreateDto, UpdateDto> {
  constructor(
    protected readonly service: IBaseService<T, CreateDto, UpdateDto>,
  ) {}

  private applyCompanyScope(req: any, filters: Record<string, unknown>) {
    if (req?.user?.isSuperAdmin) {
      return filters;
    }
    const scoped = { ...filters };
    const routeHint = `${String(req?.baseUrl || '')} ${String(req?.originalUrl || '')}`;
    const isCompanyResource = routeHint.includes('/companies');
    if (isCompanyResource) {
      delete scoped.companyId;
      scoped.id = req.user.companyId;
      return scoped;
    }
    if (scoped.companyId !== undefined) {
      const requested = Number(scoped.companyId);
      if (Number.isFinite(requested) && requested !== Number(req.user.companyId)) {
        scoped.companyId = req.user.companyId;
      }
    } else {
      scoped.companyId = req.user.companyId;
    }
    return scoped;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new record',
    description: 'Create a new record with the provided data',
  })
  @ApiBody({
    description:
      'Create record data (see DTO schema below for required fields)',
  })
  @ApiResponse({
    status: 201,
    description: 'Record created successfully',
    schema: {
      type: 'object',
      example: {
        id: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Request() req: any, @Body() createDto: CreateDto): Promise<T> {
    if (req?.user?.isSuperAdmin) {
      return this.service.create(createDto);
    }
    const payload = createDto as Record<string, unknown>;
    if (payload.companyId === undefined) {
      payload.companyId = req.user.companyId;
    }
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all records',
    description: 'Retrieve all records with optional filters',
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    type: Number,
    description: 'Filter by company ID',
    example: 1,
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
    example: true,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term for name, code, email, etc.',
    example: 'ABC',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of records to skip (pagination)',
    example: 0,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of records to take (pagination)',
    example: 10,
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    type: String,
    description: 'Field to order by (e.g., "name:asc" or "createdAt:desc")',
    example: 'name:asc',
  })
  @ApiResponse({
    status: 200,
    description: 'Records retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
      },
    },
  })
  findAll(@Request() req: any, @Query() filters: any): Promise<T[]> {
    return this.service.findAll(this.applyCompanyScope(req, filters));
  }

  @Get('count')
  @ApiOperation({
    summary: 'Count records',
    description: 'Get total count of records with optional filters',
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    type: Number,
    description: 'Filter by company ID',
    example: 1,
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
    example: true,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term',
    example: 'ABC',
  })
  @ApiResponse({
    status: 200,
    description: 'Count retrieved successfully',
    schema: {
      type: 'number',
      example: 100,
    },
  })
  count(@Request() req: any, @Query() filters: any): Promise<number> {
    return this.service.count(this.applyCompanyScope(req, filters));
  }

  @Get('find-one')
  @ApiOperation({
    summary: 'Find one record by conditions',
    description:
      'Retrieve one record by query conditions, e.g. /find-one?code=ABC001',
  })
  @ApiQuery({
    name: 'conditions',
    required: false,
    type: String,
    description: 'Any query parameters will be used as where conditions',
    example: 'code=ABC001',
  })
  @ApiResponse({
    status: 200,
    description: 'Record found',
    schema: {
      type: 'object',
    },
  })
  @ApiResponse({ status: 404, description: 'Record not found' })
  findOneBy(@Request() req: any, @Query() where: Record<string, unknown>): Promise<T> {
    return this.service.findOneBy(this.applyCompanyScope(req, where));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get record by ID',
    description: 'Retrieve a single record by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Record ID (integer)',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Record found',
    schema: {
      type: 'object',
      example: {
        id: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Record not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<T> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update record',
    description: 'Update an existing record by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Record ID (integer)',
    type: Number,
    example: 1,
  })
  @ApiBody({
    description:
      'Update record data (all fields are optional, see DTO schema below)',
  })
  @ApiResponse({
    status: 200,
    description: 'Record updated successfully',
    schema: {
      type: 'object',
      example: {
        id: 1,
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Record not found' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDto,
  ): Promise<T> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete record',
    description: 'Delete a record by ID (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'Record ID (integer)',
    type: Number,
    example: 1,
  })
  @ApiResponse({ status: 204, description: 'Record deleted successfully' })
  @ApiResponse({ status: 404, description: 'Record not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<T> {
    return this.service.remove(id);
  }
}
