# Hướng dẫn tạo Module với Swagger Documentation

Do có quá nhiều models (27 models), tôi đã tạo các modules quan trọng nhất. Để tạo các modules còn lại, bạn có thể làm theo pattern sau:

## Các modules đã tạo:
- ✅ Company
- ✅ Branch  
- ✅ Customer
- ✅ Campaign
- ✅ Lead
- ✅ Opportunity
- ✅ SalesOrder
- ✅ Case
- ✅ Ticket

## Các modules còn cần tạo:
- Contact
- Product
- Vendor
- Warehouse
- Account
- User
- Role
- Permission
- Document
- Email
- Activity
- Task
- Note

## Cấu trúc module chuẩn:

```
modules/{module-name}/
├── dto/
│   └── {module-name}.dto.ts
├── repositories/
│   └── {module-name}.repository.ts
├── {module-name}.controller.ts
├── {module-name}.service.ts
└── {module-name}.module.ts
```

## Template DTO:

```typescript
import { IsString, IsInt, IsOptional, IsBoolean, IsEmail, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Create{Module}Dto {
  @ApiProperty({ description: '...', example: '...' })
  @IsString()
  @MaxLength(255)
  field: string;
  
  // ... các fields khác
}

export class Update{Module}Dto {
  @ApiPropertyOptional({ description: '...', example: '...' })
  @IsOptional()
  @IsString()
  field?: string;
  
  // ... các fields khác
}
```

## Template Repository:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { {Module} } from '@prisma/client';
import { Create{Module}Dto, Update{Module}Dto } from '../dto/{module-name}.dto';

@Injectable()
export class {Module}Repository extends BaseRepository<
  {Module},
  Create{Module}Dto,
  Update{Module}Dto
> {
  protected get model() {
    return this.prisma.{moduleName};
  }

  protected get include() {
    return {
      // relations
    };
  }

  protected buildSearchClause(search: string): any[] {
    return [
      { name: { contains: search, mode: 'insensitive' } },
      // ... các fields search khác
    ];
  }
}
```

## Template Service:

```typescript
import { Injectable } from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { {Module}Repository } from './repositories/{module-name}.repository';
import { Create{Module}Dto, Update{Module}Dto } from './dto/{module-name}.dto';
import { {Module} } from '@prisma/client';

@Injectable()
export class {Module}Service extends BaseService<
  {Module},
  Create{Module}Dto,
  Update{Module}Dto
> {
  constructor(protected readonly repository: {Module}Repository) {
    super(repository);
  }
}
```

## Template Controller:

```typescript
import { Controller } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BaseController } from '../../common/controllers/base.controller';
import { {Module}Service } from './{module-name}.service';
import { Create{Module}Dto, Update{Module}Dto } from './dto/{module-name}.dto';
import { {Module} } from '@prisma/client';

@ApiTags('{module-name}s')
@ApiBearerAuth('JWT-auth')
@Controller('{module-name}s')
export class {Module}Controller extends BaseController<
  {Module},
  Create{Module}Dto,
  Update{Module}Dto
> {
  constructor(protected readonly service: {Module}Service) {
    super(service);
  }
}
```

## Template Module:

```typescript
import { Module } from '@nestjs/common';
import { {Module}Controller } from './{module-name}.controller';
import { {Module}Service } from './{module-name}.service';
import { {Module}Repository } from './repositories/{module-name}.repository';

@Module({
  controllers: [{Module}Controller],
  providers: [{Module}Service, {Module}Repository],
  exports: [{Module}Service, {Module}Repository],
})
export class {Module}Module {}
```

## Bước tiếp theo:

1. Tạo các files theo template trên
2. Đăng ký module trong `app.module.ts`:
   ```typescript
   import { {Module}Module } from './modules/{module-name}/{module-name}.module';
   
   @Module({
     imports: [
       // ...
       {Module}Module,
     ],
   })
   ```

3. Thêm tag vào Swagger trong `main.ts`:
   ```typescript
   .addTag('{module-name}s', '{Module} management')
   ```

## Lưu ý:

- Tất cả modules kế thừa từ `BaseController` sẽ tự động có CRUD endpoints với Swagger
- Chỉ cần thêm `@ApiTags` và `@ApiBearerAuth` vào controller
- DTOs cần có `@ApiProperty` và `@ApiPropertyOptional` cho Swagger schema
- Custom endpoints cần thêm `@ApiOperation`, `@ApiResponse`, `@ApiParam`, `@ApiQuery`

