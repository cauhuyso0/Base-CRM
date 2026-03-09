# Dual ID Pattern: Autoincrement + UUID

## Tổng quan

Hệ thống sử dụng **Dual ID Pattern** - kết hợp cả autoincrement ID và UUID để tận dụng ưu điểm của cả 2:

- **`id` (Int, autoincrement)**: Primary key, dùng cho internal joins, indexes → **Performance tốt**
- **`uuid` (String, UUID v4)**: Unique, dùng cho API, external references → **Bảo mật, không lộ thông tin**

## Cấu trúc

```prisma
model Customer {
  id          Int      @id @default(autoincrement()) @map("id") // PK cho performance
  uuid        String   @unique @default(uuid()) @map("uuid") // UUID cho API/security
  companyId   Int      @map("company_id") // FK reference id (Int)
  // ... other fields
  @@index([uuid]) // Index cho UUID để query nhanh
}
```

## UUID Version

Prisma `@default(uuid())` generate **UUID v4** (random UUID).

Nếu cần UUID v7 (time-ordered), có thể:
1. Generate ở application layer
2. Dùng custom function trong Prisma

## Cách sử dụng

### Internal (Database/Backend):
```typescript
// Dùng Int ID cho joins, indexes
const customer = await prisma.customer.findUnique({
  where: { id: 123 }
});

// Join với FK
const orders = await prisma.salesOrder.findMany({
  where: { customerId: customer.id } // Int
});
```

### External (API/Public):
```typescript
// Expose UUID, không expose Int ID
@Get(':uuid')
async findOne(@Param('uuid') uuid: string) {
  return this.service.findByUuid(uuid);
}

// Query bằng UUID
const customer = await prisma.customer.findUnique({
  where: { uuid: 'xxx-xxx-xxx' }
});
```

### Foreign Keys:
- **FK dùng Int ID** (reference `id`) → Performance tốt
- **Polymorphic references** (entityId) → Có thể dùng UUID vì reference đến UUID của entities khác

## Tables áp dụng Dual ID

✅ **Core entities** (có cả id + uuid):
- Company, Branch, User, Role, Permission
- Customer, Contact
- Opportunity, SalesOrder
- Campaign, Lead
- Case, Ticket
- Document, Email
- Activity, Task, Note
- Product, Vendor, Warehouse, Account

✅ **Junction/Detail tables** (chỉ có id):
- UserRole, RolePermission
- OpportunityProduct, SalesOrderItem
- CampaignTarget

## Lợi ích

1. **Performance**: Index nhỏ hơn, join nhanh hơn (dùng Int)
2. **Bảo mật**: API expose UUID, không lộ số lượng records
3. **Merge data**: UUID unique globally, dễ sync giữa databases
4. **Best of both worlds**: Tận dụng ưu điểm của cả 2

## Migration Notes

Khi migrate từ UUID-only sang Dual ID:
1. Thêm column `id` (Int, autoincrement)
2. Thêm column `uuid` (String, unique) - giữ UUID cũ
3. Update FK từ String sang Int
4. Thêm index cho `uuid`

