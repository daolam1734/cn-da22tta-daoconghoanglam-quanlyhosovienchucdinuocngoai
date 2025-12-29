SET client_encoding = 'UTF8';

-- Cập nhật danh mục trạng thái hồ sơ theo quy trình mới
DELETE FROM TrangThaiHoSo;

INSERT INTO
    TrangThaiHoSo (
        ma_trang_thai,
        ten_trang_thai,
        nhom_trang_thai,
        thu_tu
    )
VALUES ('DRAFT', 'Nháp', 'DRAFT', 0),
    (
        'CHO_DON_VI',
        'Chờ đơn vị cho ý kiến',
        'PENDING',
        1
    ),
    (
        'CHO_CHI_BO',
        'Chờ Chi bộ xem xét',
        'PROCESSING',
        2
    ),
    (
        'CHO_DANG_UY',
        'Chờ Đảng ủy quyết định',
        'PROCESSING',
        3
    ),
    (
        'CHO_TCNS',
        'Chờ Phòng TCNS cho ý kiến',
        'PROCESSING',
        4
    ),
    (
        'CHO_BGH',
        'Chờ BGH ra quyết định',
        'PROCESSING',
        5
    ),
    (
        'DA_DUYET',
        'Đã phê duyệt (BGH ký)',
        'COMPLETED',
        6
    ),
    (
        'TU_CHOI',
        'Từ chối',
        'COMPLETED',
        7
    ),
    (
        'YEU_CAU_BO_SUNG',
        'Yêu cầu bổ sung',
        'PROCESSING',
        8
    ),
    (
        'DA_HUY',
        'Đã hủy',
        'CANCELLED',
        9
    );

-- Cập nhật vai trò hệ thống
DELETE FROM VaiTro;

INSERT INTO
    VaiTro (
        ma_vai_tro,
        ten_vai_tro,
        mo_ta
    )
VALUES (
        'ADMIN',
        'Quản trị hệ thống',
        'Toàn quyền quản trị'
    ),
    (
        'VIEN_CHUC',
        'Viên chức',
        'Người nộp hồ sơ'
    ),
    (
        'TRUONG_DON_VI',
        'Trưởng đơn vị',
        'Duyệt cấp đơn vị'
    ),
    (
        'CHI_BO',
        'Chi bộ',
        'Duyệt cấp Chi bộ (cho Đảng viên)'
    ),
    (
        'DANG_UY',
        'Đảng ủy',
        'Duyệt cấp Đảng ủy (cho Đảng viên)'
    ),
    (
        'TCNS',
        'Phòng Tổ chức Nhân sự',
        'Thẩm định hồ sơ'
    ),
    (
        'BGH',
        'Ban Giám hiệu',
        'Phê duyệt cuối cùng'
    );

-- Cập nhật LuongXuLy mẫu cho quy trình chuẩn
DELETE FROM LuongXuLy;

INSERT INTO
    LuongXuLy (ma_luong, ten_luong, mo_ta)
VALUES (
        'QUY_TRINH_CHINH',
        'Quy trình phê duyệt hồ sơ đi nước ngoài',
        'Quy trình chuẩn từ Viên chức đến BGH'
    );

-- Cập nhật BuocXuLy cho quy trình chuẩn
DELETE FROM BuocXuLy;

INSERT INTO
    BuocXuLy (
        ma_luong,
        thu_tu,
        ten_buoc,
        ma_buoc,
        loai_xu_ly
    )
VALUES (
        'QUY_TRINH_CHINH',
        1,
        'Trưởng đơn vị cho ý kiến',
        'TRUONG_DON_VI_DUYET',
        'HANH_CHINH'
    ),
    (
        'QUY_TRINH_CHINH',
        2,
        'Chi bộ xem xét',
        'CHI_BO_DUYET',
        'DANG'
    ),
    (
        'QUY_TRINH_CHINH',
        3,
        'Đảng ủy quyết định',
        'DANG_UY_DUYET',
        'DANG'
    ),
    (
        'QUY_TRINH_CHINH',
        4,
        'Phòng TCNS cho ý kiến',
        'TCNS_DUYET',
        'HANH_CHINH'
    ),
    (
        'QUY_TRINH_CHINH',
        5,
        'BGH ra quyết định',
        'BGH_DUYET',
        'HANH_CHINH'
    );