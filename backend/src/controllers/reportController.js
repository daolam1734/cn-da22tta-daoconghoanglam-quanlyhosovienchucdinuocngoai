const db = require('../config/database');
const path = require('path');
const fs = require('fs');

const submitReport = async (req, res) => {
    const { ma_ho_so, noi_dung_bao_cao, ket_qua_dat_duoc, kien_nghi } = req.body;
    const ma_vien_chuc = req.user.ma_vien_chuc;
    const files = req.files;

    try {
        // Check if record exists and belongs to user
        const recordResult = await db.query(
            'SELECT * FROM HoSoDiNuocNgoai WHERE ma_ho_so = $1 AND ma_vien_chuc = $2',
            [ma_ho_so, ma_vien_chuc]
        );

        if (recordResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ hoặc bạn không có quyền nộp báo cáo cho hồ sơ này' });
        }

        // Check if report already exists
        const existingReport = await db.query(
            'SELECT id FROM BaoCaoSauChuyenDi WHERE ma_ho_so = $1',
            [ma_ho_so]
        );

        let reportId;
        if (existingReport.rows.length > 0) {
            // Update existing report
            reportId = existingReport.rows[0].id;
            await db.query(
                `UPDATE BaoCaoSauChuyenDi 
         SET noi_dung_bao_cao = $1, ket_qua_dat_duoc = $2, kien_nghi = $3, 
             ma_trang_thai = 'CHO_DUYET', ngay_nop = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $4`,
                [noi_dung_bao_cao, ket_qua_dat_duoc, kien_nghi, reportId]
            );
            // Delete old files if any (optional, or just add new ones)
        } else {
            // Insert new report
            const result = await db.query(
                `INSERT INTO BaoCaoSauChuyenDi (ma_ho_so, ma_vien_chuc, noi_dung_bao_cao, ket_qua_dat_duoc, kien_nghi) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                [ma_ho_so, ma_vien_chuc, noi_dung_bao_cao, ket_qua_dat_duoc, kien_nghi]
            );
            reportId = result.rows[0].id;
        }

        // Handle files
        if (files && files.length > 0) {
            for (const file of files) {
                await db.query(
                    `INSERT INTO FileBaoCao (bao_cao_id, ten_file_goc, duong_dan, loai_file, kich_thuoc) 
           VALUES ($1, $2, $3, $4, $5)`,
                    [reportId, file.originalname, file.filename, file.mimetype, file.size]
                );
            }
        }

        // Update record status to indicate report submitted (optional)
        // await db.query('UPDATE HoSoDiNuocNgoai SET ma_trang_thai = $1 WHERE ma_ho_so = $2', ['DA_BAO_CAO', ma_ho_so]);

        res.json({ success: true, message: 'Nộp báo cáo thành công', reportId });
    } catch (error) {
        console.error('SubmitReport error:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const getReportByRecord = async (req, res) => {
    const { ma_ho_so } = req.params;
    try {
        const reportResult = await db.query(
            `SELECT b.*, u.ten_dang_nhap as nguoi_duyet_ten 
       FROM BaoCaoSauChuyenDi b 
       LEFT JOIN NguoiDung u ON b.nguoi_duyet_id = u.id 
       WHERE b.ma_ho_so = $1`,
            [ma_ho_so]
        );

        if (reportResult.rows.length === 0) {
            return res.json({ success: true, data: null });
        }

        const report = reportResult.rows[0];
        const filesResult = await db.query(
            'SELECT * FROM FileBaoCao WHERE bao_cao_id = $1',
            [report.id]
        );
        report.files = filesResult.rows;

        res.json({ success: true, data: report });
    } catch (error) {
        console.error('GetReport error:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const approveReport = async (req, res) => {
    const { id } = req.params;
    const { status, feedback } = req.body; // status: DA_DUYET or YEU_CAU_BO_SUNG
    const userId = req.user.id;

    try {
        await db.query(
            `UPDATE BaoCaoSauChuyenDi 
       SET ma_trang_thai = $1, y_kien_phan_hoi = $2, nguoi_duyet_id = $3, 
           ngay_duyet = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4`,
            [status, feedback, userId, id]
        );

        res.json({ success: true, message: 'Cập nhật trạng thái báo cáo thành công' });
    } catch (error) {
        console.error('ApproveReport error:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const getPendingReports = async (req, res) => {
    try {
        // Logic to filter reports based on role (TCNS or Chi bo)
        // For now, just return all pending reports
        const result = await db.query(
            `SELECT b.*, v.ho_ten, h.ma_ho_so, l.ten_loai 
       FROM BaoCaoSauChuyenDi b 
       JOIN VienChuc v ON b.ma_vien_chuc = v.ma_vien_chuc 
       JOIN HoSoDiNuocNgoai h ON b.ma_ho_so = h.ma_ho_so 
       JOIN LoaiChuyenDi l ON h.ma_loai_chuyen_di = l.ma_loai 
       WHERE b.ma_trang_thai = 'CHO_DUYET' 
       ORDER BY b.ngay_nop ASC`
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('GetPendingReports error:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

module.exports = {
    submitReport,
    getReportByRecord,
    approveReport,
    getPendingReports
};
