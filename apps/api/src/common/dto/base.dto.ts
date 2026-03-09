import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class BaseCreateDto {
  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class BaseUpdateDto {
  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class BaseFilterDto {
  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  skip?: number;

  @IsOptional()
  take?: number;

  @IsOptional()
  orderBy?: string;
}
