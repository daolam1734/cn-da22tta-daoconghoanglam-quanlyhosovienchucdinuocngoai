-- ============================================
-- A. NHÓM NỀN TẢNG - NHÂN SỰ
-- ============================================

CREATE TABLE DonVi (
    ma_don_vi VARCHAR(20) PRIMARY KEY,
    ten_don_vi VARCHAR(200) NOT NULL,
    ma_don_vi_cha VARCHAR(20) REFERENCES DonVi (ma_don_vi),
    cap_don_vi INTEGER NOT NULL CHECK (cap_don_vi BETWEEN 1 AND 3), -- 1:Trường, 2:Khoa, 3:Bộ môn
    trang_thai VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE DonViDang (
    ma_don_vi_dang VARCHAR(20) PRIMARY KEY,
    ten_don_vi_dang VARCHAR(200) NOT NULL,
    cap_do VARCHAR(20) NOT NULL CHECK (
        cap_do IN (
            'DANG_UY_TRUONG',
            'CHI_BO',
            'DANG_UY_KHOI'
        )
    ),
    ma_don_vi VARCHAR(20) REFERENCES DonVi (ma_don_vi),
    trang_thai VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE VienChuc (
    ma_vien_chuc VARCHAR(20) PRIMARY KEY,
    ho_ten VARCHAR(100) NOT NULL,
    ngay_sinh DATE CHECK (ngay_sinh < CURRENT_DATE AND ngay_sinh > '1940-01-01'),
    gioi_tinh VARCHAR(10) CHECK (gioi_tinh IN ('NAM', 'NU', 'KHAC')),

-- Thông tin công tác
ma_don_vi VARCHAR(20) NOT NULL REFERENCES DonVi (ma_don_vi),
chuc_vu VARCHAR(100),

-- Thông tin cá nhân
cccd VARCHAR(20) UNIQUE CHECK (cccd ~ '^[0-9]{9,12}$'),
so_ho_chieu VARCHAR(20),
ngay_cap_ho_chieu DATE,
ngay_het_han_ho_chieu DATE,

-- Học hàm học vị
hoc_ham VARCHAR(50), hoc_vi VARCHAR(50), chuyen_nganh VARCHAR(100),

-- Liên hệ
email VARCHAR(100) UNIQUE CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
),
so_dien_thoai VARCHAR(15) UNIQUE,

-- Trạng thái

trang_thai VARCHAR(20) NOT NULL DEFAULT 'DANG_LAM_VIEC' 
        CHECK (trang_thai IN ('DANG_LAM_VIEC', 'NGHI_HUU', 'THOI_VIEC', 'CHUYEN_CONG_TAC')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE DangVien (
    ma_vien_chuc VARCHAR(20) PRIMARY KEY REFERENCES VienChuc (ma_vien_chuc),
    ma_don_vi_dang VARCHAR(20) NOT NULL REFERENCES DonViDang (ma_don_vi_dang),
    ngay_vao_dang DATE NOT NULL CHECK (ngay_vao_dang < CURRENT_DATE),
    ngay_chinh_thuc DATE CHECK (
        ngay_chinh_thuc >= ngay_vao_dang
        OR ngay_chinh_thuc IS NULL
    ),
    so_the_dang VARCHAR(20) UNIQUE,
    chuc_vu_dang VARCHAR(100),
    chuc_vu_doan_the VARCHAR(100),
    trang_thai VARCHAR(20) NOT NULL DEFAULT 'DANG_HOAT_DONG' CHECK (
        trang_thai IN (
            'DANG_HOAT_DONG',
            'CHUYEN_SINH_HOAT',
            'THOI_SINH_HOAT',
            'KHAI_TRU'
        )
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- B. NHÓM DANH MỤC
-- ============================================

CREATE TABLE LoaiChuyenDi (
    ma_loai VARCHAR(20) PRIMARY KEY,
    ten_loai VARCHAR(100) NOT NULL,
    yeu_cau_duyet_dang BOOLEAN NOT NULL DEFAULT TRUE,
    thu_tu INTEGER DEFAULT 0,
    trang_thai BOOLEAN DEFAULT TRUE
);

-- Insert mẫu dữ liệu
INSERT INTO
    LoaiChuyenDi (
        ma_loai,
        ten_loai,
        yeu_cau_duyet_dang
    )
VALUES ('CONG_TAC', 'Công tác', TRUE),
    (
        'HOI_THAO',
        'Hội thảo/Học tập',
        TRUE
    ),
    (
        'VIEC_RIENG',
        'Việc riêng',
        TRUE
    ),
    (
        'KHAM_BENH',
        'Khám chữa bệnh',
        TRUE
    ),
    (
        'THAM_QUAN',
        'Tham quan du lịch',
        TRUE
    ),
    (
        'THAM_THAN',
        'Thăm thân nhân',
        TRUE
    );

-- Deprecated: MucDichChuyenDi removed

CREATE TABLE QuocGia (
    ma_quoc_gia VARCHAR(10) PRIMARY KEY,
    ten_quoc_gia VARCHAR(100) NOT NULL,
    ten_day_du VARCHAR(200),
    trang_thai BOOLEAN DEFAULT TRUE
);

CREATE TABLE TrangThaiHoSo (
    ma_trang_thai VARCHAR(20) PRIMARY KEY,
    ten_trang_thai VARCHAR(100) NOT NULL,
    thu_tu INTEGER DEFAULT 0,
    nhom_trang_thai VARCHAR(20) CHECK (
        nhom_trang_thai IN (
            'DRAFT',
            'PENDING',
            'PROCESSING',
            'COMPLETED',
            'CANCELLED'
        )
    ),
    trang_thai BOOLEAN DEFAULT TRUE
);

INSERT INTO
    TrangThaiHoSo (
        ma_trang_thai,
        ten_trang_thai,
        nhom_trang_thai,
        thu_tu
    )
VALUES ('DRAFT', 'Nháp', 'DRAFT', 0),
    (
        'CHO_DON_VI',
        'Chờ đơn vị cho ý kiến',
        'PENDING',
        1
    ),
    (
        'CHO_CHI_BO',
        'Chờ Chi bộ xem xét',
        'PROCESSING',
        2
    ),
    (
        'CHO_DANG_UY',
        'Chờ Đảng ủy quyết định',
        'PROCESSING',
        3
    ),
    (
        'CHO_TCNS',
        'Chờ Phòng TCNS cho ý kiến',
        'PROCESSING',
        4
    ),
    (
        'CHO_BGH',
        'Chờ BGH ra quyết định',
        'PROCESSING',
        5
    ),
    (
        'DA_DUYET',
        'Đã phê duyệt (BGH ký)',
        'COMPLETED',
        6
    ),
    (
        'TU_CHOI',
        'Từ chối',
        'COMPLETED',
        7
    ),
    (
        'YEU_CAU_BO_SUNG',
        'Yêu cầu bổ sung',
        'PROCESSING',
        8
    ),
    (
        'DA_HUY',
        'Đã hủy',
        'CANCELLED',
        9
    );

-- ============================================
-- C. NHÓM NGƯỜI DÙNG - PHÂN QUYỀN
-- ============================================

CREATE TABLE NguoiDung (
    id SERIAL PRIMARY KEY,
    ma_vien_chuc VARCHAR(20) UNIQUE REFERENCES VienChuc(ma_vien_chuc) ON DELETE CASCADE,
    ten_dang_nhap VARCHAR(50) UNIQUE NOT NULL,
    mat_khau_hash VARCHAR(255) NOT NULL, -- bcrypt/argon2
    email VARCHAR(100) UNIQUE,
    avatar_url VARCHAR(500),

-- Trạng thái

trang_thai VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (trang_thai IN ('ACTIVE', 'INACTIVE', 'LOCKED', 'DELETED')),
    
    last_login TIMESTAMP,
    refresh_token VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE VaiTro (
    ma_vai_tro VARCHAR(20) PRIMARY KEY,
    ten_vai_tro VARCHAR(100) NOT NULL,
    mo_ta TEXT,
    trang_thai BOOLEAN DEFAULT TRUE
);

INSERT INTO
    VaiTro (ma_vai_tro, ten_vai_tro, mo_ta)
VALUES (
        'ADMIN',
        'Quản trị hệ thống',
        'Toàn quyền quản trị'
    ),
    (
        'VIEN_CHUC',
        'Viên chức',
        'Người nộp hồ sơ'
    ),
    (
        'TRUONG_DON_VI',
        'Trưởng đơn vị',
        'Duyệt cấp đơn vị'
    ),
    (
        'CHI_BO',
        'Chi bộ',
        'Duyệt cấp Chi bộ (cho Đảng viên)'
    ),
    (
        'DANG_UY',
        'Đảng ủy',
        'Duyệt cấp Đảng ủy (cho Đảng viên)'
    ),
    (
        'TCNS',
        'Phòng Tổ chức Nhân sự',
        'Thẩm định hồ sơ'
    ),
    (
        'BGH',
        'Ban Giám hiệu',
        'Phê duyệt cuối cùng'
    );

CREATE TABLE NguoiDungVaiTro (
    nguoi_dung_id INTEGER REFERENCES NguoiDung (id) ON DELETE CASCADE,
    ma_vai_tro VARCHAR(20) REFERENCES VaiTro (ma_vai_tro),
    PRIMARY KEY (nguoi_dung_id, ma_vai_tro)
);

-- ============================================
-- D. NHÓM HỒ SƠ ĐI NƯỚC NGOÀI
-- ============================================

CREATE TABLE HoSoDiNuocNgoai (
    -- Mã hồ sơ tự động: HSNN-YYYYMM-XXXX
    ma_ho_so VARCHAR(30) PRIMARY KEY,

-- Thông tin người đi
ma_vien_chuc VARCHAR(20) NOT NULL REFERENCES VienChuc (ma_vien_chuc),

-- Thông tin chuyến đi
ma_loai_chuyen_di VARCHAR(20) NOT NULL REFERENCES LoaiChuyenDi (ma_loai),
ma_quoc_gia VARCHAR(10) NOT NULL REFERENCES QuocGia (ma_quoc_gia),

-- Thời gian
tu_ngay DATE NOT NULL, den_ngay DATE NOT NULL,

-- Địa điểm, mục đích
dia_diem_cu_the VARCHAR(200), noi_dung_cong_viec TEXT NOT NULL,

-- Kinh phí
nguon_kinh_phi VARCHAR(50) NOT NULL CHECK (
    nguon_kinh_phi IN (
        'TU_TUC',
        'TAI_TRO',
        'NGAN_SACH',
        'DU_AN',
        'KHAC'
    )
),
kinh_phi DECIMAL(15, 2) CHECK (
    kinh_phi >= 0
    OR kinh_phi IS NULL
),

-- Thông tin bổ sung
nguoi_tham_gia TEXT, to_chuc_lien_he VARCHAR(200),

-- Theo dõi số lần bổ sung
so_lan_bo_sung INTEGER DEFAULT 0 CHECK (so_lan_bo_sung >= 0),

-- Duyệt đảng (chỉ cần khi là đảng viên và loại chuyến đi yêu cầu)
da_duyet_dang BOOLEAN DEFAULT FALSE,
ma_quyet_dinh_dang VARCHAR(50),
ngay_duyet_dang DATE,

-- Trạng thái
ma_trang_thai VARCHAR(20) NOT NULL DEFAULT 'DRAFT' REFERENCES TrangThaiHoSo (ma_trang_thai),

-- Tracking
ngay_gui_ho_so TIMESTAMP,
ngay_hoan_thanh TIMESTAMP,
so_ngay_xu_ly INTEGER GENERATED ALWAYS AS (
    CASE
        WHEN ngay_hoan_thanh IS NOT NULL
        AND ngay_gui_ho_so IS NOT NULL THEN EXTRACT(
            DAY
            FROM (
                    ngay_hoan_thanh - ngay_gui_ho_so
                )
        )
        ELSE NULL
    END
) STORED,

-- Metadata
nguoi_tao INTEGER REFERENCES NguoiDung (id),
nguoi_cap_nhat INTEGER REFERENCES NguoiDung (id),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

-- Ràng buộc kiểm tra
CONSTRAINT check_ngay_hop_le CHECK (tu_ngay < den_ngay),
    CONSTRAINT check_quyet_dinh_dang CHECK (
        (da_duyet_dang = TRUE AND ma_quyet_dinh_dang IS NOT NULL AND ngay_duyet_dang IS NOT NULL) OR
        (da_duyet_dang = FALSE)
    )
);

-- ============================================
-- E. NHÓM GIẤY TỜ - TÀI LIỆU
-- ============================================

CREATE TABLE LoaiTaiLieu (
    ma_loai VARCHAR(10) PRIMARY KEY,
    ten_loai VARCHAR(100) NOT NULL,
    bat_buoc BOOLEAN DEFAULT FALSE,
    ap_dung_cho VARCHAR(20) DEFAULT 'ALL' CHECK (
        ap_dung_cho IN (
            'ALL',
            'DANG_VIEN',
            'VIEN_CHUC'
        )
    ),
    thu_tu INTEGER DEFAULT 0,
    trang_thai BOOLEAN DEFAULT TRUE
);

INSERT INTO
    LoaiTaiLieu (
        ma_loai,
        ten_loai,
        bat_buoc,
        ap_dung_cho
    )
VALUES (
        'DXP',
        'Đơn xin phép',
        TRUE,
        'ALL'
    ),
    (
        'QĐ',
        'Quyết định cử đi',
        FALSE,
        'ALL'
    ),
    ('TM', 'Thư mời', FALSE, 'ALL'),
    (
        'BCKQ',
        'Báo cáo kết quả',
        TRUE,
        'ALL'
    ),
    (
        'LTR',
        'Lịch trình',
        FALSE,
        'ALL'
    ),
    ('HP', 'Hộ chiếu', TRUE, 'ALL'),
    (
        'CV',
        'Công văn',
        FALSE,
        'DANG_VIEN'
    ),
    (
        'BB',
        'Biên bản',
        FALSE,
        'DANG_VIEN'
    );

CREATE TABLE TaiLieuHoSo (
    id SERIAL PRIMARY KEY,
    ma_ho_so VARCHAR(30) NOT NULL REFERENCES HoSoDiNuocNgoai(ma_ho_so) ON DELETE CASCADE,
    ma_loai VARCHAR(10) NOT NULL REFERENCES LoaiTaiLieu(ma_loai),

-- Thông tin file
ten_file VARCHAR(255) NOT NULL,
ten_file_goc VARCHAR(255),
kich_thuoc BIGINT CHECK (
    kich_thuoc > 0
    AND kich_thuoc <= 10485760
), -- 10MB max
duong_dan VARCHAR(500) NOT NULL,
mime_type VARCHAR(100),
checksum VARCHAR(64),

-- Metadata linh hoạt (JSONB)
metadata JSONB DEFAULT '{}',

-- Người upload
nguoi_upload INTEGER REFERENCES NguoiDung(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- F. NHÓM WORKFLOW - XỬ LÝ
-- ============================================

CREATE TABLE LuongXuLy (
    ma_luong VARCHAR(50) PRIMARY KEY,
    ten_luong VARCHAR(100) NOT NULL,

-- Phạm vi áp dụng

ma_loai_chuyen_di VARCHAR(20) REFERENCES LoaiChuyenDi(ma_loai),
    ap_dung_dang_vien BOOLEAN DEFAULT TRUE,
    ap_dung_vien_chuc BOOLEAN DEFAULT TRUE,
    
    mo_ta TEXT,
    trang_thai BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE BuocXuLy (
    id SERIAL PRIMARY KEY,
    ma_luong VARCHAR(50) NOT NULL REFERENCES LuongXuLy(ma_luong) ON DELETE CASCADE,
    thu_tu INTEGER NOT NULL,

-- Thông tin bước
ten_buoc VARCHAR(100) NOT NULL, ma_buoc VARCHAR(50) NOT NULL,

-- Loại xử lý
loai_xu_ly VARCHAR(20) NOT NULL DEFAULT 'HANH_CHINH' CHECK (
    loai_xu_ly IN (
        'HANH_CHINH',
        'DANG',
        'PHOI_HOP'
    )
),

-- Đơn vị có thẩm quyền
ma_don_vi VARCHAR(20) REFERENCES DonVi (ma_don_vi), -- Cho duyệt hành chính
ma_don_vi_dang VARCHAR(20) REFERENCES DonViDang (ma_don_vi_dang), -- Cho duyệt đảng

-- Ràng buộc

    thoi_gian_du_kien INTEGER CHECK (thoi_gian_du_kien > 0),
    
    UNIQUE(ma_luong, thu_tu),
    UNIQUE(ma_luong, ma_buoc)
);

CREATE TABLE XuLyHoSo (
    id SERIAL PRIMARY KEY,
    ma_ho_so VARCHAR(30) NOT NULL REFERENCES HoSoDiNuocNgoai(ma_ho_so) ON DELETE CASCADE,
    buoc_xu_ly_id INTEGER NOT NULL REFERENCES BuocXuLy(id),

-- Người xử lý
nguoi_xu_ly INTEGER REFERENCES NguoiDung (id),
chuc_vu_nguoi_xu_ly VARCHAR(100),

-- Kết quả
ket_qua VARCHAR(20) NOT NULL CHECK (
    ket_qua IN (
        'PENDING',
        'APPROVED',
        'REJECTED',
        'RETURNED',
        'CANCELLED'
    )
),
y_kien TEXT,

-- Thời gian

thoi_gian_nhan TIMESTAMP,
    thoi_gian_xu_ly TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    thoi_gian_hoan_thanh TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE YeuCauBoSung (
    id SERIAL PRIMARY KEY,
    ma_ho_so VARCHAR(30) NOT NULL REFERENCES HoSoDiNuocNgoai (ma_ho_so) ON DELETE CASCADE,
    buoc_xu_ly_id INTEGER REFERENCES BuocXuLy (id),
    noi_dung_yeu_cau TEXT NOT NULL,
    loai_yeu_cau VARCHAR(20) NOT NULL CHECK (
        loai_yeu_cau IN (
            'GIAY_TO',
            'THONG_TIN',
            'KHAC'
        )
    ),
    danh_sach_giay_to_thieu JSONB, -- ví dụ: ["DXP", "TM"]
    nguoi_yeu_cau INTEGER REFERENCES NguoiDung (id),
    trang_thai VARCHAR(20) DEFAULT 'CHO_BO_SUNG' CHECK (
        trang_thai IN ('CHO_BO_SUNG', 'DA_BO_SUNG')
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- ============================================
-- G. NHÓM BÁO CÁO SAU CHUYẾN ĐI
-- ============================================

CREATE TABLE BaoCaoSauChuyenDi (
    id SERIAL PRIMARY KEY,
    ma_ho_so VARCHAR(30) UNIQUE NOT NULL REFERENCES HoSoDiNuocNgoai (ma_ho_so) ON DELETE CASCADE,
    ma_vien_chuc VARCHAR(20) REFERENCES VienChuc (ma_vien_chuc),
    noi_dung_bao_cao TEXT NOT NULL,
    ket_qua_dat_duoc TEXT,
    kien_nghi TEXT,
    ngay_nop TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ma_trang_thai VARCHAR(20) DEFAULT 'CHO_DUYET' CHECK (
        ma_trang_thai IN (
            'CHO_DUYET',
            'DA_DUYET',
            'YEU_CAU_BO_SUNG'
        )
    ),
    y_kien_phan_hoi TEXT,
    nguoi_duyet_id INTEGER REFERENCES NguoiDung (id),
    ngay_duyet TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE FileBaoCao (
    id SERIAL PRIMARY KEY,
    bao_cao_id INTEGER REFERENCES BaoCaoSauChuyenDi (id) ON DELETE CASCADE,
    ten_file_goc VARCHAR(255) NOT NULL,
    duong_dan VARCHAR(500) NOT NULL,
    loai_file VARCHAR(50),
    kich_thuoc INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- H. NHÓM THÔNG BÁO
-- ============================================

CREATE TABLE ThongBao (
    id SERIAL PRIMARY KEY,
    nguoi_dung_id INTEGER NOT NULL REFERENCES NguoiDung(id) ON DELETE CASCADE,

-- Nội dung
tieu_de VARCHAR(200) NOT NULL,
noi_dung TEXT NOT NULL,
loai VARCHAR(20) NOT NULL CHECK (
    loai IN (
        'INFO',
        'WARNING',
        'SUCCESS',
        'ERROR',
        'REMINDER'
    )
),

-- Liên kết
duong_dan VARCHAR(500), tham_so JSONB,

-- Trạng thái

da_doc BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    doc_tai TIMESTAMP
);

-- ============================================
-- I. NHÓM LỊCH SỬ HOẠT ĐỘNG
-- ============================================

CREATE TABLE LichSuHoatDong (
    id SERIAL PRIMARY KEY,
    nguoi_dung_id INTEGER REFERENCES NguoiDung(id),

-- Hành động
hanh_dong VARCHAR(50) NOT NULL,
loai_doi_tuong VARCHAR(50) NOT NULL,
ma_doi_tuong VARCHAR(50),

-- Chi tiết
mo_ta TEXT, du_lieu_cu JSONB, du_lieu_moi JSONB,

-- Metadata
dia_chi_ip INET,
    trinh_duyet TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- J. NHÓM CẤU HÌNH HỆ THỐNG
-- ============================================

CREATE TABLE CauHinhHeThong (
    ma_cau_hinh VARCHAR(50) PRIMARY KEY,
    ten_cau_hinh VARCHAR(100) NOT NULL,
    gia_tri TEXT NOT NULL,
    mo_ta TEXT,
    loai VARCHAR(20) NOT NULL CHECK (
        loai IN (
            'STRING',
            'NUMBER',
            'BOOLEAN',
            'JSON',
            'DATE'
        )
    ),
    nhom VARCHAR(50) NOT NULL CHECK (
        nhom IN (
            'CHUNG',
            'THOI_GIAN',
            'FILE',
            'EMAIL',
            'VALIDATION'
        )
    ),
    trang_thai BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO
    CauHinhHeThong (
        ma_cau_hinh,
        ten_cau_hinh,
        gia_tri,
        loai,
        nhom
    )
VALUES (
        'THOI_GIAN_GUI_HO_SO',
        'Thời gian gửi hồ sơ trước khi đi (ngày)',
        '17',
        'NUMBER',
        'THOI_GIAN'
    ),
    (
        'THOI_GIAN_BAO_CAO',
        'Thời gian báo cáo sau khi về (ngày)',
        '15',
        'NUMBER',
        'THOI_GIAN'
    ),
    (
        'SO_LAN_DI_NUOC_NGOAI',
        'Số lần đi nước ngoài tối đa trong năm',
        '2',
        'NUMBER',
        'VALIDATION'
    ),
    (
        'MAX_FILE_SIZE',
        'Kích thước file tối đa (MB)',
        '10',
        'NUMBER',
        'FILE'
    ),
    (
        'EMAIL_SENDER',
        'Email người gửi thông báo',
        'no-reply@university.edu.vn',
        'STRING',
        'EMAIL'
    ),
    (
        'REQUIRE_PASSPORT',
        'Yêu cầu hộ chiếu còn hạn',
        'true',
        'BOOLEAN',
        'VALIDATION'
    );

-- ============================================
-- K. INDEXES CHO HIỆU SUẤT
-- ============================================

-- Index cho VienChuc
CREATE INDEX idx_vien_chuc_don_vi ON VienChuc (ma_don_vi);

CREATE INDEX idx_vien_chuc_trang_thai ON VienChuc (trang_thai);

CREATE INDEX idx_vien_chuc_email ON VienChuc (email)
WHERE
    email IS NOT NULL;

CREATE INDEX idx_vien_chuc_so_dien_thoai ON VienChuc (so_dien_thoai)
WHERE
    so_dien_thoai IS NOT NULL;

-- Index cho HoSoDiNuocNgoai
CREATE INDEX idx_ho_so_vien_chuc ON HoSoDiNuocNgoai (ma_vien_chuc);

CREATE INDEX idx_ho_so_trang_thai ON HoSoDiNuocNgoai (ma_trang_thai);

CREATE INDEX idx_ho_so_ngay ON HoSoDiNuocNgoai (tu_ngay, den_ngay);

CREATE INDEX idx_ho_so_created ON HoSoDiNuocNgoai (created_at DESC);

CREATE INDEX idx_ho_so_vc_trang_thai ON HoSoDiNuocNgoai (ma_vien_chuc, ma_trang_thai);

-- Index cho TaiLieuHoSo
CREATE INDEX idx_tai_lieu_ho_so ON TaiLieuHoSo (ma_ho_so);

CREATE INDEX idx_tai_lieu_loai ON TaiLieuHoSo (ma_loai);

-- Index cho XuLyHoSo
CREATE INDEX idx_xu_ly_ho_so ON XuLyHoSo (ma_ho_so);

CREATE INDEX idx_xu_ly_buoc ON XuLyHoSo (buoc_xu_ly_id);

CREATE INDEX idx_xu_ly_nguoi_xu_ly ON XuLyHoSo (nguoi_xu_ly);

-- Index cho YeuCauBoSung
CREATE INDEX idx_yeu_cau_ho_so ON YeuCauBoSung (ma_ho_so);

CREATE INDEX idx_yeu_cau_buoc_xu_ly ON YeuCauBoSung (buoc_xu_ly_id);

CREATE INDEX idx_yeu_cau_trang_thai ON YeuCauBoSung (trang_thai);

CREATE INDEX idx_yeu_cau_nguoi_yeu_cau ON YeuCauBoSung (nguoi_yeu_cau);

CREATE INDEX idx_yeu_cau_ho_so_trang_thai ON YeuCauBoSung (ma_ho_so, trang_thai);

-- Index cho BaoCaoSauChuyenDi
CREATE INDEX idx_bao_cao_ho_so ON BaoCaoSauChuyenDi (ma_ho_so);

CREATE INDEX idx_bao_cao_vien_chuc ON BaoCaoSauChuyenDi (ma_vien_chuc);

-- Index cho ThongBao
CREATE INDEX idx_thong_bao_nguoi_dung ON ThongBao (nguoi_dung_id);

CREATE INDEX idx_thong_bao_chua_doc ON ThongBao (nguoi_dung_id, da_doc)
WHERE
    da_doc = false;

-- Index cho NguoiDung
CREATE INDEX idx_nguoi_dung_ten_dang_nhap ON NguoiDung (ten_dang_nhap);

CREATE INDEX idx_nguoi_dung_email ON NguoiDung (email);

CREATE INDEX idx_nguoi_dung_vien_chuc ON NguoiDung (ma_vien_chuc);

-- ============================================
-- L. FUNCTIONS VÀ TRIGGERS
-- ============================================

-- Function tạo mã hồ sơ tự động
CREATE SEQUENCE seq_ho_so_monthly START 1;

CREATE OR REPLACE FUNCTION tao_ma_ho_so()
RETURNS TRIGGER AS $$
DECLARE
    nam_thang VARCHAR(6);
    so_thu_tu INTEGER;
    ma_ho_so_moi VARCHAR(30);
BEGIN
    -- Chỉ tạo mã nếu chưa có
    IF NEW.ma_ho_so IS NULL OR NEW.ma_ho_so = '' THEN
        nam_thang := TO_CHAR(CURRENT_DATE, 'YYYYMM');
        so_thu_tu := nextval('seq_ho_so_monthly');
        
        ma_ho_so_moi := 'HSNN-' || nam_thang || '-' || LPAD(so_thu_tu::VARCHAR, 4, '0');
        
        -- Đảm bảo không trùng lặp (hiếm khi xảy ra)
        WHILE EXISTS (SELECT 1 FROM HoSoDiNuocNgoai WHERE ma_ho_so = ma_ho_so_moi) LOOP
            so_thu_tu := nextval('seq_ho_so_monthly');
            ma_ho_so_moi := 'HSNN-' || nam_thang || '-' || LPAD(so_thu_tu::VARCHAR, 4, '0');
        END LOOP;
        
        NEW.ma_ho_so := ma_ho_so_moi;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tao_ma_ho_so
BEFORE INSERT ON HoSoDiNuocNgoai
FOR EACH ROW EXECUTE FUNCTION tao_ma_ho_so();

-- Function cập nhật updated_at
CREATE OR REPLACE FUNCTION cap_nhat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cap_nhat_vien_chuc
BEFORE UPDATE ON VienChuc
FOR EACH ROW EXECUTE FUNCTION cap_nhat_updated_at();

CREATE TRIGGER trigger_cap_nhat_dang_vien
BEFORE UPDATE ON DangVien
FOR EACH ROW EXECUTE FUNCTION cap_nhat_updated_at();

CREATE TRIGGER trigger_cap_nhat_nguoi_dung
BEFORE UPDATE ON NguoiDung
FOR EACH ROW EXECUTE FUNCTION cap_nhat_updated_at();

CREATE TRIGGER trigger_cap_nhat_ho_so
BEFORE UPDATE ON HoSoDiNuocNgoai
FOR EACH ROW EXECUTE FUNCTION cap_nhat_updated_at();

CREATE TRIGGER trigger_cap_nhat_bao_cao
BEFORE UPDATE ON BaoCaoSauChuyenDi
FOR EACH ROW EXECUTE FUNCTION cap_nhat_updated_at();

CREATE TRIGGER trigger_cap_nhat_cau_hinh
BEFORE UPDATE ON CauHinhHeThong
FOR EACH ROW EXECUTE FUNCTION cap_nhat_updated_at();

-- Function kiểm tra đảng viên khi duyệt
CREATE OR REPLACE FUNCTION kiem_tra_dang_vien_duyet()
RETURNS TRIGGER AS $$
DECLARE
    v_la_dang_vien BOOLEAN;
BEGIN
    -- Kiểm tra có phải đảng viên không
    SELECT EXISTS (
        SELECT 1 FROM DangVien 
        WHERE ma_vien_chuc = NEW.ma_vien_chuc 
        AND trang_thai = 'DANG_HOAT_DONG'
    ) INTO v_la_dang_vien;
    
    -- Logic kiểm tra
    IF v_la_dang_vien AND NEW.da_duyet_dang = FALSE AND NEW.ma_trang_thai = 'DA_DUYET' THEN
        RAISE EXCEPTION 'Đảng viên phải được duyệt đảng trước khi duyệt hồ sơ';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_kiem_tra_dang_vien
BEFORE UPDATE ON HoSoDiNuocNgoai
FOR EACH ROW EXECUTE FUNCTION kiem_tra_dang_vien_duyet();

-- Function kiểm tra hạn hộ chiếu
CREATE OR REPLACE FUNCTION kiem_tra_ho_chieu()
RETURNS TRIGGER AS $$
DECLARE
    v_ho_chieu_het_han DATE;
    v_require_passport BOOLEAN;
BEGIN
    -- Lấy cấu hình
    SELECT gia_tri::BOOLEAN INTO v_require_passport
    FROM CauHinhHeThong 
    WHERE ma_cau_hinh = 'REQUIRE_PASSPORT';
    
    -- Kiểm tra hộ chiếu
    IF v_require_passport THEN
        SELECT ngay_het_han_ho_chieu INTO v_ho_chieu_het_han
        FROM VienChuc WHERE ma_vien_chuc = NEW.ma_vien_chuc;
        
        IF v_ho_chieu_het_han IS NOT NULL AND v_ho_chieu_het_han < NEW.tu_ngay THEN
            RAISE EXCEPTION 'Hộ chiếu hết hạn trước ngày đi';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_kiem_tra_ho_chieu
BEFORE INSERT OR UPDATE ON HoSoDiNuocNgoai
FOR EACH ROW EXECUTE FUNCTION kiem_tra_ho_chieu();

-- Function tự động cập nhật tracking
CREATE OR REPLACE FUNCTION cap_nhat_tracking()
RETURNS TRIGGER AS $$
BEGIN
    -- Khi chuyển từ DRAFT sang trạng thái khác, ghi nhận ngày gửi
    IF (TG_OP = 'INSERT' AND NEW.ma_trang_thai != 'DRAFT') OR 
       (TG_OP = 'UPDATE' AND OLD.ma_trang_thai = 'DRAFT' AND NEW.ma_trang_thai != 'DRAFT') THEN
        NEW.ngay_gui_ho_so := CURRENT_TIMESTAMP;
    END IF;
    
    -- Khi chuyển sang trạng thái hoàn thành, ghi nhận ngày hoàn thành
    IF (TG_OP = 'INSERT' AND NEW.ma_trang_thai IN ('DA_DUYET', 'TU_CHOI', 'DA_HUY')) OR
       (TG_OP = 'UPDATE' AND NEW.ma_trang_thai IN ('DA_DUYET', 'TU_CHOI', 'DA_HUY') AND 
        (OLD.ma_trang_thai IS NULL OR OLD.ma_trang_thai NOT IN ('DA_DUYET', 'TU_CHOI', 'DA_HUY'))) THEN
        NEW.ngay_hoan_thanh := CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cap_nhat_tracking
BEFORE INSERT OR UPDATE ON HoSoDiNuocNgoai
FOR EACH ROW EXECUTE FUNCTION cap_nhat_tracking();

-- Function tự động tăng số lần bổ sung
CREATE OR REPLACE FUNCTION tang_so_lan_bo_sung()
RETURNS TRIGGER AS $$
BEGIN
    -- Khi chuyển sang trạng thái CAN_BO_SUNG, tăng đếm
    IF TG_OP = 'UPDATE' AND NEW.ma_trang_thai = 'CAN_BO_SUNG' AND 
       (OLD.ma_trang_thai IS NULL OR OLD.ma_trang_thai != 'CAN_BO_SUNG') THEN
        NEW.so_lan_bo_sung := COALESCE(OLD.so_lan_bo_sung, 0) + 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tang_so_lan_bo_sung
BEFORE UPDATE ON HoSoDiNuocNgoai
FOR EACH ROW EXECUTE FUNCTION tang_so_lan_bo_sung();

-- Function log lịch sử hoạt động cho hồ sơ
CREATE OR REPLACE FUNCTION log_ho_so_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO LichSuHoatDong (nguoi_dung_id, hanh_dong, loai_doi_tuong, ma_doi_tuong, mo_ta, du_lieu_moi)
        VALUES (NEW.nguoi_tao, 'CREATE', 'HoSoDiNuocNgoai', NEW.ma_ho_so, 'Tạo mới hồ sơ', row_to_json(NEW));
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO LichSuHoatDong (nguoi_dung_id, hanh_dong, loai_doi_tuong, ma_doi_tuong, mo_ta, du_lieu_cu, du_lieu_moi)
        VALUES (NEW.nguoi_cap_nhat, 'UPDATE', 'HoSoDiNuocNgoai', NEW.ma_ho_so, 'Cập nhật hồ sơ', row_to_json(OLD), row_to_json(NEW));
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO LichSuHoatDong (nguoi_dung_id, hanh_dong, loai_doi_tuong, ma_doi_tuong, mo_ta, du_lieu_cu)
        VALUES (OLD.nguoi_cap_nhat, 'DELETE', 'HoSoDiNuocNgoai', OLD.ma_ho_so, 'Xóa hồ sơ', row_to_json(OLD));
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_ho_so
AFTER INSERT OR UPDATE OR DELETE ON HoSoDiNuocNgoai
FOR EACH ROW EXECUTE FUNCTION log_ho_so_activity();

-- Function tự động tạo thông báo khi trạng thái thay đổi
CREATE OR REPLACE FUNCTION create_status_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_tieu_de TEXT;
    v_noi_dung TEXT;
    v_nguoi_nhan INTEGER;
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.ma_trang_thai <> NEW.ma_trang_thai) THEN
        v_tieu_de := 'Cập nhật trạng thái hồ sơ ' || NEW.ma_ho_so;
        v_noi_dung := 'Hồ sơ của bạn đã được chuyển sang trạng thái: ' || NEW.ma_trang_thai;
        
        -- Lấy ID người dùng của viên chức chủ hồ sơ
        SELECT id INTO v_nguoi_nhan FROM NguoiDung WHERE ma_vien_chuc = NEW.ma_vien_chuc;
        
        IF v_nguoi_nhan IS NOT NULL THEN
            INSERT INTO ThongBao (nguoi_dung_id, tieu_de, noi_dung, loai, duong_dan)
            VALUES (v_nguoi_nhan, v_tieu_de, v_noi_dung, 'INFO', '/records/' || NEW.ma_ho_so);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notification_status
AFTER UPDATE ON HoSoDiNuocNgoai
FOR EACH ROW EXECUTE FUNCTION create_status_notification();

-- Function kiểm tra trùng lịch chuyến đi
CREATE OR REPLACE FUNCTION check_overlapping_trips()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM HoSoDiNuocNgoai
        WHERE ma_vien_chuc = NEW.ma_vien_chuc
        AND ma_ho_so <> COALESCE(NEW.ma_ho_so, '')
        AND ma_trang_thai NOT IN ('TU_CHOI', 'DA_HUY')
        AND (
            (NEW.tu_ngay BETWEEN tu_ngay AND den_ngay) OR
            (NEW.den_ngay BETWEEN tu_ngay AND den_ngay) OR
            (tu_ngay BETWEEN NEW.tu_ngay AND NEW.den_ngay)
        )
    ) THEN
        RAISE EXCEPTION 'Viên chức đã có lịch đi nước ngoài trùng với thời gian này';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_overlap
BEFORE INSERT OR UPDATE ON HoSoDiNuocNgoai
FOR EACH ROW EXECUTE FUNCTION check_overlapping_trips();
-- ============================================
-- G. NH�M QUY �?NH & BI?U M?U
-- ============================================

CREATE TABLE QuyDinhBieuMau (
    id SERIAL PRIMARY KEY,
    tieu_de VARCHAR(255) NOT NULL,
    mo_ta TEXT,
    loai VARCHAR(50) NOT NULL, -- 'QUY_DINH', 'BIEU_MAU'
    ten_file VARCHAR(255) NOT NULL,
    ten_file_goc VARCHAR(255) NOT NULL,
    duong_dan VARCHAR(500) NOT NULL,
    kich_thuoc INTEGER,
    mime_type VARCHAR(100),
    nguoi_dang_id INTEGER REFERENCES NguoiDung (id),
    luot_tai INTEGER DEFAULT 0,
    trang_thai BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quy_dinh_loai ON QuyDinhBieuMau (loai);

-- ============================================
-- H. D? LI?U KH?I T?O WORKFLOW
-- ============================================

-- C?p nh?t LuongXuLy m?u cho quy tr�nh chu?n
INSERT INTO
    LuongXuLy (ma_luong, ten_luong, mo_ta)
VALUES (
        'QUY_TRINH_CHINH',
        'Quy tr�nh ph� duy?t h? so di nu?c ngo�i',
        'Quy tr�nh chu?n t? Vi�n ch?c d?n BGH'
    )
ON CONFLICT (ma_luong) DO NOTHING;

-- C?p nh?t BuocXuLy cho quy tr�nh chu?n
INSERT INTO
    BuocXuLy (
        ma_luong,
        thu_tu,
        ten_buoc,
        ma_buoc,
        loai_xu_ly
    )
VALUES (
        'QUY_TRINH_CHINH',
        1,
        'Tru?ng don v? cho � ki?n',
        'TRUONG_DON_VI_DUYET',
        'HANH_CHINH'
    ),
    (
        'QUY_TRINH_CHINH',
        2,
        'Chi b? xem x�t',
        'CHI_BO_DUYET',
        'DANG'
    ),
    (
        'QUY_TRINH_CHINH',
        3,
        '�?ng ?y quy?t d?nh',
        'DANG_UY_DUYET',
        'DANG'
    ),
    (
        'QUY_TRINH_CHINH',
        4,
        'Ph�ng TCNS cho � ki?n',
        'TCNS_DUYET',
        'HANH_CHINH'
    ),
    (
        'QUY_TRINH_CHINH',
        5,
        'BGH ra quy?t d?nh',
        'BGH_DUYET',
        'HANH_CHINH'
    )
ON CONFLICT (ma_luong, thu_tu) DO NOTHING;

