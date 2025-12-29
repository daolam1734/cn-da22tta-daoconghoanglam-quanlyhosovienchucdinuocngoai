const db = require('../config/database');

// Luong Xu Ly
exports.getWorkflows = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT l.*, lc.ten_loai 
            FROM LuongXuLy l
            LEFT JOIN LoaiChuyenDi lc ON l.ma_loai_chuyen_di = lc.ma_loai
            ORDER BY l.ma_luong
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get workflows error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.getWorkflowById = async (req, res) => {
    try {
        const { id } = req.params;
        const workflow = await db.query('SELECT * FROM LuongXuLy WHERE ma_luong = $1', [id]);
        if (workflow.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy luồng' });
        }

        const steps = await db.query(`
            SELECT b.*, dv.ten_don_vi, dvd.ten_don_vi_dang
            FROM BuocXuLy b
            LEFT JOIN DonVi dv ON b.ma_don_vi = dv.ma_don_vi
            LEFT JOIN DonViDang dvd ON b.ma_don_vi_dang = dvd.ma_don_vi_dang
            WHERE b.ma_luong = $1
            ORDER BY b.thu_tu
        `, [id]);

        res.json({ 
            success: true, 
            data: { 
                ...workflow.rows[0], 
                steps: steps.rows 
            } 
        });
    } catch (error) {
        console.error('Get workflow detail error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.createWorkflow = async (req, res) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const { ma_luong, ten_luong, ma_loai_chuyen_di, ap_dung_dang_vien, ap_dung_vien_chuc, mo_ta, steps } = req.body;

        await client.query(
            'INSERT INTO LuongXuLy (ma_luong, ten_luong, ma_loai_chuyen_di, ap_dung_dang_vien, ap_dung_vien_chuc, mo_ta) VALUES ($1, $2, $3, $4, $5, $6)',
            [ma_luong, ten_luong, ma_loai_chuyen_di || null, ap_dung_dang_vien ?? true, ap_dung_vien_chuc ?? true, mo_ta]
        );

        if (steps && steps.length > 0) {
            for (const step of steps) {
                await client.query(
                    'INSERT INTO BuocXuLy (ma_luong, thu_tu, ten_buoc, ma_buoc, loai_xu_ly, ma_don_vi, ma_don_vi_dang, thoi_gian_du_kien) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                    [ma_luong, step.thu_tu, step.ten_buoc, step.ma_buoc, step.loai_xu_ly, step.ma_don_vi || null, step.ma_don_vi_dang || null, step.thoi_gian_du_kien || null]
                );
            }
        }

        await client.query('COMMIT');
        res.json({ success: true, message: 'Tạo luồng xử lý thành công' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create workflow error:', error);
        res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
    } finally {
        client.release();
    }
};

exports.updateWorkflow = async (req, res) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        const { ten_luong, ma_loai_chuyen_di, ap_dung_dang_vien, ap_dung_vien_chuc, mo_ta, steps } = req.body;

        await client.query(
            'UPDATE LuongXuLy SET ten_luong = $1, ma_loai_chuyen_di = $2, ap_dung_dang_vien = $3, ap_dung_vien_chuc = $4, mo_ta = $5 WHERE ma_luong = $6',
            [ten_luong, ma_loai_chuyen_di || null, ap_dung_dang_vien, ap_dung_vien_chuc, mo_ta, id]
        );

        // Delete old steps and insert new ones
        await client.query('DELETE FROM BuocXuLy WHERE ma_luong = $1', [id]);

        if (steps && steps.length > 0) {
            for (const step of steps) {
                await client.query(
                    'INSERT INTO BuocXuLy (ma_luong, thu_tu, ten_buoc, ma_buoc, loai_xu_ly, ma_don_vi, ma_don_vi_dang, thoi_gian_du_kien) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                    [id, step.thu_tu, step.ten_buoc, step.ma_buoc, step.loai_xu_ly, step.ma_don_vi || null, step.ma_don_vi_dang || null, step.thoi_gian_du_kien || null]
                );
            }
        }

        await client.query('COMMIT');
        res.json({ success: true, message: 'Cập nhật luồng xử lý thành công' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Update workflow error:', error);
        res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
    } finally {
        client.release();
    }
};

exports.deleteWorkflow = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM LuongXuLy WHERE ma_luong = $1', [id]);
        res.json({ success: true, message: 'Xóa luồng xử lý thành công' });
    } catch (error) {
        console.error('Delete workflow error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};
