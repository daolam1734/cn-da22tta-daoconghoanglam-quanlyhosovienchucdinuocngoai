const db = require('../config/database');

exports.getStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const maVienChuc = req.user.ma_vien_chuc;
        const roles = req.user.roles;

        let stats = [];
        let recentActivities = [];

        if (roles.includes('ADMIN')) {
            // Admin stats: Total everything
            const totalUsers = await db.query("SELECT COUNT(*) FROM NguoiDung");
            const totalRecords = await db.query("SELECT COUNT(*) FROM HoSoDiNuocNgoai");
            const pendingRecords = await db.query("SELECT COUNT(*) FROM HoSoDiNuocNgoai WHERE ma_trang_thai NOT IN ('DA_DUYET', 'TU_CHOI', 'DRAFT')");

            stats = [
                { label: 'Tổng người dùng', value: totalUsers.rows[0].count, color: '#4285f4' },
                { label: 'Tổng hồ sơ', value: totalRecords.rows[0].count, color: '#0f9d58' },
                { label: 'Hồ sơ đang xử lý', value: pendingRecords.rows[0].count, color: '#f4b400' },
                { label: 'Đơn vị', value: '3', color: '#db4437' }
            ];
        }
        else if (roles.includes('VIEN_CHUC')) {
            // Vien Chuc stats: My records
            const myRecords = await db.query("SELECT ma_trang_thai, COUNT(*) FROM HoSoDiNuocNgoai WHERE ma_vien_chuc = $1 GROUP BY ma_trang_thai", [maVienChuc]);

            const counts = {
                'DRAFT': 0,
                'PENDING': 0,
                'COMPLETED': 0,
                'REJECTED': 0
            };

            myRecords.rows.forEach(row => {
                if (row.ma_trang_thai === 'DRAFT') counts.DRAFT = row.count;
                else if (['DA_DUYET', 'DA_HOAN_THANH'].includes(row.ma_trang_thai)) counts.COMPLETED = row.count;
                else if (row.ma_trang_thai === 'TU_CHOI') counts.REJECTED = row.count;
                else counts.PENDING += parseInt(row.count);
            });

            stats = [
                { label: 'Hồ sơ nháp', value: counts.DRAFT, color: '#5f6368' },
                { label: 'Đang chờ duyệt', value: counts.PENDING, color: '#f4b400' },
                { label: 'Đã phê duyệt', value: counts.COMPLETED, color: '#0f9d58' },
                { label: 'Bị từ chối', value: counts.REJECTED, color: '#db4437' }
            ];
        }
        else {
            // Manager roles (TRUONG_DON_VI, TCNS, BGH, etc.)
            // Count records currently at their stage
            let statusFilter = '';
            let unitFilter = '';
            let queryParams = [];

            if (roles.includes('TRUONG_DON_VI')) {
                statusFilter = 'CHO_DON_VI';
                unitFilter = 'AND v.ma_don_vi = $2';
                queryParams = [statusFilter, req.user.ma_don_vi];
            } else {
                if (roles.includes('CHI_BO')) statusFilter = 'CHO_CHI_BO';
                else if (roles.includes('DANG_UY')) statusFilter = 'CHO_DANG_UY';
                else if (roles.includes('TCNS')) statusFilter = 'CHO_TCNS';
                else if (roles.includes('BGH')) statusFilter = 'CHO_BGH';
                queryParams = [statusFilter];
            }

            const pendingForMe = await db.query(
                `SELECT COUNT(*) FROM HoSoDiNuocNgoai h 
         JOIN VienChuc v ON h.ma_vien_chuc = v.ma_vien_chuc 
         WHERE h.ma_trang_thai = $1 ${unitFilter} AND h.ma_vien_chuc != $${queryParams.length + 1}`,
                [...queryParams, maVienChuc]
            );
            const totalProcessed = await db.query("SELECT COUNT(*) FROM XuLyHoSo WHERE nguoi_xu_ly = $1", [userId]);

            stats = [
                { label: 'Cần tôi xử lý', value: pendingForMe.rows[0].count, color: '#d93025' },
                { label: 'Đã xử lý', value: totalProcessed.rows[0].count, color: '#1a73e8' },
                { label: 'Hồ sơ đơn vị', value: '...', color: '#5f6368' },
                { label: 'Thông báo mới', value: '0', color: '#f4b400' }
            ];
        }

        // Common: Recent activities (last 5 processing steps)
        let activityQuery = `
            SELECT x.*, h.ma_ho_so, v.ho_ten as nguoi_di, t.ten_trang_thai
            FROM XuLyHoSo x
            JOIN HoSoDiNuocNgoai h ON x.ma_ho_so = h.ma_ho_so
            JOIN VienChuc v ON h.ma_vien_chuc = v.ma_vien_chuc
            JOIN TrangThaiHoSo t ON h.ma_trang_thai = t.ma_trang_thai
        `;
        let activityParams = [];

        if (!roles.includes('ADMIN')) {
            // Non-admin: Only see their own actions
            activityQuery += ` WHERE x.nguoi_xu_ly = $1 `;
            activityParams = [userId];
        }

        activityQuery += ` ORDER BY x.created_at DESC LIMIT 5 `;
        
        const activities = await db.query(activityQuery, activityParams);
        recentActivities = activities.rows.map(act => ({
            id: act.id,
            title: `Hồ sơ ${act.ma_ho_so}`,
            description: `${act.nguoi_di}: ${act.ten_trang_thai}`,
            time: act.created_at
        }));

        res.json({
            success: true,
            data: {
                stats,
                recentActivities
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};
