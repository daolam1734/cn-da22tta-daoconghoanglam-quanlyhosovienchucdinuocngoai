const db = require('../config/database');

exports.getConfigs = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM cauhinhhethong ORDER BY nhom, ma_cau_hinh');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get configs error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.updateConfig = async (req, res) => {
    try {
        const { ma_cau_hinh, gia_tri, trang_thai } = req.body;
        
        await db.query(
            'UPDATE cauhinhhethong SET gia_tri = $1, trang_thai = $2, updated_at = CURRENT_TIMESTAMP WHERE ma_cau_hinh = $3',
            [gia_tri, trang_thai, ma_cau_hinh]
        );
        
        res.json({ success: true, message: 'Cập nhật cấu hình thành công' });
    } catch (error) {
        console.error('Update config error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};
