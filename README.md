# Hệ thống quản lý hồ sơ đi nước ngoài của viên chức Trường Đại học Trà Vinh (TVU)

Hệ thống quản lý quy trình cấp phép và theo dõi viên chức đi nước ngoài (công tác, học tập, việc riêng) tại Trường Đại học Trà Vinh. Đồ án tập trung vào việc số hóa quy trình hành chính, tự động hóa luồng phê duyệt và tích hợp công nghệ AI để hỗ trợ người dùng.

## 🔗 Thông tin Đồ án
- **Tên đồ án:** Xây dựng hệ thống quản lý hồ sơ đi nước ngoài của viên chức Trường Đại học Trà Vinh
- **Sinh viên thực hiện:** Đào Công Hoàng Lam
- **Mã lớp:** DA22TTA
- **Repository:** [GitHub Repo](https://github.com/daolam1734/CN-DA22TTA-DAOCONGHOANGLAM-QuanLyHoSoVienChucDiNuocNgoai.git)

---

## ✨ Tính năng nổi bật

### 1. Quản lý Quy trình Cấp phép Đi nước ngoài
- **Số hóa quy trình:** Chuyển đổi toàn bộ quy trình nộp và duyệt hồ sơ đi nước ngoài từ giấy sang môi trường số.
- **Luồng duyệt đa cấp:** Tự động luân chuyển hồ sơ qua các cấp phê duyệt tại TVU: Đơn vị -> Chi bộ -> Đảng ủy -> Phòng Tổ chức Nhân sự -> Ban Giám hiệu.
- **Tự động hóa thông minh:** Tự động bỏ qua (Auto-skip) các bước duyệt nếu người nộp hồ sơ đồng thời là người có thẩm quyền duyệt ở bước đó.
- **Rút hồ sơ:** Cho phép viên chức rút lại hồ sơ để chỉnh sửa nếu chưa có cấp nào thực hiện phê duyệt.

### 2. Quản lý Thông tin Viên chức & Đảng viên
- **Hồ sơ chuyên sâu:** Quản lý thông tin hộ chiếu, học hàm, học vị và lịch sử các chuyến đi nước ngoài của viên chức.
- **Đồng bộ dữ liệu Đảng:** Tích hợp quản lý thông tin sinh hoạt Đảng (Số thẻ Đảng, đơn vị Đảng) để phục vụ quy trình xét duyệt đối với Đảng viên.

### 3. Trợ lý ảo AI (Chatbot)
- **Tích hợp Google Gemini AI:** Hỗ trợ giải đáp thắc mắc về quy trình, thủ tục và quy định đi nước ngoài.
- **Tư vấn tự động:** Giúp viên chức nhanh chóng tìm kiếm thông tin văn bản, biểu mẫu mà không cần tra cứu thủ công.

### 4. Quản lý Văn bản & Biểu mẫu TVU
- **Kho quy định:** Lưu trữ tập trung các văn bản hướng dẫn, quy định của Nhà nước và quy định riêng của Trường.
- **Biểu mẫu chuẩn:** Cung cấp các mẫu đơn, tờ trình chuẩn để viên chức tải về sử dụng.

### 5. Theo dõi & Báo cáo
- **Thông báo thời gian thực:** Cập nhật trạng thái hồ sơ tức thời.
- **Báo cáo sau chuyến đi:** Quản lý việc nộp báo cáo kết quả và minh chứng sau khi kết thúc chuyến đi.

---

## 🛠️ Công nghệ sử dụng

### Backend
- **Runtime:** Node.js & Express.js
- **Database:** PostgreSQL (Lưu trữ dữ liệu quan hệ, Trigger, Function)
- **AI Integration:** Google Generative AI (Gemini)
- **Auth:** JSON Web Token (JWT) & Bcrypt
- **File Handling:** Multer (Quản lý file hồ sơ và avatar)

### Frontend
- **Framework:** React.js (Vite)
- **State Management:** Context API
- **UI Components:** React Icons
- **Styling:** CSS3 (Custom UI/UX hiện đại)

### DevOps & Tools
- **Containerization:** Docker & Docker Compose
- **Version Control:** Git & GitHub

---

## 🚀 Hướng dẫn Cài đặt & Chạy dự án

### Cách 1: Chạy bằng Docker (Khuyên dùng)
Yêu cầu: Đã cài đặt Docker và Docker Compose.

1. Clone dự án:
   ```bash
   git clone https://github.com/daolam1734/CN-DA22TTA-DAOCONGHOANGLAM-QuanLyHoSoVienChucDiNuocNgoai.git
   cd CN-DA22TTA-DAOCONGHOANGLAM-QuanLyHoSoVienChucDiNuocNgoai
   ```

2. Khởi chạy hệ thống:
   ```bash
   docker-compose up -d
   ```
   - Backend sẽ chạy tại: `http://localhost:3000`
   - Frontend sẽ chạy tại: `http://localhost:80` (hoặc cổng được map trong docker-compose)
   - Database PostgreSQL: `localhost:5432`

### Cách 2: Chạy thủ công (Môi trường phát triển)

#### Yêu cầu:
- Node.js (v18+)
- PostgreSQL (v15+)

#### 1. Cấu hình Database
- Tạo database tên `qlhs_dnn` trong PostgreSQL.
- Chạy các file script SQL trong thư mục `database/` theo thứ tự:
  1. `schema.sql`
  2. `init_basic_data.sql`
  3. Các file trong `migrations/` (nếu có)

#### 2. Cấu hình Backend
```bash
cd backend
npm install
```
- Tạo file `.env` trong thư mục `backend` với nội dung tương tự:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qlhs_dnn
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
```
- Chạy server:
```bash
npm run dev
```

#### 3. Cấu hình Frontend
```bash
cd frontend
npm install
```
- Chạy ứng dụng:
```bash
npm run dev
```
- Truy cập: `http://localhost:5173`

---

## 📂 Cấu trúc thư mục

```
QLHS_DNN_TVU/
├── backend/                # Source code Backend (Node.js)
│   ├── src/
│   │   ├── config/         # Cấu hình DB, Env
│   │   ├── controllers/    # Xử lý logic nghiệp vụ
│   │   ├── middleware/     # Middleware (Auth, Upload)
│   │   ├── routes/         # Định nghĩa API routes
│   │   └── ...
│   └── uploads/            # Thư mục lưu trữ file
├── frontend/               # Source code Frontend (React)
│   ├── src/
│   │   ├── components/     # Các component tái sử dụng
│   │   ├── contexts/       # Global State (Auth, Toast)
│   │   ├── pages/          # Các trang giao diện chính
│   │   └── services/       # Gọi API xuống Backend
│   └── ...
├── database/               # Script SQL khởi tạo & migration
└── docker-compose.yml      # Cấu hình Docker
```

## 📝 Giấy phép
Dự án được phát triển cho mục đích học tập và nghiên cứu tại Trường Đại học Trà Vinh.
