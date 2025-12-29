import React, { useEffect, useState } from 'react';
import userService from '../services/userService';
import roleService from '../services/roleService';
import { MdAdd, MdEdit, MdDelete, MdClose, MdPerson } from 'react-icons/md';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        ma_vien_chuc: '',
        roles: []
    });

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

    useEffect(() => {
        fetchUsers();
        fetchRoles();
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

    const handleRoleChange = (roleId) => {
        const updatedRoles = formData.roles.includes(roleId)
            ? formData.roles.filter(r => r !== roleId)
            : [...formData.roles, roleId];
        setFormData({ ...formData, roles: updatedRoles });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await userService.updateUser(editingUser.id, formData);
                alert('Cập nhật người dùng thành công!');
            } else {
                await userService.createUser(formData);
                alert('Tạo người dùng thành công!');
            }
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            alert('Có lỗi xảy ra: ' + error.message);
        }
    };

    if (loading) return <div className="page-container">Đang tải danh sách người dùng...</div>;

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: '700' }}>Quản lý người dùng</h1>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Quản lý tài khoản và phân quyền hệ thống</p>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <MdAdd style={{ marginRight: '8px' }} />
                    Thêm người dùng
                </button>
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
                                            {user.trang_thai === 'ACTIVE' ? 'Hoạt động' : user.trang_thai}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="btn btn-outline" style={{ padding: '4px 12px' }} onClick={() => handleOpenModal(user)}>Sửa</button>
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
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{editingUser ? 'Chỉnh sửa vai trò' : 'Thêm người dùng mới'}</h3>
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
                                        disabled={!!editingUser}
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                                {!editingUser && (
                                    <div className="form-group">
                                        <label>Mật khẩu</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            required
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                )}
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
        </div>
    );
};

export default UserManagement;

