SET client_encoding = 'UTF8';

-- Thêm đơn vị cơ bản
INSERT INTO
    DonVi (
        ma_don_vi,
        ten_don_vi,
        cap_don_vi
    )
VALUES (
        'TVU',
        'Trường Đại học Trà Vinh',
        1
    ),
    (
        'P_TCNS',
        'Phòng Tổ chức Nhân sự',
        2
    ),
    (
        'K_CNTT',
        'Khoa Công nghệ Thông tin',
        2
    );

-- Thêm đơn vị đảng cơ bản
INSERT INTO
    DonViDang (
        ma_don_vi_dang,
        ten_don_vi_dang,
        cap_do,
        ma_don_vi
    )
VALUES (
        'DU_TRUONG',
        'Đảng ủy Trường Đại học Trà Vinh',
        'DANG_UY_TRUONG',
        'TVU'
    ),
    (
        'CB_CNTT',
        'Chi bộ Khoa Công nghệ Thông tin',
        'CHI_BO',
        'K_CNTT'
    );