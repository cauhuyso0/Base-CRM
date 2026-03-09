# @base-crm/shared

Shared types and schemas package for Base CRM monorepo.

## Overview

This package contains:
- **Prisma types**: Re-exported from `@prisma/client`
- **API types**: Response types, DTOs, and interfaces
- **Common types**: Shared across frontend and backend

## Usage

### In Frontend (Web)

```typescript
import { DashboardStats, AuthResponse, Customer } from '@base-crm/shared';

// Use types in your components
const stats: DashboardStats = await dashboardApi.getStats();
```

### In Backend (API)

```typescript
import { DashboardStats, Customer, CreateCustomerDto } from '@base-crm/shared';

// Use types in your services/controllers
async getStats(): Promise<DashboardStats> {
  // ...
}
```

## Structure

```
packages/shared/
├── src/
│   ├── types/          # Type definitions
│   │   ├── api.types.ts
│   │   ├── auth.types.ts
│   │   ├── customer.types.ts
│   │   └── dashboard.types.ts
│   ├── dto/            # DTOs (TypeScript interfaces)
│   │   ├── auth.dto.ts
│   │   ├── customer.dto.ts
│   │   └── dashboard.dto.ts
│   └── index.ts        # Main export file
├── package.json
└── tsconfig.json
```

## Building

```bash
# Build the shared package
cd packages/shared
npm run build

# Or from root
npm run build --workspace=@base-crm/shared
```

## Adding New Types

1. Create a new file in `src/types/` or `src/dto/`
2. Export from `src/index.ts`
3. Rebuild the package
4. Use in web/api projects

## Notes

- This package uses TypeScript interfaces (no decorators) for maximum compatibility
- Backend DTOs with decorators remain in `apps/api/src/modules/*/dto/`
- Frontend can use shared types for type safety without decorators

