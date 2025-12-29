const db = require('../config/database');
const path = require('path');
const fs = require('fs');

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get user and linked staff info
        const result = await db.query(
            `SELECT u.id, u.ten_dang_nhap, u.email as user_email, u.ma_vien_chuc, u.avatar_url,
                    v.ho_ten, v.ngay_sinh, v.gioi_tinh, v.ma_don_vi, v.chuc_vu,
                    v.cccd, v.so_ho_chieu, v.ngay_cap_ho_chieu, v.ngay_het_han_ho_chieu,
                    v.hoc_ham, v.hoc_vi, v.chuyen_nganh, v.email as staff_email, v.so_dien_thoai,
                    dv.ma_don_vi_dang, dv.ngay_vao_dang, dv.ngay_chinh_thuc, dv.so_the_dang, dv.chuc_vu_dang
             FROM NguoiDung u
             LEFT JOIN VienChuc v ON u.ma_vien_chuc = v.ma_vien_chuc
             LEFT JOIN DangVien dv ON v.ma_vien_chuc = dv.ma_vien_chuc
             WHERE u.id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        const profile = result.rows[0];
        
        // Get roles
        const rolesResult = await db.query(
            'SELECT ma_vai_tro FROM NguoiDungVaiTro WHERE nguoi_dung_id = $1',
            [userId]
        );
        profile.roles = rolesResult.rows.map(r => r.ma_vai_tro);

        res.json({ success: true, data: profile });
    } catch (error) {
        console.error('GetProfile error:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const getProfileMetadata = async (req, res) => {
    try {
        const units = await db.query('SELECT ma_don_vi, ten_don_vi FROM DonVi WHERE trang_thai = \'ACTIVE\' ORDER BY ten_don_vi');
        const partyUnits = await db.query('SELECT ma_don_vi_dang, ten_don_vi_dang FROM DonViDang WHERE trang_thai = \'ACTIVE\' ORDER BY ten_don_vi_dang');
        
        res.json({
            success: true,
            data: {
                units: units.rows,
                partyUnits: partyUnits.rows
            }
        });
    } catch (error) {
        console.error('GetProfileMetadata error:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const {
        ho_ten, ngay_sinh, gioi_tinh, ma_don_vi, chuc_vu,
        cccd, so_ho_chieu, ngay_cap_ho_chieu, ngay_het_han_ho_chieu,
        hoc_ham, hoc_vi, chuyen_nganh, email, so_dien_thoai,
        is_dang_vien, ma_don_vi_dang, ngay_vao_dang, ngay_chinh_thuc, so_the_dang, chuc_vu_dang
    } = req.body;

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Get ma_vien_chuc first
        const userResult = await client.query('SELECT ma_vien_chuc FROM NguoiDung WHERE id = $1', [userId]);
        
        if (userResult.rows.length === 0) {
            throw new Error('Người dùng không tồn tại');
        }

        const ma_vien_chuc = userResult.rows[0].ma_vien_chuc;

        if (!ma_vien_chuc) {
            throw new Error('Tài khoản của bạn chưa được liên kết với hồ sơ viên chức.');
        }

        // Update VienChuc table
        await client.query(
            `UPDATE VienChuc 
             SET ho_ten = $1, ngay_sinh = $2, gioi_tinh = $3, ma_don_vi = $4, chuc_vu = $5,
                 cccd = $6, so_ho_chieu = $7, ngay_cap_ho_chieu = $8, ngay_het_han_ho_chieu = $9,
                 hoc_ham = $10, hoc_vi = $11, chuyen_nganh = $12, email = $13, so_dien_thoai = $14,
                 updated_at = CURRENT_TIMESTAMP
             WHERE ma_vien_chuc = $15`,
            [
                ho_ten, 
                ngay_sinh || null, 
                gioi_tinh, 
                ma_don_vi, 
                chuc_vu,
                cccd || null, 
                so_ho_chieu || null, 
                ngay_cap_ho_chieu || null, 
                ngay_het_han_ho_chieu || null,
                hoc_ham || null, 
                hoc_vi || null, 
                chuyen_nganh || null, 
                email || null, 
                so_dien_thoai || null,
                ma_vien_chuc
            ]
        );

        // Handle DangVien info
        if (is_dang_vien) {
            // Check if already exists
            const dvCheck = await client.query('SELECT 1 FROM DangVien WHERE ma_vien_chuc = $1', [ma_vien_chuc]);
            if (dvCheck.rows.length > 0) {
                await client.query(
                    `UPDATE DangVien SET 
                        ma_don_vi_dang = $1, ngay_vao_dang = $2, ngay_chinh_thuc = $3, 
                        so_the_dang = $4, chuc_vu_dang = $5, updated_at = CURRENT_TIMESTAMP
                     WHERE ma_vien_chuc = $6`,
                    [ma_don_vi_dang, ngay_vao_dang || null, ngay_chinh_thuc || null, so_the_dang, chuc_vu_dang, ma_vien_chuc]
                );
            } else {
                await client.query(
                    `INSERT INTO DangVien (ma_vien_chuc, ma_don_vi_dang, ngay_vao_dang, ngay_chinh_thuc, so_the_dang, chuc_vu_dang)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [ma_vien_chuc, ma_don_vi_dang, ngay_vao_dang || null, ngay_chinh_thuc || null, so_the_dang, chuc_vu_dang]
                );
            }
        } else {
            // If not a party member anymore, we might want to delete or just leave it. 
            // Usually, we don't delete historical data, but for this app, let's just leave it or delete if requested.
            // For now, let's just not update it.
        }

        // Also update email in NguoiDung table to keep them in sync
        if (email) {
            await client.query(
                'UPDATE NguoiDung SET email = $1 WHERE id = $2',
                [email, userId]
            );
        }

        await client.query('COMMIT');
        res.json({ success: true, message: 'Cập nhật thông tin cá nhân thành công' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('UpdateProfile error:', error);
        
        // Handle specific database errors
        if (error.code === '23514') { // check_violation
            if (error.constraint === 'vienchuc_cccd_check') {
                return res.status(400).json({ success: false, message: 'Số CCCD không hợp lệ (phải có 9-12 chữ số)' });
            }
            if (error.constraint === 'vienchuc_email_check') {
                return res.status(400).json({ success: false, message: 'Email không hợp lệ' });
            }
            return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ: ' + error.message });
        }
        
        if (error.code === '23505') { // unique_violation
            let field = 'Dữ liệu';
            if (error.detail && error.detail.includes('cccd')) field = 'Số CCCD';
            if (error.detail && error.detail.includes('email')) field = 'Email';
            if (error.detail && error.detail.includes('so_dien_thoai')) field = 'Số điện thoại';
            return res.status(400).json({ success: false, message: `${field} đã tồn tại trong hệ thống` });
        }

        if (error.code === '23503') { // foreign_key_violation
            if (error.detail && error.detail.includes('ma_don_vi')) {
                return res.status(400).json({ success: false, message: 'Mã đơn vị không tồn tại' });
            }
        }

        res.status(500).json({ success: false, message: 'Lỗi hệ thống: ' + error.message });
    } finally {
        client.release();
    }
};

const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Vui lòng chọn ảnh đại diện' });
        }

        const userId = req.user.id;
        const avatarPath = `avatars/${req.file.filename}`;
        
        // Move file from temp to avatars
        const oldPath = req.file.path;
        const newDir = path.join(__dirname, '../../uploads/avatars');
        if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir, { recursive: true });
        }
        const newPath = path.join(newDir, req.file.filename);
        fs.renameSync(oldPath, newPath);

        // Update database
        await db.query(
            'UPDATE NguoiDung SET avatar_url = $1 WHERE id = $2',
            [avatarPath, userId]
        );

        res.json({ 
            success: true, 
            message: 'Cập nhật ảnh đại diện thành công',
            data: { avatar_url: avatarPath }
        });
    } catch (error) {
        console.error('UpdateAvatar error:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống khi cập nhật ảnh đại diện' });
    }
};

module.exports = {
    getProfile,
    getProfileMetadata,
    updateProfile,
    updateAvatar
};
