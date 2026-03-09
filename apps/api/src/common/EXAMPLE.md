# Example: Tạo Module Mới với Base Classes

Ví dụ tạo module **Product** từ đầu đến cuối.

## 1. Tạo DTO

`src/modules/product/dto/product.dto.ts`:

```typescript
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateProductDto {
  @IsString()
  companyId: string;

  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
```

## 2. Tạo Repository

`src/modules/product/repositories/product.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { Product } from '@prisma/client';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';

@Injectable()
export class ProductRepository extends BaseRepository<Product, CreateProductDto, UpdateProductDto> {
  protected get model() {
    return this.prisma.product;
  }

  protected get include() {
    // Không có relations, return undefined hoặc {}
    return undefined;
  }

  protected buildSearchClause(search: string): any[] {
    return [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Custom methods
  async findByCategory(category: string, companyId: string) {
    return this.model.findMany({
      where: {
        category,
        companyId,
        isActive: true,
      },
    });
  }

  async findByPriceRange(minPrice: number, maxPrice: number, companyId: string) {
    return this.model.findMany({
      where: {
        companyId,
        unitPrice: {
          gte: minPrice,
          lte: maxPrice,
        },
        isActive: true,
      },
    });
  }
}
```

## 3. Tạo Service

`src/modules/product/product.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { ProductRepository } from './repositories/product.repository';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { Product } from '@prisma/client';

@Injectable()
export class ProductService extends BaseService<Product, CreateProductDto, UpdateProductDto> {
  constructor(protected readonly repository: ProductRepository) {
    super(repository);
  }

  // Custom methods
  async findByCategory(category: string, companyId: string) {
    return this.repository.findByCategory(category, companyId);
  }

  async findByPriceRange(minPrice: number, maxPrice: number, companyId: string) {
    return this.repository.findByPriceRange(minPrice, maxPrice, companyId);
  }

  // Override create nếu cần custom logic
  async create(createProductDto: CreateProductDto) {
    // Validate duplicate code
    const existing = await this.repository.findOneBy({
      code: createProductDto.code,
      companyId: createProductDto.companyId,
    });

    if (existing) {
      throw new Error('Product code already exists');
    }

    return super.create(createProductDto);
  }
}
```

## 4. Tạo Controller

`src/modules/product/product.controller.ts`:

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { BaseController } from '../../common/controllers/base.controller';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { Product } from '@prisma/client';

@Controller('products')
export class ProductController extends BaseController<Product, CreateProductDto, UpdateProductDto> {
  constructor(protected readonly service: ProductService) {
    super(service);
  }

  // Custom endpoints
  @Get('by-category')
  findByCategory(@Query('category') category: string, @Query('companyId') companyId: string) {
    return this.service.findByCategory(category, companyId);
  }

  @Get('by-price-range')
  findByPriceRange(
    @Query('minPrice') minPrice: string,
    @Query('maxPrice') maxPrice: string,
    @Query('companyId') companyId: string,
  ) {
    return this.service.findByPriceRange(parseFloat(minPrice), parseFloat(maxPrice), companyId);
  }
}
```

## 5. Tạo Module

`src/modules/product/product.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductRepository } from './repositories/product.repository';

@Module({
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
  exports: [ProductService, ProductRepository],
})
export class ProductModule {}
```

## 6. Đăng ký trong AppModule

`src/app.module.ts`:

```typescript
import { ProductModule } from './modules/product/product.module';

@Module({
  imports: [
    // ... other modules
    ProductModule,
  ],
})
export class AppModule {}
```

## Kết quả

Sau khi hoàn thành, bạn tự động có các endpoints:

- `POST /products` - Create product
- `GET /products` - List products (với filters)
- `GET /products/count` - Count products
- `GET /products/:id` - Get product
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `GET /products/by-category` - Custom endpoint
- `GET /products/by-price-range` - Custom endpoint

## Lưu ý

1. **Nested Relations**: Nếu cần create với nested relations, override `create()` method trong Service:

```typescript
async create(createDto: CreateDto) {
  return this.repository.create({
    ...createDto,
    nestedRelation: {
      create: createDto.nestedItems || [],
    },
  } as any);
}
```

2. **Custom Search**: Override `buildSearchClause()` trong Repository để customize search fields.

3. **Soft Delete**: Mặc định `remove()` sẽ soft delete (set `isActive: false`). Override nếu cần hard delete.

