# Frontend - Travel Records Management

Frontend application cho Hệ thống Quản lý Hồ sơ Đi Nước ngoài - Trường Đại Học Trà Vinh

## 🚀 Cài đặt

```bash
# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env

# Cập nhật API URL trong .env
VITE_API_URL=http://localhost:3000/api/v1
```

## 🏃 Chạy ứng dụng

```bash
# Development mode
npm run dev

# Build cho production
npm run build

# Preview production build
npm run preview
```

## 📁 Cấu trúc thư mục

```
frontend/
├── src/
│   ├── assets/           # Static assets (images, fonts)
│   ├── components/       # React components
│   │   ├── common/       # Common/shared components
│   │   ├── layout/       # Layout components
│   │   └── ...
│   ├── contexts/         # React contexts (AuthContext, etc.)
│   ├── pages/            # Page components
│   │   ├── auth/         # Login, Register pages
│   │   ├── dashboard/    # Dashboard page
│   │   ├── users/        # User management pages
│   │   ├── records/      # Record management pages
│   │   └── ...
│   ├── services/         # API services
│   │   ├── api.js        # Axios instance
│   │   ├── auth.js       # Auth API calls
│   │   ├── users.js      # Users API calls
│   │   └── ...
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main App component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
└── package.json
```

## 🎨 Tech Stack

- **React 18**: UI library
- **Vite**: Build tool & dev server
- **React Router**: Routing
- **Axios**: HTTP client
- **Context API**: State management

## 🔌 API Integration

API client được cấu hình trong `src/services/api.js`:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000
});

// Request interceptor để thêm token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 🔐 Authentication Flow

1. User nhập credentials vào Login page
2. API call đến `/api/v1/auth/login`
3. Lưu token vào localStorage
4. Redirect đến Dashboard
5. Các request tiếp theo tự động thêm token vào header

## 📱 Pages

### Public Pages
- `/login` - Đăng nhập
- `/register` - Đăng ký (nếu có)

### Protected Pages
- `/dashboard` - Dashboard tổng quan
- `/users` - Quản lý người dùng
- `/records` - Quản lý hồ sơ
- `/trips` - Quản lý chuyến đi
- `/profile` - Thông tin cá nhân
- `/settings` - Cài đặt

## 🎯 Components

### Layout Components
- `Header`: Header với navigation
- `Sidebar`: Sidebar menu
- `Footer`: Footer
- `Layout`: Main layout wrapper

### Common Components
- `Button`: Button component
- `Input`: Input field
- `Select`: Select dropdown
- `Table`: Data table
- `Modal`: Modal dialog
- `Card`: Card container
- `Loading`: Loading spinner
- `Alert`: Alert/notification

## 🛠️ Development

### Code Style
```bash
# Lint code
npm run lint

# Format code (nếu có prettier)
npm run format
```

### Environment Variables

Tạo file `.env` từ `.env.example`:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_API_TIMEOUT=30000
VITE_APP_NAME=QLHS_DNN_TVU
VITE_APP_TITLE=Quản Lý Hồ Sơ Đi Nước Ngoài - TVU
```

### Hot Reload

Vite tự động hot reload khi có thay đổi code trong development mode.

## 📦 Build & Deploy

```bash
# Build cho production
npm run build

# Output sẽ ở thư mục dist/
# Deploy các file trong dist/ lên web server
```

### Nginx Configuration (Example)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
    }
}
```

## 🐛 Troubleshooting

### CORS issues
Đảm bảo backend đã cấu hình CORS cho phép frontend URL:
```javascript
// Backend: src/app.js
app.use(cors({
  origin: 'http://localhost:5173'
}));
```

### API connection failed
1. Kiểm tra backend đã chạy chưa
2. Kiểm tra VITE_API_URL trong .env
3. Kiểm tra network tab trong browser DevTools

### Build errors
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

## 📝 License

ISC
