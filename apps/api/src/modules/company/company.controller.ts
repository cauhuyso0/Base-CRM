import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BaseController } from '../../common/controllers/base.controller';
import { CompanyService } from './company.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { Company } from '@prisma/client';

@ApiTags('companies')
@ApiBearerAuth('JWT-auth')
@Controller('companies')
export class CompanyController extends BaseController<
  Company,
  CreateCompanyDto,
  UpdateCompanyDto
> {
  constructor(protected readonly service: CompanyService) {
    super(service);
  }

  @Get('by-code/:code')
  @ApiOperation({
    summary: 'Find company by code',
    description: 'Get company by unique code',
  })
  @ApiParam({
    name: 'code',
    description: 'Company code',
    example: 'COMP001',
  })
  @ApiResponse({
    status: 200,
    description: 'Company found',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        uuid: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        code: { type: 'string', example: 'COMP001' },
        name: { type: 'string', example: 'ABC Corporation' },
        taxCode: { type: 'string', example: '1234567890' },
        address: { type: 'string', example: '123 Main Street' },
        phone: { type: 'string', example: '+84123456789' },
        email: { type: 'string', example: 'contact@abccorp.com' },
        website: { type: 'string', example: 'https://www.abccorp.com' },
        logo: { type: 'string', example: 'https://www.abccorp.com/logo.png' },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async findByCode(@Request() req: any, @Param('code') code: string) {
    const company = await this.service.findByCode(code);
    this.ensureCompanyAccess(req, company.id);
    return company;
  }

  @Get('by-uuid/:uuid')
  @ApiOperation({
    summary: 'Find company by UUID',
    description: 'Get company by UUID',
  })
  @ApiParam({
    name: 'uuid',
    description: 'Company UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Company found',
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async findByUuid(@Request() req: any, @Param('uuid') uuid: string) {
    const company = await this.service.findByUuid(uuid);
    this.ensureCompanyAccess(req, company.id);
    return company;
  }

  @Get('active')
  @ApiOperation({
    summary: 'Get all active companies',
    description: 'Retrieve all active (non-deleted) companies',
  })
  @ApiResponse({
    status: 200,
    description: 'List of active companies',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          code: { type: 'string' },
          name: { type: 'string' },
          isActive: { type: 'boolean' },
        },
      },
    },
  })
  async findActive(@Request() req: any) {
    if (req.user?.isSuperAdmin) {
      return this.service.findActive();
    }
    const ownCompany = await this.service.findOne(req.user.companyId);
    return ownCompany.isActive ? [ownCompany] : [];
  }

  private ensureCompanyAccess(req: any, companyId: number) {
    if (req.user?.isSuperAdmin) {
      return;
    }
    if (Number(req.user?.companyId) !== Number(companyId)) {
      throw new ForbiddenException('Cross-company access denied');
    }
  }
}
