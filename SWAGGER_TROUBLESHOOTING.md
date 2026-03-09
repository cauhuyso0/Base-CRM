# Swagger Troubleshooting

## Không truy cập được http://localhost:3001/api-docs

### 1. Kiểm tra Server đang chạy

```bash
# Kiểm tra port 3001
netstat -ano | findstr :3001

# Hoặc PowerShell
Get-NetTCPConnection -LocalPort 3001
```

Nếu không có process nào, server chưa chạy. Start server:
```bash
npm run dev:api
```

### 2. Kiểm tra Port

API mặc định chạy trên port **3001**. Nếu bạn thấy log:
```
🚀 Application is running on: http://localhost:3001
📚 Swagger documentation: http://localhost:3001/api-docs
```

Thì server đã chạy đúng.

### 3. Kiểm tra Swagger Package

Đảm bảo đã cài đặt:
```bash
cd apps/api
npm install @nestjs/swagger swagger-ui-express
```

### 4. Kiểm tra Console Logs

Khi start server, bạn sẽ thấy:
- `🚀 Application is running on: http://localhost:3001`
- `📚 Swagger documentation: http://localhost:3001/api-docs`

Nếu không thấy, có thể có lỗi khi compile.

### 5. Kiểm tra Browser Console

Mở Developer Tools (F12) và xem có lỗi gì không.

### 6. Thử các URL khác

- http://localhost:3001/api-docs
- http://127.0.0.1:3001/api-docs
- http://localhost:3001/api-docs/ (với dấu / ở cuối)

### 7. Kiểm tra Firewall

Windows Firewall có thể chặn port 3001. Kiểm tra và cho phép nếu cần.

### 8. Restart Server

```bash
# Dừng server (Ctrl+C)
# Sau đó start lại
npm run dev:api
```

### 9. Kiểm tra Port Conflict

Nếu port 3001 đã được sử dụng:
- Đổi port trong `.env`: `PORT=3002`
- Hoặc kill process đang dùng port 3001

### 10. Kiểm tra CORS

Nếu truy cập từ domain khác, có thể bị CORS block. Swagger nên chạy được từ localhost.

## Lỗi thường gặp

### "Cannot GET /api-docs"
- Server chưa start
- Swagger chưa được setup đúng
- Kiểm tra lại `main.ts`

### "404 Not Found"
- URL sai
- Server chạy trên port khác
- Kiểm tra log khi start server

### Trang trắng
- Có lỗi JavaScript
- Mở Console (F12) để xem lỗi
- Kiểm tra network tab

## Test nhanh

1. Start server: `npm run dev:api`
2. Đợi thấy log: `🚀 Application is running on: http://localhost:3001`
3. Mở browser: http://localhost:3001/api-docs
4. Nếu vẫn không được, kiểm tra console logs khi start server

