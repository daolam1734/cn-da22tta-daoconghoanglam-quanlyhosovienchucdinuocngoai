const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function addAdmin() {
    const passwordHash = await bcrypt.hash('password123', 10);
    try {
        // 1. Insert VienChuc for Admin
        await pool.query(
            "INSERT INTO VienChuc (ma_vien_chuc, ho_ten, ma_don_vi, trang_thai) VALUES ('ADMIN001', 'Administrator', 'TVU', 'DANG_LAM_VIEC') ON CONFLICT (ma_vien_chuc) DO NOTHING"
        );

        // 2. Insert NguoiDung Admin
        const res = await pool.query(
            "INSERT INTO NguoiDung (ten_dang_nhap, mat_khau_hash, ma_vien_chuc, email) VALUES ('admin', $1, 'ADMIN001', 'admin@tvu.edu.vn') ON CONFLICT (ten_dang_nhap) DO UPDATE SET mat_khau_hash = $1 RETURNING id",
            [passwordHash]
        );

        const userId = res.rows[0].id;

        // 3. Assign ADMIN role
        await pool.query(
            "INSERT INTO NguoiDungVaiTro (nguoi_dung_id, ma_vai_tro) VALUES ($1, 'ADMIN') ON CONFLICT DO NOTHING",
            [userId]
        );

        console.log('Đã thêm tài khoản admin thành công!');
    } catch (err) {
        console.error('Lỗi khi thêm tài khoản admin:', err);
    } finally {
        await pool.end();
    }
}

addAdmin();
