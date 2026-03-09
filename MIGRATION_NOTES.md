# Migration Notes - Snake Case & isDeleted Field

## Thay đổi Schema

### 1. Tất cả columns đã được map sang snake_case

Ví dụ:
- `companyId` → `company_id`
- `createdAt` → `created_at`
- `isActive` → `is_active`
- `lastLoginAt` → `last_login_at`

### 2. Tất cả tables đã có @@map với snake_case

Ví dụ:
- `Company` → `companies`
- `UserRole` → `user_roles`
- `SalesOrder` → `sales_orders`

### 3. Tất cả models đã có field `isDeleted`

```prisma
isDeleted   Boolean  @default(false) @map("is_deleted")
```

## Thay đổi BaseRepository

### Soft Delete Behavior

- **Mặc định**: Tất cả queries tự động exclude records có `isDeleted = true`
- **remove()**: Set `isDeleted = true` thay vì `isActive = false`

### Filter Options

```typescript
// Mặc định: exclude deleted records
findAll({ companyId: 'xxx' }) 
// WHERE company_id = 'xxx' AND is_deleted = false

// Include deleted records
findAll({ companyId: 'xxx', includeDeleted: true })
// WHERE company_id = 'xxx'

// Chỉ lấy deleted records
findAll({ companyId: 'xxx', isDeleted: true })
// WHERE company_id = 'xxx' AND is_deleted = true
```

## Migration Steps

### 1. Generate Prisma Client

```bash
npx prisma generate
```

### 2. Tạo Migration

```bash
npx prisma migrate dev --name add_is_deleted_and_snake_case
```

### 3. Nếu cần migrate data hiện có

Nếu database đã có data, bạn có thể cần migration script để:
- Set `is_deleted = false` cho tất cả records hiện có
- Convert column names từ camelCase sang snake_case (nếu đã có data)

### 4. Update Code

Sau khi generate Prisma client, tất cả TypeScript types sẽ tự động update theo schema mới.

## Breaking Changes

⚠️ **Lưu ý**: Nếu bạn đã có code sử dụng trực tiếp Prisma queries, cần update:

1. **Column names**: Từ camelCase sang snake_case trong raw queries
2. **Soft delete**: Code cũ dùng `isActive = false` cần đổi sang `isDeleted = true`
3. **Queries**: Mặc định sẽ exclude deleted records, cần thêm `includeDeleted: true` nếu muốn include

## Example

### Before
```typescript
await prisma.customer.findMany({
  where: {
    companyId: 'xxx',
    isActive: true,
  },
});
```

### After
```typescript
// Mặc định exclude deleted
await prisma.customer.findMany({
  where: {
    companyId: 'xxx',
    isActive: true,
    // isDeleted: false được tự động thêm bởi BaseRepository
  },
});

// Hoặc dùng BaseRepository (recommended)
await customerRepository.findAll({
  companyId: 'xxx',
  isActive: true,
});
```

