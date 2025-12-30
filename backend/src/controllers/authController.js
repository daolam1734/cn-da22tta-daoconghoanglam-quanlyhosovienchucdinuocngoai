const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Find user
        const userResult = await db.query(
            `SELECT u.*, v.ho_ten, v.ma_don_vi, v.chuc_vu, dv.ma_don_vi_dang
       FROM NguoiDung u 
       LEFT JOIN VienChuc v ON u.ma_vien_chuc = v.ma_vien_chuc 
       LEFT JOIN DangVien dv ON v.ma_vien_chuc = dv.ma_vien_chuc
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
                ma_vien_chuc: user.ma_vien_chuc,
                ma_don_vi_dang: user.ma_don_vi_dang
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
                    ma_don_vi_dang: user.ma_don_vi_dang,
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
            `SELECT u.id, u.ten_dang_nhap, u.email, u.avatar_url, v.ho_ten, v.ma_don_vi, v.ma_vien_chuc, v.chuc_vu, dv.ma_don_vi_dang
       FROM NguoiDung u 
       LEFT JOIN VienChuc v ON u.ma_vien_chuc = v.ma_vien_chuc 
       LEFT JOIN DangVien dv ON v.ma_vien_chuc = dv.ma_vien_chuc
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

const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        // 0. Validation
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
        }

        if (oldPassword === newPassword) {
            return res.status(400).json({ success: false, message: 'Mật khẩu mới không được trùng với mật khẩu cũ' });
        }

        // 1. Get user
        const userResult = await db.query('SELECT mat_khau_hash FROM NguoiDung WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
        }

        const user = userResult.rows[0];

        // 2. Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.mat_khau_hash);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Mật khẩu cũ không chính xác' });
        }

        // 3. Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 4. Update password
        await db.query('UPDATE NguoiDung SET mat_khau_hash = $1 WHERE id = $2', [hashedPassword, userId]);

        res.json({ success: true, message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const userResult = await db.query('SELECT id FROM NguoiDung WHERE email = $1', [email]);
        
        // Luôn trả về thành công để bảo mật (không tiết lộ email có tồn tại hay không)
        res.json({ 
            success: true, 
            message: 'Nếu email tồn tại trong hệ thống, hướng dẫn khôi phục mật khẩu sẽ được gửi đến bạn. Vui lòng kiểm tra hộp thư (bao gồm cả thư rác).' 
        });

        if (userResult.rows.length > 0) {
            // Ở đây sẽ thực hiện logic tạo token và gửi email thực tế
            console.log(`Yêu cầu khôi phục mật khẩu cho email: ${email}`);
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

module.exports = {
    login,
    logout,
    getMe,
    changePassword,
    forgotPassword
};
