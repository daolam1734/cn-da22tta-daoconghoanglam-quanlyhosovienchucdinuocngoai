const db = require('../config/database');

// Loai Chuyen Di
exports.getTripTypes = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM LoaiChuyenDi ORDER BY thu_tu, ten_loai');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get trip types error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.createTripType = async (req, res) => {
    try {
        const { ma_loai, ten_loai, thu_tu, trang_thai } = req.body;
        await db.query(
            'INSERT INTO LoaiChuyenDi (ma_loai, ten_loai, thu_tu, trang_thai) VALUES ($1, $2, $3, $4)',
            [ma_loai, ten_loai, thu_tu || 0, trang_thai !== undefined ? trang_thai : true]
        );
        res.json({ success: true, message: 'Thêm loại chuyến đi thành công' });
    } catch (error) {
        console.error('Create trip type error:', error);
        res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
    }
};

exports.updateTripType = async (req, res) => {
    try {
        const { id } = req.params;
        const { ten_loai, thu_tu, trang_thai } = req.body;
        await db.query(
            'UPDATE LoaiChuyenDi SET ten_loai = $1, thu_tu = $2, trang_thai = $3 WHERE ma_loai = $4',
            [ten_loai, thu_tu, trang_thai, id]
        );
        res.json({ success: true, message: 'Cập nhật loại chuyến đi thành công' });
    } catch (error) {
        console.error('Update trip type error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.deleteTripType = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM LoaiChuyenDi WHERE ma_loai = $1', [id]);
        res.json({ success: true, message: 'Xóa loại chuyến đi thành công' });
    } catch (error) {
        console.error('Delete trip type error:', error);
        res.status(500).json({ success: false, message: 'Không thể xóa loại chuyến đi này vì có thể đang được sử dụng' });
    }
};

// Quoc Gia
exports.getCountries = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM QuocGia ORDER BY ten_quoc_gia');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get countries error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.createCountry = async (req, res) => {
    try {
        const { ma_quoc_gia, ten_quoc_gia, ten_day_du, trang_thai } = req.body;
        await db.query(
            'INSERT INTO QuocGia (ma_quoc_gia, ten_quoc_gia, ten_day_du, trang_thai) VALUES ($1, $2, $3, $4)',
            [ma_quoc_gia, ten_quoc_gia, ten_day_du, trang_thai !== undefined ? trang_thai : true]
        );
        res.json({ success: true, message: 'Thêm quốc gia thành công' });
    } catch (error) {
        console.error('Create country error:', error);
        res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
    }
};

exports.updateCountry = async (req, res) => {
    try {
        const { id } = req.params;
        const { ten_quoc_gia, ten_day_du, trang_thai } = req.body;
        await db.query(
            'UPDATE QuocGia SET ten_quoc_gia = $1, ten_day_du = $2, trang_thai = $3 WHERE ma_quoc_gia = $4',
            [ten_quoc_gia, ten_day_du, trang_thai, id]
        );
        res.json({ success: true, message: 'Cập nhật quốc gia thành công' });
    } catch (error) {
        console.error('Update country error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.deleteCountry = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM QuocGia WHERE ma_quoc_gia = $1', [id]);
        res.json({ success: true, message: 'Xóa quốc gia thành công' });
    } catch (error) {
        console.error('Delete country error:', error);
        res.status(500).json({ success: false, message: 'Không thể xóa quốc gia này vì có thể đang được sử dụng' });
    }
};

// Loai Tai Lieu
exports.getDocumentTypes = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM LoaiTaiLieu ORDER BY thu_tu, ten_loai');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get document types error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.createDocumentType = async (req, res) => {
    try {
        const { ma_loai, ten_loai, ap_dung_cho, bat_buoc, thu_tu, trang_thai } = req.body;
        await db.query(
            'INSERT INTO LoaiTaiLieu (ma_loai, ten_loai, ap_dung_cho, bat_buoc, thu_tu, trang_thai) VALUES ($1, $2, $3, $4, $5, $6)',
            [ma_loai, ten_loai, ap_dung_cho || 'ALL', bat_buoc || false, thu_tu || 0, trang_thai !== undefined ? trang_thai : true]
        );
        res.json({ success: true, message: 'Thêm loại tài liệu thành công' });
    } catch (error) {
        console.error('Create document type error:', error);
        res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
    }
};

exports.updateDocumentType = async (req, res) => {
    try {
        const { id } = req.params;
        const { ten_loai, ap_dung_cho, bat_buoc, thu_tu, trang_thai } = req.body;
        await db.query(
            'UPDATE LoaiTaiLieu SET ten_loai = $1, ap_dung_cho = $2, bat_buoc = $3, thu_tu = $4, trang_thai = $5 WHERE ma_loai = $6',
            [ten_loai, ap_dung_cho, bat_buoc, thu_tu, trang_thai, id]
        );
        res.json({ success: true, message: 'Cập nhật loại tài liệu thành công' });
    } catch (error) {
        console.error('Update document type error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.deleteDocumentType = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM LoaiTaiLieu WHERE ma_loai = $1', [id]);
        res.json({ success: true, message: 'Xóa loại tài liệu thành công' });
    } catch (error) {
        console.error('Delete document type error:', error);
        res.status(500).json({ success: false, message: 'Không thể xóa loại tài liệu này vì có thể đang được sử dụng' });
    }
};
