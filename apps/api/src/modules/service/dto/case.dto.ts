import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';

export class CreateCaseDto {
  @IsInt()
  companyId: number;

  @IsInt()
  customerId: number;

  @IsString()
  code: string;

  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsInt()
  assignedTo?: number;

  @IsOptional()
  @IsString()
  resolution?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  customerRating?: number;

  @IsOptional()
  @IsString()
  customerFeedback?: string;
}

export class UpdateCaseDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsInt()
  assignedTo?: number;

  @IsOptional()
  @IsString()
  resolution?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  customerRating?: number;

  @IsOptional()
  @IsString()
  customerFeedback?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
