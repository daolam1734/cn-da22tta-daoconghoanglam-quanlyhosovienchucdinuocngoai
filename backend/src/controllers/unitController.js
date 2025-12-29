const db = require('../config/database');

// Don Vi (Chinh quyen)
exports.getUnits = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM DonVi ORDER BY cap_don_vi, ten_don_vi');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get units error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.createUnit = async (req, res) => {
    try {
        const { ma_don_vi, ten_don_vi, ma_don_vi_cha, cap_don_vi, trang_thai } = req.body;
        await db.query(
            'INSERT INTO DonVi (ma_don_vi, ten_don_vi, ma_don_vi_cha, cap_don_vi, trang_thai) VALUES ($1, $2, $3, $4, $5)',
            [ma_don_vi, ten_don_vi, ma_don_vi_cha || null, cap_don_vi || 1, trang_thai || 'ACTIVE']
        );
        res.json({ success: true, message: 'Thêm đơn vị thành công' });
    } catch (error) {
        console.error('Create unit error:', error);
        res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
    }
};

exports.updateUnit = async (req, res) => {
    try {
        const { id } = req.params; // ma_don_vi
        const { ten_don_vi, ma_don_vi_cha, cap_don_vi, trang_thai } = req.body;
        await db.query(
            'UPDATE DonVi SET ten_don_vi = $1, ma_don_vi_cha = $2, cap_don_vi = $3, trang_thai = $4 WHERE ma_don_vi = $5',
            [ten_don_vi, ma_don_vi_cha || null, cap_don_vi, trang_thai, id]
        );
        res.json({ success: true, message: 'Cập nhật đơn vị thành công' });
    } catch (error) {
        console.error('Update unit error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Don Vi Dang
exports.getPartyUnits = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM DonViDang ORDER BY ten_don_vi_dang');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get party units error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.createPartyUnit = async (req, res) => {
    try {
        const { ma_don_vi_dang, ten_don_vi_dang, cap_do, ma_don_vi, trang_thai } = req.body;
        await db.query(
            'INSERT INTO DonViDang (ma_don_vi_dang, ten_don_vi_dang, cap_do, ma_don_vi, trang_thai) VALUES ($1, $2, $3, $4, $5)',
            [ma_don_vi_dang, ten_don_vi_dang, cap_do || 'CHI_BO', ma_don_vi || null, trang_thai || 'ACTIVE']
        );
        res.json({ success: true, message: 'Thêm đơn vị Đảng thành công' });
    } catch (error) {
        console.error('Create party unit error:', error);
        res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
    }
};

exports.updatePartyUnit = async (req, res) => {
    try {
        const { id } = req.params; // ma_don_vi_dang
        const { ten_don_vi_dang, cap_do, ma_don_vi, trang_thai } = req.body;
        await db.query(
            'UPDATE DonViDang SET ten_don_vi_dang = $1, cap_do = $2, ma_don_vi = $3, trang_thai = $4 WHERE ma_don_vi_dang = $5',
            [ten_don_vi_dang, cap_do, ma_don_vi || null, trang_thai, id]
        );
        res.json({ success: true, message: 'Cập nhật đơn vị Đảng thành công' });
    } catch (error) {
        console.error('Update party unit error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};
