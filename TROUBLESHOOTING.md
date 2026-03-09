# Troubleshooting Guide

## Frontend không truy cập được

### 1. Kiểm tra dependencies

```bash
# Từ root directory
npm install

# Hoặc từ apps/web
cd apps/web
npm install
```

### 2. Kiểm tra port

Frontend mặc định chạy trên port **3000**. Nếu port này đã được sử dụng:

- Kiểm tra process đang dùng port 3000:
  ```bash
  # Windows PowerShell
  netstat -ano | findstr :3000
  
  # Hoặc kill process
  Get-Process -Id <PID> | Stop-Process
  ```

- Hoặc đổi port trong `apps/web/vite.config.ts`:
  ```typescript
  server: {
    port: 3001, // Đổi sang port khác
  }
  ```

### 3. Chạy Frontend

**Cách 1: Từ root (khuyến nghị)**
```bash
npm run dev:web
```

**Cách 2: Từ thư mục apps/web**
```bash
cd apps/web
npm run dev
```

### 4. Kiểm tra URL

Sau khi start, Vite sẽ hiển thị URL. Thông thường là:
- Local: `http://localhost:3000`
- Network: `http://192.168.x.x:3000` (nếu dùng host: '0.0.0.0')

### 5. Kiểm tra Console

Mở Developer Tools (F12) và kiểm tra:
- Console tab: Xem có lỗi JavaScript không
- Network tab: Xem có request nào fail không

### 6. Kiểm tra file .env

Tạo file `apps/web/.env`:
```
VITE_API_BASE_URL=http://localhost:3001
```

**Lưu ý**: Vite chỉ load biến môi trường bắt đầu với `VITE_`

### 7. Clear cache và rebuild

```bash
cd apps/web
rm -rf node_modules dist
npm install
npm run dev
```

### 8. Kiểm tra firewall

Nếu không truy cập được từ máy khác, kiểm tra Windows Firewall có chặn port 3000 không.

## Backend không kết nối được

### 1. Kiểm tra Backend đang chạy

Backend phải chạy trên port **3001** (hoặc port bạn đã config)

```bash
npm run dev:api
```

### 2. Kiểm tra CORS

Backend đã được config CORS trong `apps/api/src/main.ts`. Đảm bảo `FRONTEND_URL` trong `.env` đúng.

### 3. Test API trực tiếp

```bash
# Test health check
curl http://localhost:3001

# Test login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## Lỗi thường gặp

### "Cannot find module"
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

### "Port already in use"
- Đổi port trong config
- Hoặc kill process đang dùng port đó

### "EADDRINUSE"
Port đã được sử dụng. Đổi port hoặc kill process.

### "Module not found"
Đảm bảo đã cài đặt dependencies:
```bash
npm install
```

