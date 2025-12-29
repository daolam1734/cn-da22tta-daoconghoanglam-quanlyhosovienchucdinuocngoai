const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Find user
        const userResult = await db.query(
            `SELECT u.*, v.ho_ten, v.ma_don_vi, v.chuc_vu 
       FROM NguoiDung u 
       LEFT JOIN VienChuc v ON u.ma_vien_chuc = v.ma_vien_chuc 
       WHERE u.ten_dang_nhap = $1 AND u.trang_thai = 'ACTIVE'`,
            [username]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        const user = userResult.rows[0];

        // 2. Check password
        const isMatch = await bcrypt.compare(password, user.mat_khau_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        // 3. Get roles
        const rolesResult = await db.query(
            'SELECT ma_vai_tro FROM NguoiDungVaiTro WHERE nguoi_dung_id = $1',
            [user.id]
        );
        const roles = rolesResult.rows.map(r => r.ma_vai_tro);

        // 4. Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                username: user.ten_dang_nhap,
                roles,
                ma_don_vi: user.ma_don_vi,
                ma_vien_chuc: user.ma_vien_chuc
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // 5. Update last login
        await db.query('UPDATE NguoiDung SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.ten_dang_nhap,
                    fullName: user.ho_ten,
                    ma_don_vi: user.ma_don_vi,
                    ma_vien_chuc: user.ma_vien_chuc,
                    avatar_url: user.avatar_url,
                    chuc_vu: user.chuc_vu,
                    roles
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const logout = async (req, res) => {
    // In a simple JWT setup, logout is handled by the client removing the token.
    // Optionally, you can blacklist the token here if using a blacklist mechanism.
    res.json({ success: true, message: 'Đăng xuất thành công' });
};

const getMe = async (req, res) => {
    try {
        const userResult = await db.query(
            `SELECT u.id, u.ten_dang_nhap, u.email, u.avatar_url, v.ho_ten, v.ma_don_vi, v.chuc_vu 
       FROM NguoiDung u 
       LEFT JOIN VienChuc v ON u.ma_vien_chuc = v.ma_vien_chuc 
       WHERE u.id = $1`,
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
        }

        const user = userResult.rows[0];
        const rolesResult = await db.query(
            'SELECT ma_vai_tro FROM NguoiDungVaiTro WHERE nguoi_dung_id = $1',
            [user.id]
        );
        const roles = rolesResult.rows.map(r => r.ma_vai_tro);

        res.json({
            success: true,
            data: {
                ...user,
                roles
            }
        });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

module.exports = {
    login,
    logout,
    getMe
};
