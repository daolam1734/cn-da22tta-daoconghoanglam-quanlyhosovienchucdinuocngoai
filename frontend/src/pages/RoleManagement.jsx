import React, { useState, useEffect } from 'react';
import roleService from '../services/roleService';
import { MdAdd, MdEdit, MdDelete, MdSecurity, MdClose, MdSave } from 'react-icons/md';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [formData, setFormData] = useState({
        ma_vai_tro: '',
        ten_vai_tro: '',
        mo_ta: ''
    });

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const result = await roleService.getRoles();
            if (result.success) {
                setRoles(result.data);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleOpenModal = (role = null) => {
        if (role) {
            setEditingRole(role);
            setFormData({
                ma_vai_tro: role.ma_vai_tro,
                ten_vai_tro: role.ten_vai_tro,
                mo_ta: role.mo_ta || ''
            });
        } else {
            setEditingRole(null);
            setFormData({
                ma_vai_tro: '',
                ten_vai_tro: '',
                mo_ta: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let result;
            if (editingRole) {
                result = await roleService.updateRole(editingRole.ma_vai_tro, formData);
            } else {
                result = await roleService.createRole(formData);
            }

            if (result.success) {
                setShowModal(false);
                fetchRoles();
                alert(result.message);
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('Lỗi khi lưu vai trò');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa vai trò ${id}?`)) {
            try {
                const result = await roleService.deleteRole(id);
                if (result.success) {
                    fetchRoles();
                    alert(result.message);
                } else {
                    alert(result.message);
                }
            } catch (error) {
                alert('Lỗi khi xóa vai trò');
            }
        }
    };

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <MdSecurity /> Quản lý vai trò
                    </h1>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Quản lý các vai trò và quyền hạn trong hệ thống</p>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
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
                            {loading ? (
                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>Đang tải dữ liệu...</td></tr>
                            ) : (
                                roles.map(role => (
                                    <tr key={role.ma_vai_tro}>
                                        <td><span style={{ fontWeight: '600' }}>{role.ma_vai_tro}</span></td>
                                        <td>{role.ten_vai_tro}</td>
                                        <td>{role.mo_ta}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button className="btn-icon" onClick={() => handleOpenModal(role)} style={{ color: '#1a73e8' }}>
                                                    <MdEdit size={20} />
                                                </button>
                                                <button className="btn-icon" onClick={() => handleDelete(role.ma_vai_tro)} style={{ color: '#d93025' }}>
                                                    <MdDelete size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3>{editingRole ? 'Cập nhật vai trò' : 'Thêm vai trò mới'}</h3>
                            <button className="btn-icon" onClick={() => setShowModal(false)}><MdClose size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Mã vai trò</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        required 
                                        disabled={!!editingRole}
                                        value={formData.ma_vai_tro}
                                        onChange={e => setFormData({...formData, ma_vai_tro: e.target.value.toUpperCase()})}
                                        placeholder="VD: ADMIN, VIEN_CHUC..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tên vai trò</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        required 
                                        value={formData.ten_vai_tro}
                                        onChange={e => setFormData({...formData, ten_vai_tro: e.target.value})}
                                        placeholder="VD: Quản trị hệ thống"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Mô tả</label>
                                    <textarea 
                                        className="form-control" 
                                        rows="3"
                                        value={formData.mo_ta}
                                        onChange={e => setFormData({...formData, mo_ta: e.target.value})}
                                        placeholder="Mô tả chi tiết về vai trò này..."
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <MdSave /> {editingRole ? 'Cập nhật' : 'Lưu lại'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleManagement;
