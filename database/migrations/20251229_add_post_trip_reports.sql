-- ============================================
-- E. NHÓM BÁO CÁO SAU CHUYẾN ĐI
-- ============================================

CREATE TABLE BaoCaoSauChuyenDi (
    id SERIAL PRIMARY KEY,
    ma_ho_so VARCHAR(30) UNIQUE NOT NULL REFERENCES HoSoDiNuocNgoai (ma_ho_so) ON DELETE CASCADE,
    noi_dung_bao_cao TEXT NOT NULL,
    ngay_nop TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ma_trang_thai VARCHAR(20) DEFAULT 'CHO_DUYET',
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

-- Thêm trạng thái mới cho hồ sơ (nếu cần) hoặc dùng trạng thái riêng cho báo cáo
-- Ở đây ta dùng ma_trang_thai trong BaoCaoSauChuyenDi: 'CHO_DUYET', 'DA_DUYET', 'YEU_CAU_BO_SUNG'
