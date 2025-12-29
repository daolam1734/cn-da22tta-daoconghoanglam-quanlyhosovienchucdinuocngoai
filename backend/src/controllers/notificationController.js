const db = require('../config/database');

exports.getNotifications = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM ThongBao WHERE nguoi_dung_id = $1 ORDER BY created_at DESC LIMIT 50',
            [req.user.id]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(
            'UPDATE ThongBao SET da_doc = TRUE WHERE id = $1 AND nguoi_dung_id = $2',
            [id, req.user.id]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await db.query(
            'UPDATE ThongBao SET da_doc = TRUE WHERE nguoi_dung_id = $1',
            [req.user.id]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT COUNT(*) FROM ThongBao WHERE nguoi_dung_id = $1 AND da_doc = FALSE',
            [req.user.id]
        );
        res.json({ success: true, count: parseInt(result.rows[0].count) });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};
