const db = require('../config/database');
const path = require('path');
const fs = require('fs');

exports.getAllRegulations = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT r.*, n.ten_dang_nhap as nguoi_dang FROM QuyDinhBieuMau r LEFT JOIN NguoiDung n ON r.nguoi_dang_id = n.id WHERE r.trang_thai = TRUE ORDER BY r.created_at DESC'
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get regulations error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.createRegulation = async (req, res) => {
    try {
        const { tieu_de, mo_ta, loai } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, message: 'Vui lòng tải lên tệp tin' });
        }

        const regulationDir = path.join(__dirname, '../../uploads/regulations');
        if (!fs.existsSync(regulationDir)) {
            fs.mkdirSync(regulationDir, { recursive: true });
        }

        const newPath = path.join(regulationDir, file.filename);
        fs.renameSync(file.path, newPath);
        const relativePath = `regulations/${file.filename}`;

        const result = await db.query(
            `INSERT INTO QuyDinhBieuMau (tieu_de, mo_ta, loai, ten_file, ten_file_goc, duong_dan, kich_thuoc, mime_type, nguoi_dang_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [tieu_de, mo_ta, loai, file.filename, file.originalname, relativePath, file.size, file.mimetype, req.user.id]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Create regulation error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.updateRegulation = async (req, res) => {
    try {
        const { id } = req.params;
        const { tieu_de, mo_ta, loai } = req.body;

        let query = 'UPDATE QuyDinhBieuMau SET tieu_de = $1, mo_ta = $2, loai = $3, updated_at = CURRENT_TIMESTAMP';
        let params = [tieu_de, mo_ta, loai, id];

        if (req.file) {
            const file = req.file;
            const regulationDir = path.join(__dirname, '../../uploads/regulations');
            const newPath = path.join(regulationDir, file.filename);
            fs.renameSync(file.path, newPath);
            const relativePath = `regulations/${file.filename}`;

            query += ', ten_file = $4, ten_file_goc = $5, duong_dan = $6, kich_thuoc = $7, mime_type = $8 WHERE id = $9';
            params = [tieu_de, mo_ta, loai, file.filename, file.originalname, relativePath, file.size, file.mimetype, id];
        } else {
            query += ' WHERE id = $4';
        }

        await db.query(query, params);
        res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) {
        console.error('Update regulation error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.deleteRegulation = async (req, res) => {
    try {
        const { id } = req.params;
        // Soft delete
        await db.query('UPDATE QuyDinhBieuMau SET trang_thai = FALSE WHERE id = $1', [id]);
        res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) {
        console.error('Delete regulation error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.incrementDownload = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE QuyDinhBieuMau SET luot_tai = luot_tai + 1 WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};
