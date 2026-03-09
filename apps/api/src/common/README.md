# Common Base Classes - Repository & Service Pattern

## Tổng quan

Hệ thống sử dụng **Repository Pattern** và **Generic Base Classes** để tái sử dụng code CRUD cho tất cả các modules.

## Kiến trúc

```
BaseRepository (Generic)
    ↓
[Module]Repository extends BaseRepository
    ↓
BaseService (Generic)
    ↓
[Module]Service extends BaseService
    ↓
BaseController (Generic)
    ↓
[Module]Controller extends BaseController
```

## Cách sử dụng

### 1. Tạo Repository

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { YourEntity } from '@prisma/client';
import { CreateDto, UpdateDto } from '../dto/your.dto';

@Injectable()
export class YourRepository extends BaseRepository<
  YourEntity,
  CreateDto,
  UpdateDto
> {
  protected get model() {
    return this.prisma.yourModel; // Prisma model delegate
  }

  protected get include() {
    return {
      // Define relations to include
      relatedEntity: true,
    };
  }

  protected buildSearchClause(search: string): any[] {
    // Override for custom search
    return [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Custom methods
  async findByCustomField(field: string) {
    return this.model.findMany({
      where: { customField: field },
      include: this.include,
    });
  }
}
```

### 2. Tạo Service

```typescript
import { Injectable } from '@nestjs/common';
import { BaseService } from '../../../common/services/base.service';
import { YourRepository } from './repositories/your.repository';
import { CreateDto, UpdateDto } from './dto/your.dto';
import { YourEntity } from '@prisma/client';

@Injectable()
export class YourService extends BaseService<YourEntity, CreateDto, UpdateDto> {
  constructor(protected readonly repository: YourRepository) {
    super(repository);
  }

  // Override create if needed (e.g., for nested relations)
  async create(createDto: CreateDto) {
    return this.repository.create({
      ...createDto,
      nestedRelation: {
        create: createDto.nestedItems || [],
      },
    } as any);
  }

  // Add custom methods
  async customMethod(param: string) {
    return this.repository.findByCustomField(param);
  }
}
```

### 3. Tạo Controller

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { BaseController } from '../../../common/controllers/base.controller';
import { YourService } from './your.service';
import { CreateDto, UpdateDto } from './dto/your.dto';
import { YourEntity } from '@prisma/client';

@Controller('your-entities')
export class YourController extends BaseController<
  YourEntity,
  CreateDto,
  UpdateDto
> {
  constructor(protected readonly service: YourService) {
    super(service);
  }

  // Add custom endpoints
  @Get('custom')
  customEndpoint(@Query('param') param: string) {
    return this.service.customMethod(param);
  }
}
```

### 4. Đăng ký trong Module

```typescript
import { Module } from '@nestjs/common';
import { YourController } from './your.controller';
import { YourService } from './your.service';
import { YourRepository } from './repositories/your.repository';

@Module({
  controllers: [YourController],
  providers: [YourService, YourRepository],
  exports: [YourService, YourRepository],
})
export class YourModule {}
```

## Base CRUD Endpoints

Tất cả controllers kế thừa từ `BaseController` tự động có các endpoints:

- `POST /your-entities` - Create
- `GET /your-entities` - Find all (với filters)
- `GET /your-entities/count` - Count
- `GET /your-entities/:id` - Find one
- `PATCH /your-entities/:id` - Update
- `DELETE /your-entities/:id` - Remove (soft delete)

## Filters

BaseRepository hỗ trợ các filters mặc định:

```typescript
{
  companyId?: string;
  isActive?: boolean;
  status?: string;
  search?: string; // Tự động search qua buildSearchClause
  skip?: number;
  take?: number;
  orderBy?: any;
  where?: any; // Custom where conditions
}
```

## Override Methods

### Repository

- `buildSearchClause()` - Custom search logic
- `buildWhereClause()` - Custom where logic
- `remove()` - Override nếu cần hard delete

### Service

- `create()` - Override cho nested relations
- `update()` - Override cho custom logic
- `remove()` - Override cho custom delete logic

### Controller

- Thêm custom endpoints bất kỳ

## Best Practices

1. **Repository**: Chỉ chứa database operations
2. **Service**: Business logic, validation, transformations
3. **Controller**: HTTP handling, request/response transformation
4. **DTO**: Validation rules, type safety
