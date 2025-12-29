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

module.exports = {
    getRoles,
    createRole
};
