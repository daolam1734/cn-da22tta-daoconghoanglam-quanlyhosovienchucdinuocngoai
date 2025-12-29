-- Table for Regulations and Forms
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