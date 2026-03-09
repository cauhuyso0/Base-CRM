# Base CRM - Monorepo

Monorepo chứa Backend API (NestJS) và Frontend Web (React + Tailwind CSS) cho hệ thống CRM.

## Cấu trúc dự án

```
base_crm/
├── apps/
│   ├── api/          # Backend NestJS API
│   └── web/          # Frontend React + Tailwind CSS
├── packages/
│   └── shared/       # Shared code (types, utils)
└── package.json      # Root package với npm workspaces
```

## Yêu cầu

- Node.js >= 18.0.0
- npm >= 9.0.0

## Cài đặt

```bash
# Cài đặt dependencies cho tất cả workspaces
npm install
```

## Development

### Chạy cả Backend và Frontend

```bash
npm run dev
```

### Chạy riêng từng service

```bash
# Backend API (port 3001)
npm run dev:api

# Frontend Web (port 3000)
npm run dev:web
```

## Build

```bash
# Build tất cả
npm run build

# Build riêng
npm run build:api
npm run build:web
```

## Docker

```bash
# Build và chạy với docker-compose
docker-compose up -d
```

## Workspaces

Dự án sử dụng npm workspaces để quản lý monorepo:

- `apps/api` - Backend NestJS
- `apps/web` - Frontend React
- `packages/shared` - Shared code (tùy chọn)

## API Endpoints

Backend API chạy trên port 3001 (development) hoặc 3000 (production).

### Authentication
- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký
- `GET /auth/profile` - Lấy thông tin user

### Customers
- `GET /customers` - Danh sách customers
- `POST /customers` - Tạo customer
- `GET /customers/:id` - Chi tiết customer
- `PATCH /customers/:id` - Cập nhật customer
- `DELETE /customers/:id` - Xóa customer

### Marketing
- `GET /campaigns` - Danh sách campaigns
- `GET /leads` - Danh sách leads

### Sales
- `GET /opportunities` - Danh sách opportunities
- `GET /sales-orders` - Danh sách sales orders

### Service
- `GET /cases` - Danh sách cases
- `GET /tickets` - Danh sách tickets

## Environment Variables

### Backend (apps/api)
Tạo file `.env` trong `apps/api/`:
```
DATABASE_URL=mysql://user:password@localhost:3306/base_crm
JWT_SECRET=your-secret-key
```

### Frontend (apps/web)
Tạo file `.env` trong `apps/web/`:
```
VITE_API_BASE_URL=http://localhost:3001
```

## License

UNLICENSED
