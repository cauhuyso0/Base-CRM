# Chiến lược ID: Dual ID Pattern (Autoincrement + UUID)

## Phân tích và Quyết định

### ✅ Dùng cả 2: Autoincrement ID + UUID (Dual ID Pattern)

**Lý do:**

- **Autoincrement ID (Int)**: Primary key, dùng cho internal joins, indexes → Performance tốt
- **UUID (String)**: Unique, dùng cho API, external references → Bảo mật, không lộ thông tin

**Ưu điểm:**

- ✅ Performance: Index nhỏ, join nhanh (dùng Int ID)
- ✅ Bảo mật: API expose UUID, không lộ số lượng records
- ✅ Merge data: UUID unique globally, dễ sync giữa databases
- ✅ Best of both worlds: Tận dụng ưu điểm của cả 2

**Tables áp dụng:**

- Company, Branch, User, Role, Permission
- Customer, Contact
- Opportunity, SalesOrder
- Campaign, Lead
- Case, Ticket
- Document, Email
- Activity, Task, Note
- Product, Vendor, Warehouse, Account

**Cấu trúc:**

```prisma
model Customer {
  id          Int      @id @default(autoincrement()) @map("id") // PK cho performance
  uuid        String   @unique @default(uuid()) @map("uuid") // UUID cho API/security
  // ... other fields
}
```

### ✅ Chỉ dùng Autoincrement (Int @id @default(autoincrement()))

**Lý do:**

- Junction tables (chỉ mapping, không có business logic)
- Detail tables nhỏ (chỉ liên quan đến parent, không expose)
- Internal tables, không cần merge data
- Không cần expose ra API

**Tables:**

- UserRole - junction table
- RolePermission - junction table
- OpportunityProduct - detail table của Opportunity
- SalesOrderItem - detail table của SalesOrder
- CampaignTarget - detail table của Campaign

## Cách sử dụng

### Internal (Database/Backend):

- Dùng `id` (Int) cho joins, indexes, foreign keys
- Performance tốt, index nhỏ

### External (API/Public):

- Dùng `uuid` (String) cho API endpoints
- Bảo mật, không lộ thông tin

### Foreign Keys:

- Có thể dùng cả 2:
  - `customerId` (Int) - reference `id` → Performance tốt
  - `customerUuid` (String) - reference `uuid` → Khi cần expose UUID
- Khuyến nghị: Dùng `customerId` (Int) cho FK, query bằng UUID khi cần

## Lưu ý

1. **Index**: Cả `id` và `uuid` đều có index (PK và unique)
2. **API**: Luôn expose UUID, không expose Int ID
3. **FK**: Nên dùng Int ID cho FK để tối ưu performance
4. **Query**: Có thể query bằng UUID, nhưng join vẫn dùng Int ID
