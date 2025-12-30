import React, { useEffect, useState } from 'react';
import userService from '../services/userService';
import roleService from '../services/roleService';
import unitService from '../services/unitService';
import { useToast } from '../contexts/ToastContext';
import { MdAdd, MdEdit, MdDelete, MdClose, MdPerson, MdFlashOn, MdContentCopy, MdLock, MdLockOpen } from 'react-icons/md';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [units, setUnits] = useState([]);
    const [partyUnits, setPartyUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showQuickModal, setShowQuickModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        ma_vien_chuc: '',
        roles: []
    });

    const [quickFormData, setQuickFormData] = useState({
        ho_ten: '',
        ma_don_vi: '',
        email: '',
        roles: ['VIEN_CHUC'],
        la_dang_vien: false,
        ma_don_vi_dang: '',
        ngay_vao_dang: ''
    });
    const [quickResult, setQuickResult] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        const result = await userService.getUsers();
        if (result.success) {
            setUsers(result.data);
        }
        setLoading(false);
    };

    const fetchRoles = async () => {
        const result = await roleService.getRoles();
        if (result.success) {
            setRoles(result.data);
        }
    };

    const fetchUnits = async () => {
        const [uRes, pRes] = await Promise.all([
            unitService.getUnits(),
            unitService.getPartyUnits()
        ]);
        if (uRes.success) setUnits(uRes.data);
        if (pRes.success) setPartyUnits(pRes.data);
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
        fetchUnits();
    }, []);

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.ten_dang_nhap,
                password: '', // Don't show password
                email: user.email || '',
                ma_vien_chuc: user.ma_vien_chuc || '',
                roles: user.roles || []
            });
        } else {
            setEditingUser(null);
            setFormData({
                username: '',
                password: '',
                email: '',
                ma_vien_chuc: '',
                roles: []
            });
        }
        setShowModal(true);
    };

    const handleOpenQuickModal = () => {
        setQuickFormData({
            ho_ten: '',
            ma_don_vi: '',
            email: '',
            roles: ['VIEN_CHUC'],
            la_dang_vien: false,
            ma_don_vi_dang: '',
            ngay_vao_dang: ''
        });
        setQuickResult(null);
        setShowQuickModal(true);
    };

    const handleRoleChange = (roleId) => {
        const updatedRoles = formData.roles.includes(roleId)
            ? formData.roles.filter(r => r !== roleId)
            : [...formData.roles, roleId];
        setFormData({ ...formData, roles: updatedRoles });
    };

    const handleQuickRoleChange = (roleId) => {
        const updatedRoles = quickFormData.roles.includes(roleId)
            ? quickFormData.roles.filter(r => r !== roleId)
            : [...quickFormData.roles, roleId];
        setQuickFormData({ ...quickFormData, roles: updatedRoles });
    };

    const handleToggleStatus = async (user) => {
        const newStatus = user.trang_thai === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
        const confirmMsg = user.trang_thai === 'ACTIVE' 
            ? `Bạn có chắc chắn muốn khóa tài khoản ${user.ten_dang_nhap}?` 
            : `Bạn có chắc chắn muốn mở khóa tài khoản ${user.ten_dang_nhap}?`;
        
        if (window.confirm(confirmMsg)) {
            try {
                const result = await userService.updateUserStatus(user.id, newStatus);
                if (result.success) {
                    showToast(`${user.trang_thai === 'ACTIVE' ? 'Khóa' : 'Mở khóa'} tài khoản thành công`);
                    fetchUsers();
                } else {
                    showToast(result.message, 'error');
                }
            } catch (error) {
                showToast('Có lỗi xảy ra: ' + error.message, 'error');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                const result = await userService.updateUser(editingUser.id, formData);
                if (result.success) {
                    showToast('Cập nhật người dùng thành công!');
                    setShowModal(false);
                    fetchUsers();
                } else {
                    showToast(result.message, 'error');
                }
            }
        } catch (error) {
            showToast('Có lỗi xảy ra: ' + error.message, 'error');
        }
    };

    const handleQuickSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await userService.quickCreateUser(quickFormData);
            if (result.success) {
                setQuickResult(result.data);
                showToast('Tạo tài khoản thành công!');
                fetchUsers();
            } else {
                showToast(result.message, 'error');
            }
        } catch (error) {
            showToast('Có lỗi xảy ra: ' + error.message, 'error');
        }
    };

    if (loading) return <div className="page-container">Đang tải danh sách người dùng...</div>;

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="page-title">Quản lý người dùng</h1>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Quản lý tài khoản và phân quyền hệ thống</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-primary" onClick={handleOpenQuickModal}>
                        <MdFlashOn style={{ marginRight: '8px' }} />
                        Thêm người dùng mới
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Tên đăng nhập</th>
                                <th>Họ tên</th>
                                <th>Email</th>
                                <th>Vai trò</th>
                                <th>Trạng thái</th>
                                <th style={{ textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td><span style={{ fontWeight: '600' }}>{user.ten_dang_nhap}</span></td>
                                    <td>{user.ho_ten || 'N/A'}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                            {user.roles.map(role => (
                                                <span key={role} className="badge" style={{ backgroundColor: '#e8f0fe', color: '#1a73e8', border: '1px solid #d2e3fc' }}>
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${user.trang_thai === 'ACTIVE' ? 'badge-success' : 'badge-draft'}`}>
                                            {user.trang_thai === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button 
                                                className="btn btn-outline" 
                                                style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }} 
                                                onClick={() => handleOpenModal(user)}
                                                title="Sửa vai trò"
                                            >
                                                <MdEdit size={16} />
                                                Sửa
                                            </button>
                                            <button 
                                                className={`btn ${user.trang_thai === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                                style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px', minWidth: '100px', justifyContent: 'center' }} 
                                                onClick={() => handleToggleStatus(user)}
                                                title={user.trang_thai === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                            >
                                                {user.trang_thai === 'ACTIVE' ? (
                                                    <>
                                                        <MdLock size={16} />
                                                        Khóa
                                                    </>
                                                ) : (
                                                    <>
                                                        <MdLockOpen size={16} />
                                                        Mở khóa
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Chỉnh sửa thông tin & Vai trò</h3>
                            <button className="btn-icon" onClick={() => setShowModal(false)}><MdClose size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Tên đăng nhập</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        disabled
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Mã viên chức</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        disabled
                                        value={formData.ma_vien_chuc}
                                        onChange={e => setFormData({ ...formData, ma_vien_chuc: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label style={{ marginBottom: '12px', display: 'block' }}>Vai trò (Có thể chọn nhiều)</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        {roles.map(role => (
                                            <label key={role.ma_vai_tro} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.roles.includes(role.ma_vai_tro)}
                                                    onChange={() => handleRoleChange(role.ma_vai_tro)}
                                                />
                                                {role.ten_vai_tro}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showQuickModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Thêm người dùng nhanh</h3>
                            <button className="btn-icon" onClick={() => setShowQuickModal(false)}><MdClose size={24} /></button>
                        </div>
                        {!quickResult ? (
                            <form onSubmit={handleQuickSubmit}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Họ và tên <span style={{ color: 'red' }}>*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            value={quickFormData.ho_ten}
                                            onChange={e => setQuickFormData({ ...quickFormData, ho_ten: e.target.value })}
                                            placeholder="Nguyễn Văn A"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Đơn vị công tác <span style={{ color: 'red' }}>*</span></label>
                                        <select
                                            className="form-control"
                                            required
                                            value={quickFormData.ma_don_vi}
                                            onChange={e => setQuickFormData({ ...quickFormData, ma_don_vi: e.target.value })}
                                        >
                                            <option value="">-- Chọn đơn vị --</option>
                                            {units.map(u => (
                                                <option key={u.ma_don_vi} value={u.ma_don_vi}>{u.ten_don_vi}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={quickFormData.email}
                                            onChange={e => setQuickFormData({ ...quickFormData, email: e.target.value })}
                                            placeholder="email@tvu.edu.vn"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={quickFormData.la_dang_vien}
                                                onChange={e => setQuickFormData({ ...quickFormData, la_dang_vien: e.target.checked })}
                                            />
                                            Là Đảng viên
                                        </label>
                                    </div>
                                    {quickFormData.la_dang_vien && (
                                        <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '16px' }}>
                                            <div className="form-group">
                                                <label>Chi bộ/Đảng bộ <span style={{ color: 'red' }}>*</span></label>
                                                <select
                                                    className="form-control"
                                                    required={quickFormData.la_dang_vien}
                                                    value={quickFormData.ma_don_vi_dang}
                                                    onChange={e => setQuickFormData({ ...quickFormData, ma_don_vi_dang: e.target.value })}
                                                >
                                                    <option value="">-- Chọn đơn vị Đảng --</option>
                                                    {partyUnits.map(u => (
                                                        <option key={u.ma_don_vi_dang} value={u.ma_don_vi_dang}>{u.ten_don_vi_dang}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Ngày vào Đảng</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={quickFormData.ngay_vao_dang}
                                                    onChange={e => setQuickFormData({ ...quickFormData, ngay_vao_dang: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label>Vai trò hệ thống</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                            {roles.map(role => (
                                                <label key={role.ma_vai_tro} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={quickFormData.roles.includes(role.ma_vai_tro)}
                                                        onChange={() => handleQuickRoleChange(role.ma_vai_tro)}
                                                    />
                                                    {role.ten_vai_tro}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-outline" onClick={() => setShowQuickModal(false)}>Hủy</button>
                                    <button type="submit" className="btn btn-primary">Tạo tài khoản</button>
                                </div>
                            </form>
                        ) : (
                            <div className="modal-body">
                                <div style={{ textAlign: 'center', padding: '24px' }}>
                                    <div style={{ width: '64px', height: '64px', backgroundColor: '#e6fffa', color: '#38a169', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                        <MdPerson size={32} />
                                    </div>
                                    <h4 style={{ marginBottom: '8px' }}>Tạo tài khoản thành công!</h4>
                                    <p className="text-muted">Vui lòng cung cấp thông tin sau cho viên chức:</p>
                                    
                                    <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', textAlign: 'left', marginTop: '24px' }}>
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{ fontSize: '0.8rem', color: '#718096', display: 'block' }}>Tên đăng nhập</label>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <code style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{quickResult.ten_dang_nhap}</code>
                                                <button type="button" className="btn-icon" onClick={() => {
                                                    navigator.clipboard.writeText(quickResult.ten_dang_nhap);
                                                    showToast('Đã copy tên đăng nhập');
                                                }} title="Copy"><MdContentCopy /></button>
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#718096', display: 'block' }}>Mật khẩu mặc định</label>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <code style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{quickResult.mat_khau}</code>
                                                <button type="button" className="btn-icon" onClick={() => {
                                                    navigator.clipboard.writeText(quickResult.mat_khau);
                                                    showToast('Đã copy mật khẩu');
                                                }} title="Copy"><MdContentCopy /></button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button className="btn btn-primary" style={{ marginTop: '32px', width: '100%' }} onClick={() => setShowQuickModal(false)}>Đóng</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;

