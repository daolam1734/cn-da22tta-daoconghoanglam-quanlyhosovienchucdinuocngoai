const db = require('../config/database');
const bcrypt = require('bcryptjs');

const getUsers = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT u.id, u.ten_dang_nhap, u.email, u.trang_thai, u.last_login, v.ho_ten, v.ma_don_vi 
       FROM NguoiDung u 
       LEFT JOIN VienChuc v ON u.ma_vien_chuc = v.ma_vien_chuc 
       ORDER BY u.created_at DESC`
        );

        // Get roles for each user
        const users = await Promise.all(result.rows.map(async (user) => {
            const rolesResult = await db.query(
                'SELECT ma_vai_tro FROM NguoiDungVaiTro WHERE nguoi_dung_id = $1',
                [user.id]
            );
            return { ...user, roles: rolesResult.rows.map(r => r.ma_vai_tro) };
        }));

        res.json({ success: true, data: users });
    } catch (error) {
        console.error('GetUsers error:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const createUser = async (req, res) => {
    const { username, password, email, ma_vien_chuc, roles } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await db.query(
            `INSERT INTO NguoiDung (ten_dang_nhap, mat_khau_hash, email, ma_vien_chuc, trang_thai) 
       VALUES ($1, $2, $3, $4, 'ACTIVE') RETURNING id`,
            [username, hashedPassword, email, ma_vien_chuc || null]
        );

        const userId = result.rows[0].id;

        if (roles && roles.length > 0) {
            for (const role of roles) {
                await db.query(
                    'INSERT INTO NguoiDungVaiTro (nguoi_dung_id, ma_vai_tro) VALUES ($1, $2)',
                    [userId, role]
                );
            }
        }

        res.status(201).json({ success: true, message: 'Tạo người dùng thành công', userId });
    } catch (error) {
        console.error('CreateUser error:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống hoặc tên đăng nhập đã tồn tại' });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { email, ma_vien_chuc, roles, trang_thai } = req.body;

    try {
        // Update basic info
        await db.query(
            `UPDATE NguoiDung 
       SET email = $1, ma_vien_chuc = $2, trang_thai = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4`,
            [email, ma_vien_chuc || null, trang_thai || 'ACTIVE', id]
        );

        // Update roles
        if (roles) {
            await db.query('DELETE FROM NguoiDungVaiTro WHERE nguoi_dung_id = $1', [id]);
            for (const role of roles) {
                await db.query(
                    'INSERT INTO NguoiDungVaiTro (nguoi_dung_id, ma_vai_tro) VALUES ($1, $2)',
                    [id, role]
                );
            }
        }

        res.json({ success: true, message: 'Cập nhật người dùng thành công' });
    } catch (error) {
        console.error('UpdateUser error:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const updateUserRoles = async (req, res) => {
    const { id } = req.params;
    const { roles } = req.body;

    try {
        if (!roles || !Array.isArray(roles)) {
            return res.status(400).json({ success: false, message: 'Danh sách vai trò không hợp lệ' });
        }

        // Start transaction
        await db.query('BEGIN');

        // Delete old roles
        await db.query('DELETE FROM NguoiDungVaiTro WHERE nguoi_dung_id = $1', [id]);

        // Insert new roles
        for (const role of roles) {
            await db.query(
                'INSERT INTO NguoiDungVaiTro (nguoi_dung_id, ma_vai_tro) VALUES ($1, $2)',
                [id, role]
            );
        }

        // Update updated_at timestamp
        await db.query('UPDATE NguoiDung SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);

        await db.query('COMMIT');

        res.json({ success: true, message: 'Cập nhật vai trò thành công' });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('UpdateUserRoles error:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const quickCreateUser = async (req, res) => {
    const { ho_ten, ma_don_vi, email, roles, ma_don_vi_dang, la_dang_vien, ngay_vao_dang } = req.body;

    try {
        // 1. Generate ma_vien_chuc
        const lastUserResult = await db.query(
            "SELECT ma_vien_chuc FROM VienChuc WHERE ma_vien_chuc LIKE 'VC%' ORDER BY ma_vien_chuc DESC LIMIT 1"
        );

        let nextNumber = 1;
        if (lastUserResult.rows.length > 0) {
            const lastMa = lastUserResult.rows[0].ma_vien_chuc;
            const lastNumber = parseInt(lastMa.substring(2));
            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }
        const ma_vien_chuc = `VC${nextNumber.toString().padStart(5, '0')}`;

        // 2. Generate default password
        const defaultPassword = 'TVU@' + ma_vien_chuc;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        await db.query('BEGIN');

        // 3. Create VienChuc
        await db.query(
            `INSERT INTO VienChuc (ma_vien_chuc, ho_ten, ma_don_vi, email, trang_thai) 
             VALUES ($1, $2, $3, $4, 'DANG_LAM_VIEC')`,
            [ma_vien_chuc, ho_ten, ma_don_vi, email]
        );

        // 4. Create DangVien if applicable
        if (la_dang_vien) {
            if (!ma_don_vi_dang) {
                throw new Error('Vui lòng chọn đơn vị Đảng cho Đảng viên');
            }
            // Ensure ngay_vao_dang is before today to satisfy DB constraint
            const joinDate = ngay_vao_dang ? new Date(ngay_vao_dang) : new Date();
            if (!ngay_vao_dang) {
                joinDate.setDate(joinDate.getDate() - 1); // Default to yesterday if not provided
            }
            
            await db.query(
                `INSERT INTO DangVien (ma_vien_chuc, ma_don_vi_dang, ngay_vao_dang, trang_thai) 
                 VALUES ($1, $2, $3, 'DANG_HOAT_DONG')`,
                [ma_vien_chuc, ma_don_vi_dang, joinDate]
            );
        }

        // 5. Create NguoiDung
        const userResult = await db.query(
            `INSERT INTO NguoiDung (ten_dang_nhap, mat_khau_hash, email, ma_vien_chuc, trang_thai) 
             VALUES ($1, $2, $3, $4, 'ACTIVE') RETURNING id`,
            [ma_vien_chuc, hashedPassword, email, ma_vien_chuc]
        );

        const userId = userResult.rows[0].id;

        // 6. Assign roles
        if (roles && roles.length > 0) {
            for (const role of roles) {
                await db.query(
                    'INSERT INTO NguoiDungVaiTro (nguoi_dung_id, ma_vai_tro) VALUES ($1, $2)',
                    [userId, role]
                );
            }
        }

        await db.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Tạo người dùng thành công',
            data: {
                ma_vien_chuc,
                ten_dang_nhap: ma_vien_chuc,
                mat_khau: defaultPassword
            }
        });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('QuickCreateUser error:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống: ' + error.message });
    }
};

module.exports = {
    getUsers,
    createUser,
    updateUser,
    updateUserRoles,
    quickCreateUser
};
