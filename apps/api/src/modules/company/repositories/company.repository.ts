import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { Company } from '@prisma/client';
import { CreateCompanyDto, UpdateCompanyDto } from '../dto/company.dto';

@Injectable()
export class CompanyRepository extends BaseRepository<
  Company,
  CreateCompanyDto,
  UpdateCompanyDto
> {
  protected get model() {
    return this.prisma.company;
  }

  protected get include() {
    return {
      branches: true,
      users: false, // Exclude users for performance
      customers: false,
      vendors: false,
      products: false,
    };
  }

  protected buildSearchClause(search: string): any[] {
    return [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { taxCode: { contains: search, mode: 'insensitive' } },
    ];
  }

  async findByCode(code: string): Promise<Company | null> {
    return this.model.findFirst({
      where: {
        code,
        isDeleted: false,
      },
      include: this.include,
    });
  }

  async findByUuid(uuid: string): Promise<Company | null> {
    return this.model.findFirst({
      where: {
        uuid,
        isDeleted: false,
      },
      include: this.include,
    });
  }

  async findActive(): Promise<Company[]> {
    return this.model.findMany({
      where: {
        isActive: true,
        isDeleted: false,
      },
      include: this.include,
      orderBy: {
        name: 'asc',
      },
    });
  }
}
