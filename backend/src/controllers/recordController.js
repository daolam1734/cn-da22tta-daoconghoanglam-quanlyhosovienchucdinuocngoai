const db = require('../config/database');
const path = require('path');
const fs = require('fs');

// Helper to create notification
const createNotification = async (client, userId, title, content, type = 'INFO', path = '') => {
    try {
        await client.query(
            'INSERT INTO ThongBao (nguoi_dung_id, tieu_de, noi_dung, loai, duong_dan) VALUES ($1, $2, $3, $4, $5)',
            [userId, title, content, type, path]
        );
    } catch (error) {
        console.error('Create notification error:', error);
    }
};

// Helper to notify next processors in workflow
const notifyNextProcessors = async (client, recordId, nextStatus) => {
    try {
        // Get record owner's unit, name and user id
        const recordResult = await client.query(
            `SELECT vc.ma_don_vi, vc.ho_ten, hs.nguoi_tao 
       FROM HoSoDiNuocNgoai hs 
       JOIN VienChuc vc ON hs.ma_vien_chuc = vc.ma_vien_chuc 
       WHERE hs.ma_ho_so = $1`,
            [recordId]
        );

        if (recordResult.rows.length === 0) return;

        const { ma_don_vi, ho_ten, nguoi_tao } = recordResult.rows[0];
        let targetRoles = [];
        let targetUnit = null;
        let title = 'Hồ sơ mới cần xử lý';
        let content = `Có hồ sơ mới từ ${ho_ten} (${recordId}) đang chờ bạn xử lý.`;

        switch (nextStatus) {
            case 'CHO_DON_VI':
                targetRoles = ['TRUONG_DON_VI'];
                targetUnit = ma_don_vi;
                break;
            case 'CHO_CHI_BO':
                targetRoles = ['CHI_BO'];
                break;
            case 'CHO_DANG_UY':
                targetRoles = ['DANG_UY'];
                break;
            case 'CHO_TCNS':
                targetRoles = ['TCNS'];
                break;
            case 'CHO_BGH':
                targetRoles = ['BGH'];
                break;
            default:
                return; // No notification for other statuses
        }

        // Find users with these roles, excluding the owner
        let userQuery = `
      SELECT DISTINCT nd.id 
      FROM NguoiDung nd
      JOIN NguoiDungVaiTro ndvt ON nd.id = ndvt.nguoi_dung_id
      JOIN VienChuc vc ON nd.ma_vien_chuc = vc.ma_vien_chuc
      WHERE ndvt.ma_vai_tro = ANY($1) AND nd.id != $2
    `;
        let queryParams = [targetRoles, nguoi_tao];

        if (targetUnit) {
            userQuery += ` AND vc.ma_don_vi = $3`;
            queryParams.push(targetUnit);
        }

        const usersResult = await client.query(userQuery, queryParams);

        for (const user of usersResult.rows) {
            await createNotification(client, user.id, title, content, 'INFO', '/records');
        }
    } catch (error) {
        console.error('Notify next processors error:', error);
    }
};

// Helper to automatically skip steps if owner has the required role
const autoProcessSteps = async (client, recordId, ownerId, currentStatus, isDangVien) => {
    try {
        // Get owner's roles
        const rolesResult = await client.query(
            "SELECT ma_vai_tro FROM NguoiDungVaiTro WHERE nguoi_dung_id = $1",
            [ownerId]
        );
        const ownerRoles = rolesResult.rows.map(r => r.ma_vai_tro);

        let status = currentStatus;
        let changed = true;

        const statusToStep = {
            'CHO_DON_VI': 'TRUONG_DON_VI_DUYET',
            'CHO_CHI_BO': 'CHI_BO_DUYET',
            'CHO_DANG_UY': 'DANG_UY_DUYET',
            'CHO_TCNS': 'TCNS_DUYET',
            'CHO_BGH': 'BGH_DUYET'
        };

        while (changed) {
            changed = false;
            let nextStatus = status;

            if (status === 'CHO_DON_VI' && ownerRoles.includes('TRUONG_DON_VI')) {
                nextStatus = isDangVien ? 'CHO_CHI_BO' : 'CHO_TCNS';
            } else if (status === 'CHO_CHI_BO' && ownerRoles.includes('CHI_BO')) {
                nextStatus = 'CHO_DANG_UY';
            } else if (status === 'CHO_DANG_UY' && ownerRoles.includes('DANG_UY')) {
                nextStatus = 'CHO_TCNS';
            } else if (status === 'CHO_TCNS' && ownerRoles.includes('TCNS')) {
                nextStatus = 'CHO_BGH';
            } else if (status === 'CHO_BGH' && ownerRoles.includes('BGH')) {
                nextStatus = 'DA_DUYET';
            }

            if (nextStatus !== status) {
                const stepCode = statusToStep[status];
                // Log the auto-skip
                await client.query(
                    "INSERT INTO XuLyHoSo (ma_ho_so, buoc_xu_ly_id, nguoi_xu_ly, ket_qua, y_kien) VALUES ($1, (SELECT id FROM BuocXuLy WHERE ma_buoc = $2 LIMIT 1), $3, $4, $5)",
                    [recordId, stepCode, ownerId, 'APPROVED', 'Hệ thống tự động duyệt (Người nộp đồng thời là người có thẩm quyền)']
                );
                status = nextStatus;
                changed = true;
            }
        }

        return status;
    } catch (error) {
        console.error('Auto process steps error:', error);
        return currentStatus; // Fallback to current status on error
    }
};

// Helper to generate record ID
const generateRecordId = async () => {
    const date = new Date();
    const yearMonth = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const prefix = `HSNN-${yearMonth}-`;

    const result = await db.query(
        "SELECT ma_ho_so FROM HoSoDiNuocNgoai WHERE ma_ho_so LIKE $1 ORDER BY ma_ho_so DESC LIMIT 1",
        [`${prefix}%`]
    );

    let sequence = 1;
    if (result.rows.length > 0) {
        const lastId = result.rows[0].ma_ho_so;
        sequence = parseInt(lastId.split('-')[2]) + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
};

exports.createRecord = async (req, res) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        const {
            ma_loai_chuyen_di, ma_quoc_gia, tu_ngay, den_ngay,
            dia_diem_cu_the, noi_dung_cong_viec, nguon_kinh_phi, kinh_phi,
            submit_immediately
        } = req.body;

        const ma_vien_chuc = req.user.ma_vien_chuc;
        if (!ma_vien_chuc) {
            return res.status(400).json({ success: false, message: 'Tài khoản của bạn không gắn với mã viên chức. Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.' });
        }

        // Check if user is Dang Vien
        const dangVienResult = await client.query("SELECT 1 FROM DangVien WHERE ma_vien_chuc = $1", [ma_vien_chuc]);
        const isDangVien = dangVienResult.rows.length > 0;

        // Basic validation
        if (!ma_loai_chuyen_di || !ma_quoc_gia || !tu_ngay || !den_ngay || !noi_dung_cong_viec) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ các thông tin bắt buộc' });
        }

        let status = submit_immediately === 'true' ? 'CHO_DON_VI' : 'DRAFT';
        const ma_ho_so = await generateRecordId();

        // Auto-skip steps if submitted
        if (submit_immediately === 'true') {
            status = await autoProcessSteps(client, ma_ho_so, req.user.id, status, isDangVien);
        }

        const query = `
      INSERT INTO HoSoDiNuocNgoai (
        ma_ho_so, ma_vien_chuc, ma_loai_chuyen_di, ma_quoc_gia, 
        tu_ngay, den_ngay, dia_diem_cu_the, noi_dung_cong_viec, 
        nguon_kinh_phi, kinh_phi, ma_trang_thai, nguoi_tao, ngay_gui_ho_so
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `;

        const values = [
            ma_ho_so, ma_vien_chuc, ma_loai_chuyen_di, ma_quoc_gia,
            tu_ngay, den_ngay, dia_diem_cu_the, noi_dung_cong_viec,
            nguon_kinh_phi, kinh_phi || 0, status, req.user.id,
            submit_immediately === 'true' ? new Date() : null
        ];

        await client.query(query, values);

        // Notify next processors if submitted and not already finished
        if (submit_immediately === 'true' && status !== 'DA_DUYET') {
            await notifyNextProcessors(client, ma_ho_so, status);
        }

        // Handle file uploads
        if (req.files && req.files.length > 0) {
            const recordDir = path.join(__dirname, '../../uploads/ho-so-di-nuoc-ngoai', ma_ho_so);
            if (!fs.existsSync(recordDir)) {
                fs.mkdirSync(recordDir, { recursive: true });
            }

            for (const file of req.files) {
                const newPath = path.join(recordDir, file.filename);
                fs.renameSync(file.path, newPath);

                const relativePath = `ho-so-di-nuoc-ngoai/${ma_ho_so}/${file.filename}`;

                await client.query(
                    `INSERT INTO TaiLieuHoSo (ma_ho_so, ma_loai, ten_file, ten_file_goc, kich_thuoc, duong_dan, mime_type, nguoi_upload)
           VALUES ($1, 'DXP', $2, $3, $4, $5, $6, $7)`,
                    [ma_ho_so, file.filename, file.originalname, file.size, relativePath, file.mimetype, req.user.id]
                );
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ success: true, data: { ma_ho_so } });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create record error:', error);

        // Handle specific database errors
        let message = 'Lỗi khi tạo hồ sơ';
        if (error.message.includes('Hộ chiếu hết hạn')) {
            message = 'Hộ chiếu của bạn đã hết hạn trước ngày đi. Vui lòng cập nhật thông tin hộ chiếu.';
        } else if (error.message.includes('trùng với thời gian này')) {
            message = 'Bạn đã có một chuyến đi khác trùng với thời gian này.';
        } else if (error.message.includes('check_ngay_hop_le')) {
            message = 'Ngày đi phải trước ngày về.';
        }

        res.status(500).json({ success: false, message: error.message || message });
    } finally {
        client.release();
    }
};

exports.updateRecord = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { id } = req.params;
        const {
            ma_loai_chuyen_di, ma_quoc_gia, tu_ngay, den_ngay,
            dia_diem_cu_the, noi_dung_cong_viec, nguon_kinh_phi, kinh_phi,
            submit_immediately
        } = req.body;

        await client.query('BEGIN');

        // Check if record exists and belongs to user
        const recordResult = await client.query(
            "SELECT * FROM HoSoDiNuocNgoai WHERE ma_ho_so = $1 AND ma_vien_chuc = $2",
            [id, req.user.ma_vien_chuc]
        );

        if (recordResult.rows.length === 0) {
            throw new Error('Không tìm thấy hồ sơ hoặc bạn không có quyền chỉnh sửa');
        }

        const record = recordResult.rows[0];
        if (record.ma_trang_thai !== 'DRAFT' && record.ma_trang_thai !== 'YEU_CAU_BO_SUNG') {
            throw new Error('Hồ sơ đang trong quá trình xử lý, không thể chỉnh sửa');
        }

        // Check if user is Dang Vien
        const dangVienResult = await client.query("SELECT 1 FROM DangVien WHERE ma_vien_chuc = $1", [req.user.ma_vien_chuc]);
        const isDangVien = dangVienResult.rows.length > 0;

        let status = submit_immediately === 'true' ? 'CHO_DON_VI' : record.ma_trang_thai;

        // Auto-skip steps if submitted
        if (submit_immediately === 'true') {
            status = await autoProcessSteps(client, id, req.user.id, status, isDangVien);
        }

        const query = `
      UPDATE HoSoDiNuocNgoai SET
        ma_loai_chuyen_di = $1, ma_quoc_gia = $2, tu_ngay = $3, den_ngay = $4,
        dia_diem_cu_the = $5, noi_dung_cong_viec = $6, nguon_kinh_phi = $7, 
        kinh_phi = $8, ma_trang_thai = $9, nguoi_cap_nhat = $10, updated_at = CURRENT_TIMESTAMP,
        ngay_gui_ho_so = CASE WHEN $11 = 'true' AND ngay_gui_ho_so IS NULL THEN CURRENT_TIMESTAMP ELSE ngay_gui_ho_so END
      WHERE ma_ho_so = $12
      RETURNING *
    `;

        const values = [
            ma_loai_chuyen_di, ma_quoc_gia, tu_ngay, den_ngay,
            dia_diem_cu_the, noi_dung_cong_viec, nguon_kinh_phi,
            kinh_phi || 0, status, req.user.id, submit_immediately, id
        ];

        await client.query(query, values);

        // Notify next processors if submitted and not already finished
        if (submit_immediately === 'true' && status !== 'DA_DUYET') {
            await notifyNextProcessors(client, id, status);
        }

        // Handle file uploads (append new files)
        if (req.files && req.files.length > 0) {
            const recordDir = path.join(__dirname, '../../uploads/ho-so-di-nuoc-ngoai', id);
            if (!fs.existsSync(recordDir)) {
                fs.mkdirSync(recordDir, { recursive: true });
            }

            for (const file of req.files) {
                const newPath = path.join(recordDir, file.filename);
                fs.renameSync(file.path, newPath);
                const relativePath = `ho-so-di-nuoc-ngoai/${id}/${file.filename}`;

                await client.query(
                    `INSERT INTO TaiLieuHoSo (ma_ho_so, ma_loai, ten_file, ten_file_goc, kich_thuoc, duong_dan, mime_type, nguoi_upload)
           VALUES ($1, 'DXP', $2, $3, $4, $5, $6, $7)`,
                    [id, file.filename, file.originalname, file.size, relativePath, file.mimetype, req.user.id]
                );
            }
        }

        await client.query('COMMIT');
        res.json({ success: true, message: 'Cập nhật hồ sơ thành công' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Update record error:', error);
        res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
    } finally {
        client.release();
    }
};

exports.submitRecord = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { id } = req.params;
        await client.query('BEGIN');

        // Check if record exists and belongs to user
        const recordResult = await client.query(
            "SELECT * FROM HoSoDiNuocNgoai WHERE ma_ho_so = $1 AND ma_vien_chuc = $2",
            [id, req.user.ma_vien_chuc]
        );

        if (recordResult.rows.length === 0) {
            throw new Error('Không tìm thấy hồ sơ hoặc bạn không có quyền gửi hồ sơ này');
        }

        const record = recordResult.rows[0];
        if (record.ma_trang_thai !== 'DRAFT' && record.ma_trang_thai !== 'YEU_CAU_BO_SUNG') {
            throw new Error('Hồ sơ đã được gửi hoặc đang trong quá trình xử lý');
        }

        // Check if user is Dang Vien
        const dangVienResult = await client.query("SELECT 1 FROM DangVien WHERE ma_vien_chuc = $1", [req.user.ma_vien_chuc]);
        const isDangVien = dangVienResult.rows.length > 0;

        let status = 'CHO_DON_VI';
        
        // Auto-skip steps
        status = await autoProcessSteps(client, id, req.user.id, status, isDangVien);

        // Update status
        await client.query(
            "UPDATE HoSoDiNuocNgoai SET ma_trang_thai = $1, ngay_gui_ho_so = CURRENT_TIMESTAMP WHERE ma_ho_so = $2",
            [status, id]
        );

        // Notify next processors if not already finished
        if (status !== 'DA_DUYET') {
            await notifyNextProcessors(client, id, status);
        }

        await client.query('COMMIT');
        res.json({ success: true, message: 'Đã gửi hồ sơ thành công', status });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Submit record error:', error);
        res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
    } finally {
        client.release();
    }
};

exports.withdrawRecord = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { id } = req.params;
        await client.query('BEGIN');

        // Check if record exists and belongs to user
        const recordResult = await client.query(
            "SELECT * FROM HoSoDiNuocNgoai WHERE ma_ho_so = $1 AND ma_vien_chuc = $2",
            [id, req.user.ma_vien_chuc]
        );

        if (recordResult.rows.length === 0) {
            throw new Error('Không tìm thấy hồ sơ hoặc bạn không có quyền rút hồ sơ này');
        }

        const record = recordResult.rows[0];

        // Only allow withdrawal if status is a pending status
        const pendingStatuses = ['CHO_DON_VI', 'CHO_CHI_BO', 'CHO_DANG_UY', 'CHO_TCNS', 'CHO_BGH'];
        if (!pendingStatuses.includes(record.ma_trang_thai)) {
            throw new Error('Hồ sơ không ở trạng thái có thể rút (đã duyệt, bị từ chối hoặc đang là bản nháp)');
        }

        // Check if anyone else has processed it
        const logsResult = await client.query(
            "SELECT 1 FROM XuLyHoSo WHERE ma_ho_so = $1 AND nguoi_xu_ly != $2 LIMIT 1",
            [id, req.user.id]
        );

        if (logsResult.rows.length > 0) {
            throw new Error('Hồ sơ đã có người xử lý, không thể rút');
        }

        // Update status back to DRAFT
        await client.query(
            "UPDATE HoSoDiNuocNgoai SET ma_trang_thai = 'DRAFT', ngay_gui_ho_so = NULL WHERE ma_ho_so = $1",
            [id]
        );

        // Delete auto-skip logs to clean up
        await client.query(
            "DELETE FROM XuLyHoSo WHERE ma_ho_so = $1 AND nguoi_xu_ly = $2",
            [id, req.user.id]
        );

        await client.query('COMMIT');
        res.json({ success: true, message: 'Đã rút hồ sơ về trạng thái nháp' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Withdraw record error:', error);
        res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
    } finally {
        client.release();
    }
};

exports.getRecords = async (req, res) => {
    try {
        let query = `
      SELECT h.*, v.ho_ten, v.ma_don_vi as ma_don_vi_vien_chuc, l.ten_loai, q.ten_quoc_gia, t.ten_trang_thai
      FROM HoSoDiNuocNgoai h
      JOIN VienChuc v ON h.ma_vien_chuc = v.ma_vien_chuc
      JOIN LoaiChuyenDi l ON h.ma_loai_chuyen_di = l.ma_loai
      JOIN QuocGia q ON h.ma_quoc_gia = q.ma_quoc_gia
      JOIN TrangThaiHoSo t ON h.ma_trang_thai = t.ma_trang_thai
    `;

        const values = [];
        const conditions = [];

        // Filter by role with strict workflow visibility
        if (!req.user.roles.includes('ADMIN')) {
            const roleConditions = [];

            if (req.user.roles.includes('VIEN_CHUC')) {
                roleConditions.push(`h.ma_vien_chuc = $${values.length + 1}`);
                values.push(req.user.ma_vien_chuc);
            }

            if (req.user.roles.includes('TRUONG_DON_VI')) {
                roleConditions.push(`(v.ma_don_vi = $${values.length + 1} AND h.ma_trang_thai NOT IN ('DRAFT'))`);
                values.push(req.user.ma_don_vi);
            }

            if (req.user.roles.includes('CHI_BO')) {
                roleConditions.push(`h.ma_trang_thai IN ('CHO_CHI_BO', 'CHO_DANG_UY', 'CHO_TCNS', 'CHO_BGH', 'DA_DUYET', 'TU_CHOI', 'YEU_CAU_BO_SUNG')`);
            }

            if (req.user.roles.includes('DANG_UY')) {
                roleConditions.push(`h.ma_trang_thai IN ('CHO_DANG_UY', 'CHO_TCNS', 'CHO_BGH', 'DA_DUYET', 'TU_CHOI', 'YEU_CAU_BO_SUNG')`);
            }

            if (req.user.roles.includes('TCNS')) {
                roleConditions.push(`h.ma_trang_thai IN ('CHO_TCNS', 'CHO_BGH', 'DA_DUYET', 'TU_CHOI', 'YEU_CAU_BO_SUNG')`);
            }

            if (req.user.roles.includes('BGH')) {
                roleConditions.push(`h.ma_trang_thai IN ('CHO_BGH', 'DA_DUYET', 'TU_CHOI', 'YEU_CAU_BO_SUNG')`);
            }

            if (roleConditions.length > 0) {
                conditions.push(`(${roleConditions.join(' OR ')})`);
            } else {
                conditions.push('1=0'); // No access if no roles
            }
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY h.created_at DESC";

        const result = await db.query(query, values);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get records error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.getRecordById = async (req, res) => {
    try {
        const { id } = req.params;

        const recordResult = await db.query(
            `SELECT h.*, v.ho_ten, v.ma_don_vi, l.ten_loai, q.ten_quoc_gia, t.ten_trang_thai
       FROM HoSoDiNuocNgoai h
       JOIN VienChuc v ON h.ma_vien_chuc = v.ma_vien_chuc
       JOIN LoaiChuyenDi l ON h.ma_loai_chuyen_di = l.ma_loai
       JOIN QuocGia q ON h.ma_quoc_gia = q.ma_quoc_gia
       JOIN TrangThaiHoSo t ON h.ma_trang_thai = t.ma_trang_thai
       WHERE h.ma_ho_so = $1`,
            [id]
        );

        if (recordResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ' });
        }

        const record = recordResult.rows[0];

        // Security check for detail view
        if (!req.user.roles.includes('ADMIN')) {
            let hasAccess = false;

            if (req.user.roles.includes('VIEN_CHUC') && record.ma_vien_chuc === req.user.ma_vien_chuc) {
                hasAccess = true;
            }

            if (req.user.roles.includes('TRUONG_DON_VI') && record.ma_don_vi === req.user.ma_don_vi && record.ma_trang_thai !== 'DRAFT') {
                hasAccess = true;
            }

            const statusLevels = {
                'CHO_CHI_BO': ['CHI_BO'],
                'CHO_DANG_UY': ['CHI_BO', 'DANG_UY'],
                'CHO_TCNS': ['CHI_BO', 'DANG_UY', 'TCNS'],
                'CHO_BGH': ['CHI_BO', 'DANG_UY', 'TCNS', 'BGH'],
                'DA_DUYET': ['CHI_BO', 'DANG_UY', 'TCNS', 'BGH'],
                'TU_CHOI': ['CHI_BO', 'DANG_UY', 'TCNS', 'BGH'],
                'YEU_CAU_BO_SUNG': ['CHI_BO', 'DANG_UY', 'TCNS', 'BGH']
            };

            for (const [status, roles] of Object.entries(statusLevels)) {
                if (record.ma_trang_thai === status && roles.some(r => req.user.roles.includes(r))) {
                    hasAccess = true;
                    break;
                }
            }

            if (!hasAccess) {
                return res.status(403).json({ success: false, message: 'Bạn không có quyền xem hồ sơ này ở trạng thái hiện tại' });
            }
        }

        const filesResult = await db.query(
            "SELECT * FROM TaiLieuHoSo WHERE ma_ho_so = $1",
            [id]
        );

        const logsResult = await db.query(
            `SELECT x.*, u.ten_dang_nhap as nguoi_thuc_hien_ten, b.ten_buoc
       FROM XuLyHoSo x
       LEFT JOIN NguoiDung u ON x.nguoi_xu_ly = u.id
       LEFT JOIN BuocXuLy b ON x.buoc_xu_ly_id = b.id
       WHERE x.ma_ho_so = $1
       ORDER BY x.thoi_gian_xu_ly DESC`,
            [id]
        );

        res.json({
            success: true,
            data: {
                ...recordResult.rows[0],
                files: filesResult.rows,
                logs: logsResult.rows
            }
        });
    } catch (error) {
        console.error('Get record detail error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.processRecord = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { id } = req.params;
        const { action, y_kien } = req.body; // action: APPROVED, REJECTED, RETURNED

        await client.query('BEGIN');

        const recordResult = await client.query(
            "SELECT h.*, v.ma_don_vi, dv.ma_don_vi_dang FROM HoSoDiNuocNgoai h JOIN VienChuc v ON h.ma_vien_chuc = v.ma_vien_chuc LEFT JOIN DangVien dv ON v.ma_vien_chuc = dv.ma_vien_chuc WHERE h.ma_ho_so = $1",
            [id]
        );

        if (recordResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ' });
        }

        const record = recordResult.rows[0];

        // Security check: Cannot process own record
        if (record.ma_vien_chuc === req.user.ma_vien_chuc && !req.user.roles.includes('ADMIN')) {
            await client.query('ROLLBACK');
            return res.status(403).json({ success: false, message: 'Bạn không thể tự xử lý hồ sơ của chính mình' });
        }

        // Security check: Unit head can only process records from their unit
        if (req.user.roles.includes('TRUONG_DON_VI') && !req.user.roles.includes('ADMIN')) {
            if (record.ma_don_vi !== req.user.ma_don_vi) {
                await client.query('ROLLBACK');
                return res.status(403).json({ success: false, message: 'Bạn không có quyền xử lý hồ sơ của đơn vị khác' });
            }
        }

        const currentStatus = record.ma_trang_thai;
        let nextStatus = currentStatus;
        const isDangVien = !!record.ma_don_vi_dang;

        if (action === 'APPROVED') {
            switch (currentStatus) {
                case 'CHO_DON_VI':
                    nextStatus = isDangVien ? 'CHO_CHI_BO' : 'CHO_TCNS';
                    break;
                case 'CHO_CHI_BO':
                    nextStatus = 'CHO_DANG_UY';
                    break;
                case 'CHO_DANG_UY':
                    nextStatus = 'CHO_TCNS';
                    break;
                case 'CHO_TCNS':
                    nextStatus = 'CHO_BGH';
                    break;
                case 'CHO_BGH':
                    nextStatus = 'DA_DUYET';
                    break;
            }

            // Auto-skip further steps if owner has the required roles for next steps
            if (nextStatus !== 'DA_DUYET') {
                nextStatus = await autoProcessSteps(client, id, record.nguoi_tao, nextStatus, isDangVien);
            }
        } else if (action === 'REJECTED') {
            nextStatus = 'TU_CHOI';
        } else if (action === 'RETURNED') {
            nextStatus = 'YEU_CAU_BO_SUNG';
        }

        const ownerId = record.nguoi_tao;

        await client.query(
            "UPDATE HoSoDiNuocNgoai SET ma_trang_thai = $1, updated_at = CURRENT_TIMESTAMP WHERE ma_ho_so = $2",
            [nextStatus, id]
        );

        // Map status to step code
        const statusToStep = {
            'CHO_DON_VI': 'TRUONG_DON_VI_DUYET',
            'CHO_CHI_BO': 'CHI_BO_DUYET',
            'CHO_DANG_UY': 'DANG_UY_DUYET',
            'CHO_TCNS': 'TCNS_DUYET',
            'CHO_BGH': 'BGH_DUYET'
        };
        const stepCode = statusToStep[currentStatus];

        // Log processing
        const logResult = await client.query(
            "INSERT INTO XuLyHoSo (ma_ho_so, buoc_xu_ly_id, nguoi_xu_ly, ket_qua, y_kien) VALUES ($1, (SELECT id FROM BuocXuLy WHERE ma_buoc = $2 LIMIT 1), $3, $4, $5) RETURNING id",
            [id, stepCode, req.user.id, action, y_kien]
        );

        // Create notification for owner
        const statusNames = {
            'CHO_DON_VI': 'Chờ đơn vị duyệt',
            'CHO_CHI_BO': 'Chờ chi bộ duyệt',
            'CHO_DANG_UY': 'Chờ đảng ủy duyệt',
            'CHO_TCNS': 'Chờ TCNS duyệt',
            'CHO_BGH': 'Chờ BGH duyệt',
            'DA_DUYET': 'Đã duyệt hoàn tất',
            'TU_CHOI': 'Bị từ chối',
            'YEU_CAU_BO_SUNG': 'Yêu cầu bổ sung'
        };

        let notificationTitle = 'Cập nhật trạng thái hồ sơ';
        let notificationContent = `Hồ sơ ${id} của bạn đã được chuyển sang trạng thái: ${statusNames[nextStatus] || nextStatus}`;

        if (action === 'REJECTED') {
            notificationContent = `Hồ sơ ${id} của bạn đã bị từ chối.`;
        } else if (action === 'RETURNED') {
            notificationContent = `Hồ sơ ${id} của bạn được yêu cầu bổ sung thông tin. Ý kiến: ${y_kien}`;
        }

        await createNotification(client, ownerId, notificationTitle, notificationContent, 'INFO', '/records');

        // Notify next processors if approved and not finished
        if (action === 'APPROVED' && nextStatus !== 'DA_DUYET') {
            await notifyNextProcessors(client, id, nextStatus);
        }

        // Handle file uploads during processing (e.g., signed decision, recommendation letter)
        if (req.files && req.files.length > 0) {
            const recordDir = path.join(__dirname, '../../uploads/ho-so-di-nuoc-ngoai', id);
            if (!fs.existsSync(recordDir)) {
                fs.mkdirSync(recordDir, { recursive: true });
            }

            for (const file of req.files) {
                const newPath = path.join(recordDir, file.filename);
                fs.renameSync(file.path, newPath);
                const relativePath = `ho-so-di-nuoc-ngoai/${id}/${file.filename}`;

                // Determine document type based on role/step
                let ma_loai = 'CV'; // Default to Cong Van
                if (req.user.roles.includes('BGH')) ma_loai = 'QD'; // Quyet dinh

                await client.query(
                    `INSERT INTO TaiLieuHoSo (ma_ho_so, ma_loai, ten_file, ten_file_goc, kich_thuoc, duong_dan, mime_type, nguoi_upload, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [id, ma_loai, file.filename, file.originalname, file.size, relativePath, file.mimetype, req.user.id, JSON.stringify({ xu_ly_id: logResult.rows[0].id })]
                );
            }
        }

        await client.query('COMMIT');
        res.json({ success: true, message: 'Xử lý hồ sơ thành công', nextStatus });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Process record error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    } finally {
        client.release();
    }
};
