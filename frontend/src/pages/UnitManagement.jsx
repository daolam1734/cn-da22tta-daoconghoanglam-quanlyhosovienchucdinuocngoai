import React, { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdBusiness } from 'react-icons/md';

const UnitManagement = () => {
    const [units, setUnits] = useState([
        { ma_don_vi: 'TVU', ten_don_vi: 'Trường Đại học Trà Vinh', cap_don_vi: 1, trang_thai: 'ACTIVE' },
        { ma_don_vi: 'P_TCNS', ten_don_vi: 'Phòng Tổ chức Nhân sự', cap_don_vi: 2, trang_thai: 'ACTIVE' },
        { ma_don_vi: 'K_CNTT', ten_don_vi: 'Khoa Công nghệ Thông tin', cap_don_vi: 2, trang_thai: 'ACTIVE' },
    ]);

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: '700' }}>Quản lý đơn vị</h1>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Quản lý cơ cấu tổ chức và các đơn vị trong trường</p>
                </div>
                <button className="btn btn-primary">
                    <MdAdd style={{ marginRight: '8px' }} />
                    Thêm đơn vị
                </button>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Mã đơn vị</th>
                                <th>Tên đơn vị</th>
                                <th>Cấp</th>
                                <th>Trạng thái</th>
                                <th style={{ textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {units.map(unit => (
                                <tr key={unit.ma_don_vi}>
                                    <td><span style={{ fontWeight: '600' }}>{unit.ma_don_vi}</span></td>
                                    <td>{unit.ten_don_vi}</td>
                                    <td><span className="badge" style={{ backgroundColor: '#f1f3f4', color: '#5f6368' }}>Cấp {unit.cap_don_vi}</span></td>
                                    <td>
                                        <span className="badge" style={{ backgroundColor: '#e6f4ea', color: '#137333' }}>{unit.trang_thai}</span>
                                    </td>
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

export default UnitManagement;
