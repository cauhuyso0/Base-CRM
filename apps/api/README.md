# Base CRM API

Backend API cho Base CRM được xây dựng với NestJS.

## Cài đặt

```bash
npm install
```

## Development

```bash
npm run start:dev
```

API sẽ chạy trên `http://localhost:3001`

## Swagger Documentation

Sau khi start server, truy cập Swagger UI tại:
- **http://localhost:3001/api-docs**

Swagger UI cho phép bạn:
- Xem tất cả các API endpoints
- Test API trực tiếp từ browser
- Xem request/response schemas
- Authenticate với JWT token

### Sử dụng Swagger

1. Mở http://localhost:3001/api-docs
2. Click vào endpoint bạn muốn test
3. Click "Try it out"
4. Điền thông tin cần thiết
5. Click "Execute" để gửi request

### Authentication trong Swagger

1. Đăng nhập qua endpoint `/auth/login` để lấy JWT token
2. Copy token từ response
3. Click nút "Authorize" ở góc trên bên phải
4. Paste token vào ô "Value" (không cần "Bearer" prefix)
5. Click "Authorize" và "Close"
6. Bây giờ bạn có thể test các protected endpoints

## Environment Variables

Tạo file `.env`:

```
DATABASE_URL=mysql://user:password@localhost:3306/base_crm
JWT_SECRET=your-secret-key
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# View database
npx prisma studio
```

## Build

```bash
npm run build
npm run start:prod
```
