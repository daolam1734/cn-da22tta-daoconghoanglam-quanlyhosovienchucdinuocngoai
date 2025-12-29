import React, { useState } from 'react';
import { MdAdd, MdEdit, MdSecurity } from 'react-icons/md';

const RoleManagement = () => {
    const [roles, setRoles] = useState([
        { ma_vai_tro: 'ADMIN', ten_vai_tro: 'Quản trị hệ thống', mo_ta: 'Toàn quyền quản trị' },
        { ma_vai_tro: 'VIEN_CHUC', ten_vai_tro: 'Viên chức', mo_ta: 'Người nộp hồ sơ' },
        { ma_vai_tro: 'TRUONG_DON_VI', ten_vai_tro: 'Trưởng đơn vị', mo_ta: 'Duyệt cấp đơn vị' },
        { ma_vai_tro: 'TCNS', ten_vai_tro: 'Phòng Tổ chức Nhân sự', mo_ta: 'Thẩm định hồ sơ' },
        { ma_vai_tro: 'BGH', ten_vai_tro: 'Ban Giám hiệu', mo_ta: 'Phê duyệt cuối cùng' },
    ]);

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: '700' }}>Quản lý vai trò</h1>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Quản lý các vai trò và quyền hạn trong hệ thống</p>
                </div>
                <button className="btn btn-primary">
                    <MdAdd style={{ marginRight: '8px' }} />
                    Thêm vai trò
                </button>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Mã vai trò</th>
                                <th>Tên vai trò</th>
                                <th>Mô tả</th>
                                <th style={{ textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map(role => (
                                <tr key={role.ma_vai_tro}>
                                    <td><span style={{ fontWeight: '600' }}>{role.ma_vai_tro}</span></td>
                                    <td>{role.ten_vai_tro}</td>
                                    <td>{role.mo_ta}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="btn btn-outline" style={{ padding: '4px 12px' }}>Sửa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RoleManagement;
