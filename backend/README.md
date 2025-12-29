# Backend - Travel Records Management API

Backend API cho Hệ thống Quản lý Hồ sơ Đi Nước ngoài - Trường Đại Học Trà Vinh

## 🚀 Cài đặt

```bash
# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env

# Cập nhật thông tin database và các cấu hình khác trong .env
```

## 📝 Cấu hình Database

1. Tạo database PostgreSQL:
```sql
CREATE DATABASE ql_hoso_dinuocngoai_tvu;
```

2. Import schema:
```bash
psql -U postgres -d ql_hoso_dinuocngoai_tvu -f ../database/schema.sql
```

## 🏃 Chạy ứng dụng

```bash
# Development mode (với nodemon)
npm run dev

# Production mode
npm start
```

## 📁 Cấu trúc thư mục

```
backend/
├── src/
│   ├── config/           # Cấu hình (database, auth)
│   ├── controllers/      # Controllers xử lý logic
│   ├── middleware/       # Middleware (auth, rate limit)
│   ├── models/           # Models database
│   ├── routes/           # API routes
│   ├── utils/            # Utilities (jwt, password)
│   ├── app.js            # Express app setup
│   └── server.js         # Server entry point
├── scripts/
│   ├── admin/            # Quản lý admin
│   ├── database/         # Database utilities
│   ├── test/             # Test scripts
│   ├── cleanup-uploads.js
│   └── ...
├── uploads/              # File uploads
├── logs/                 # Application logs
└── .env                  # Environment variables
```

## 🛠️ Scripts hữu ích

### Admin Management
```bash
# Tạo tài khoản admin
node scripts/admin/add_admin.js

# Kiểm tra admin user
node scripts/admin/check_admin_user.js

# Reset mật khẩu admin
node scripts/admin/reset_admin_password.js

# Cập nhật mật khẩu admin
node scripts/admin/update_admin_password.js

# Cập nhật vai trò admin
node scripts/admin/update_admin_role.js
```

### Database Management
```bash
# Kiểm tra schema
node scripts/database/check_schema.js

# Kiểm tra cấu trúc đơn vị
node scripts/database/check_don_vi_structure.js

# Kiểm tra cấu trúc viên chức
node scripts/database/check_vien_chuc_structure.js

# Fix data issues
node scripts/database/fix_all_data.js

# Insert sample data
node scripts/database/insert_sample_data.js
node scripts/database/insert_sample_users.js
node scripts/database/insert_sample_vien_chuc.js
```

### Testing
```bash
# Test database connection
node scripts/test/test_db_connection.js

# Test authentication
node scripts/test/test_auth.js

# Test API endpoints
node scripts/test/test_api.js

# Test login
node scripts/test/test_login.js
```

### Maintenance
```bash
# Cleanup orphaned files
node scripts/cleanup-uploads.js
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/register` - Đăng ký
- `POST /api/v1/auth/logout` - Đăng xuất
- `POST /api/v1/auth/refresh` - Refresh token

### Users
- `GET /api/v1/users` - Danh sách người dùng
- `GET /api/v1/users/:id` - Chi tiết người dùng
- `POST /api/v1/users` - Tạo người dùng mới
- `PUT /api/v1/users/:id` - Cập nhật người dùng
- `DELETE /api/v1/users/:id` - Xóa người dùng

### Roles & Permissions
- `GET /api/v1/roles` - Danh sách vai trò
- `GET /api/v1/permissions` - Danh sách quyền
- `POST /api/v1/user-roles` - Gán vai trò cho người dùng
- `POST /api/v1/role-permissions` - Gán quyền cho vai trò

### Records (Hồ sơ)
- `GET /api/v1/records` - Danh sách hồ sơ
- `GET /api/v1/records/:id` - Chi tiết hồ sơ
- `POST /api/v1/records` - Tạo hồ sơ mới
- `PUT /api/v1/records/:id` - Cập nhật hồ sơ
- `DELETE /api/v1/records/:id` - Xóa hồ sơ

### Trips (Chuyến đi)
- `GET /api/v1/trips` - Danh sách chuyến đi
- `GET /api/v1/trips/:id` - Chi tiết chuyến đi
- `POST /api/v1/trips` - Tạo chuyến đi mới
- `PUT /api/v1/trips/:id` - Cập nhật chuyến đi

### Dashboard
- `GET /api/v1/dashboard/stats` - Thống kê tổng quan

Xem chi tiết tại file `openapi-spec.yaml`

## 🔐 Authentication & Authorization

Hệ thống sử dụng JWT (JSON Web Tokens) cho authentication:

1. Client gửi credentials đến `/api/v1/auth/login`
2. Server xác thực và trả về access token & refresh token
3. Client sử dụng access token trong header `Authorization: Bearer <token>`
4. Khi access token hết hạn, sử dụng refresh token để lấy token mới

## 📊 Database Models

- **User**: Người dùng hệ thống
- **VienChuc**: Viên chức
- **DonVi**: Đơn vị
- **HoSoDiNuocNgoai**: Hồ sơ đi nước ngoài
- **ChuyenDi**: Chuyến đi
- **TaiLieu**: Tài liệu đính kèm
- **Role**: Vai trò
- **Permission**: Quyền
- **LoginHistory**: Lịch sử đăng nhập

## 🛡️ Security Features

- Password hashing với bcrypt (12 rounds)
- JWT authentication
- Rate limiting
- CORS protection
- Helmet.js security headers
- SQL injection prevention
- File upload validation

## 📦 Dependencies chính

- **express**: Web framework
- **pg**: PostgreSQL client
- **jsonwebtoken**: JWT implementation
- **bcryptjs**: Password hashing
- **multer**: File upload handling
- **helmet**: Security headers
- **cors**: CORS middleware
- **dotenv**: Environment variables

## 🐛 Troubleshooting

### Database connection issues
```bash
# Kiểm tra kết nối database
node scripts/test/test_db_connection.js
```

### Authentication issues
```bash
# Test authentication flow
node scripts/test/test_auth.js
```

### Port already in use
```bash
# Thay đổi PORT trong file .env
PORT=3001
```

## 📝 License

ISC
