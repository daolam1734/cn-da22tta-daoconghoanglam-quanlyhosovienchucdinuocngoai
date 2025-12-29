const db = require('../config/database');

const getRoles = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM VaiTro ORDER BY ma_vai_tro');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('GetRoles error:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const createRole = async (req, res) => {
    const { ma_vai_tro, ten_vai_tro, mo_ta } = req.body;
    try {
        await db.query(
            'INSERT INTO VaiTro (ma_vai_tro, ten_vai_tro, mo_ta) VALUES ($1, $2, $3)',
            [ma_vai_tro, ten_vai_tro, mo_ta]
        );
        res.status(201).json({ success: true, message: 'Tạo vai trò thành công' });
    } catch (error) {
        console.error('CreateRole error:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống hoặc mã vai trò đã tồn tại' });
    }
};

const updateRole = async (req, res) => {
    const { id } = req.params;
    const { ten_vai_tro, mo_ta } = req.body;
    try {
        await db.query(
            'UPDATE VaiTro SET ten_vai_tro = $1, mo_ta = $2 WHERE ma_vai_tro = $3',
            [ten_vai_tro, mo_ta, id]
        );
        res.json({ success: true, message: 'Cập nhật vai trò thành công' });
    } catch (error) {
        console.error('UpdateRole error:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const deleteRole = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM VaiTro WHERE ma_vai_tro = $1', [id]);
        res.json({ success: true, message: 'Xóa vai trò thành công' });
    } catch (error) {
        console.error('DeleteRole error:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống hoặc vai trò đang được sử dụng' });
    }
};

module.exports = {
    getRoles,
    createRole,
    updateRole,
    deleteRole
};
