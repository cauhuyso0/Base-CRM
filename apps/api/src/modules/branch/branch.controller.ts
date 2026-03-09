import { Controller, Get, Query, ParseIntPipe, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { BaseController } from '../../common/controllers/base.controller';
import { BranchService } from './branch.service';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';
import { Branch } from '@prisma/client';

@ApiTags('branches')
@ApiBearerAuth('JWT-auth')
@Controller('branches')
export class BranchController extends BaseController<
  Branch,
  CreateBranchDto,
  UpdateBranchDto
> {
  constructor(protected readonly service: BranchService) {
    super(service);
  }

  @Get('by-company/:companyId')
  @ApiOperation({ 
    summary: 'Get branches by company', 
    description: 'Retrieve all branches for a specific company' 
  })
  @ApiParam({ 
    name: 'companyId', 
    type: Number,
    description: 'Company ID (integer)', 
    example: 1 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of branches',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        example: {
          id: 1,
          code: 'BR001',
          name: 'Ho Chi Minh Branch',
          address: '123 Main Street',
          phone: '+84123456789',
          email: 'hcm@company.com',
          isActive: true,
        },
      },
    },
  })
  findByCompany(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.service.findByCompany(companyId);
  }

  @Get('by-code/:code')
  @ApiOperation({ 
    summary: 'Find branch by code', 
    description: 'Get branch by code and company ID' 
  })
  @ApiParam({ 
    name: 'code', 
    type: String,
    description: 'Branch code', 
    example: 'BR001' 
  })
  @ApiQuery({ 
    name: 'companyId', 
    required: true,
    type: Number,
    description: 'Company ID (integer)', 
    example: 1 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Branch found',
    schema: {
      type: 'object',
      example: {
        id: 1,
        code: 'BR001',
        name: 'Ho Chi Minh Branch',
        address: '123 Main Street',
        phone: '+84123456789',
        email: 'hcm@company.com',
        isActive: true,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  findByCode(
    @Param('code') code: string,
    @Query('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.service.findByCodeAndCompany(code, companyId);
  }
}

