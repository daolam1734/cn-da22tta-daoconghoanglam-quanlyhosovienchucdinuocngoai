const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'qlhs',
    password: process.env.DB_PASSWORD || '123456',
    port: process.env.DB_PORT || 5432,
});

const testUsers = [
    { username: 'vienchuc', fullName: 'Nguyễn Văn A', role: 'VIEN_CHUC', ma_vc: 'VC001', isDangVien: true },
    { username: 'truongdonvi', fullName: 'Trần Thị B', role: 'TRUONG_DON_VI', ma_vc: 'VC002', isDangVien: false },
    { username: 'chibo', fullName: 'Lê Văn C', role: 'CHI_BO', ma_vc: 'VC003', isDangVien: true },
    { username: 'danguy', fullName: 'Phạm Văn D', role: 'DANG_UY', ma_vc: 'VC004', isDangVien: true },
    { username: 'tcns', fullName: 'Hoàng Thị E', role: 'TCNS', ma_vc: 'VC005', isDangVien: false },
    { username: 'bgh', fullName: 'Ngô Văn F', role: 'BGH', ma_vc: 'VC006', isDangVien: false },
];

async function seed() {
    const passwordHash = await bcrypt.hash('password123', 10);

    try {
        for (const user of testUsers) {
            // 1. Insert VienChuc
            await pool.query(
                "INSERT INTO VienChuc (ma_vien_chuc, ho_ten, ma_don_vi, trang_thai) VALUES ($1, $2, 'K_CNTT', 'DANG_LAM_VIEC') ON CONFLICT (ma_vien_chuc) DO NOTHING",
                [user.ma_vc, user.fullName]
            );

            // 2. Insert NguoiDung
            const userRes = await pool.query(
                "INSERT INTO NguoiDung (ten_dang_nhap, mat_khau_hash, ma_vien_chuc, email) VALUES ($1, $2, $3, $4) ON CONFLICT (ten_dang_nhap) DO UPDATE SET mat_khau_hash = $2, ma_vien_chuc = $3, email = $4 RETURNING id",
                [user.username, passwordHash, user.ma_vc, `${user.username}@tvu.edu.vn`]
            );

            const userId = userRes.rows[0].id;

            // 3. Assign Role
            await pool.query(
                "INSERT INTO NguoiDungVaiTro (nguoi_dung_id, ma_vai_tro) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                [userId, user.role]
            );

            // 4. If DangVien, add to DangVien table
            if (user.isDangVien) {
                await pool.query(
                    "INSERT INTO DangVien (ma_vien_chuc, ma_don_vi_dang, ngay_vao_dang) VALUES ($1, 'CB_CNTT', '2020-01-01') ON CONFLICT DO NOTHING",
                    [user.ma_vc]
                );
            }
        }
        console.log('Đã thêm các tài khoản test thành công!');
    } catch (err) {
        console.error('Lỗi khi thêm tài khoản test:', err);
    } finally {
        await pool.end();
    }
}

seed();
