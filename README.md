# Hệ Thống Quản Lý Hồ Sơ Đi Nước Ngoài - Trường Đại Học Trà Vinh (TVU)

Hệ thống quản lý quy trình cấp phép và theo dõi viên chức đi nước ngoài (công tác, học tập, việc riêng) tại Trường Đại học Trà Vinh.

## 🔗 Thông tin Đồ án
- **Tên đồ án:** Quản lý Hồ sơ Viên chức đi nước ngoài
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

### 3. Quản lý Văn bản & Biểu mẫu TVU
- **Kho quy định:** Lưu trữ tập trung các văn bản hướng dẫn, quy định của Nhà nước và quy định riêng của Trường về việc đi nước ngoài.
- **Biểu mẫu chuẩn:** Cung cấp các mẫu đơn, tờ trình chuẩn theo quy định của Nhà học để viên chức tải về và sử dụng.

### 4. Theo dõi & Báo cáo sau chuyến đi
- **Thông báo thời gian thực:** Cập nhật trạng thái hồ sơ tức thời qua hệ thống thông báo.
- **Hậu kiểm:** Quản lý việc nộp báo cáo kết quả và các minh chứng liên quan sau khi viên chức kết thúc chuyến đi nước ngoài.

---

## 🛠️ Công nghệ sử dụng

### Backend
- **Runtime:** Node.js & Express.js
- **Database:** PostgreSQL (Lưu trữ dữ liệu quan hệ, Trigger, Function)
- **Auth:** JSON Web Token (JWT) & Bcrypt
- **File Handling:** Multer (Quản lý file hồ sơ và avatar)

### Frontend
- **Library:** React.js (Vite)
- **State Management:** Context API
- **Icons:** React Icons (Material Design)
- **Styling:** CSS3 (Custom UI/UX theo phong cách hiện đại)

---

## 📦 Hướng dẫn Cài đặt

### 1. Yêu cầu hệ thống
- Node.js (v18+)
- PostgreSQL (v13+)
- Git

### 2. Cài đặt Backend
```bash
cd backend
npm install
# Cấu hình file .env (DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET)
npm start
```

### 3. Cài đặt Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Khởi tạo Database
- Chạy các script trong thư mục `database/schema.sql` và `database/init_basic_data.sql` để tạo cấu trúc và dữ liệu mẫu.

---

## 📁 Cấu trúc thư mục chính
- `backend/src/controllers`: Xử lý logic nghiệp vụ (Hồ sơ, Người dùng, Quy trình).
- `backend/src/routes`: Định nghĩa các API endpoints.
- `frontend/src/pages`: Các màn hình giao diện chính.
- `frontend/src/services`: Gọi API từ Backend.
- `database/`: Chứa các script SQL khởi tạo hệ thống.

---

## 📝 Giấy phép
Dự án được phát triển cho mục đích học tập và nghiên cứu tại Trường Đại học Trà Vinh.
