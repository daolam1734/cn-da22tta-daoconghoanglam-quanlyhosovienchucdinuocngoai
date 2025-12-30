import React, { useState, useEffect } from 'react';
import unitService from '../services/unitService';
import { MdAdd, MdEdit, MdDelete, MdBusiness, MdClose, MdSave, MdFlag } from 'react-icons/md';

const UnitManagement = () => {
    const [units, setUnits] = useState([]);
    const [partyUnits, setPartyUnits] = useState([]);
    const [activeTab, setActiveTab] = useState('regular'); // 'regular' or 'party'
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        ma_don_vi: '',
        ten_don_vi: '',
        ma_don_vi_cha: '',
        cap_don_vi: 1,
        trang_thai: 'ACTIVE'
    });
    const [partyFormData, setPartyFormData] = useState({
        ma_don_vi_dang: '',
        ten_don_vi_dang: '',
        cap_do: 'CHI_BO',
        ma_don_vi: '',
        trang_thai: 'ACTIVE'
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [unitsRes, partyRes] = await Promise.all([
                unitService.getUnits(),
                unitService.getPartyUnits()
            ]);
            if (unitsRes.success) setUnits(unitsRes.data);
            if (partyRes.success) setPartyUnits(partyRes.data);
        } catch (error) {
            console.error('Error fetching units:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (item = null) => {
        if (activeTab === 'regular') {
            if (item) {
                setEditingItem(item);
                setFormData({
                    ma_don_vi: item.ma_don_vi,
                    ten_don_vi: item.ten_don_vi,
                    ma_don_vi_cha: item.ma_don_vi_cha || '',
                    cap_don_vi: item.cap_don_vi,
                    trang_thai: item.trang_thai
                });
            } else {
                setEditingItem(null);
                setFormData({
                    ma_don_vi: '',
                    ten_don_vi: '',
                    ma_don_vi_cha: '',
                    cap_don_vi: 1,
                    trang_thai: 'ACTIVE'
                });
            }
        } else {
            if (item) {
                setEditingItem(item);
                setPartyFormData({
                    ma_don_vi_dang: item.ma_don_vi_dang,
                    ten_don_vi_dang: item.ten_don_vi_dang,
                    cap_do: item.cap_do || 'CHI_BO',
                    ma_don_vi: item.ma_don_vi || '',
                    trang_thai: item.trang_thai
                });
            } else {
                setEditingItem(null);
                setPartyFormData({
                    ma_don_vi_dang: '',
                    ten_don_vi_dang: '',
                    cap_do: 'CHI_BO',
                    ma_don_vi: '',
                    trang_thai: 'ACTIVE'
                });
            }
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (activeTab === 'regular') {
                if (editingItem) {
                    res = await unitService.updateUnit(editingItem.ma_don_vi, formData);
                } else {
                    res = await unitService.createUnit(formData);
                }
            } else {
                if (editingItem) {
                    res = await unitService.updatePartyUnit(editingItem.ma_don_vi_dang, partyFormData);
                } else {
                    res = await unitService.createPartyUnit(partyFormData);
                }
            }

            if (res.success) {
                setShowModal(false);
                fetchData();
            } else {
                alert(res.message);
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Lỗi khi lưu dữ liệu');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa mục này?')) return;
        try {
            let res;
            if (activeTab === 'regular') {
                res = await unitService.deleteUnit(id);
            } else {
                res = await unitService.deletePartyUnit(id);
            }

            if (res.success) {
                alert(res.message);
                fetchData();
            } else {
                alert(res.message);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Lỗi khi xóa dữ liệu');
        }
    };

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <MdBusiness /> Quản lý đơn vị
                    </h1>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Quản lý cơ cấu tổ chức và các đơn vị trong trường</p>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <MdAdd style={{ marginRight: '8px' }} />
                    Thêm {activeTab === 'regular' ? 'đơn vị' : 'đơn vị Đảng'}
                </button>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button 
                    className={`btn ${activeTab === 'regular' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('regular')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <MdBusiness /> Đơn vị chính quyền
                </button>
                <button 
                    className={`btn ${activeTab === 'party' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('party')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <MdFlag /> Đơn vị Đảng
                </button>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            {activeTab === 'regular' ? (
                                <tr>
                                    <th>Mã đơn vị</th>
                                    <th>Tên đơn vị</th>
                                    <th>Cấp</th>
                                    <th>Trạng thái</th>
                                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th>Mã đơn vị Đảng</th>
                                    <th>Tên đơn vị Đảng</th>
                                    <th>Trạng thái</th>
                                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>Đang tải dữ liệu...</td></tr>
                            ) : (
                                activeTab === 'regular' ? (
                                    units.map(unit => (
                                        <tr key={unit.ma_don_vi}>
                                            <td><span style={{ fontWeight: '600' }}>{unit.ma_don_vi}</span></td>
                                            <td>{unit.ten_don_vi}</td>
                                            <td><span className="badge" style={{ backgroundColor: '#f1f3f4', color: '#5f6368' }}>Cấp {unit.cap_don_vi}</span></td>
                                            <td>
                                                <span className="badge" style={{ 
                                                    backgroundColor: unit.trang_thai === 'ACTIVE' ? '#e6f4ea' : '#fce8e6', 
                                                    color: unit.trang_thai === 'ACTIVE' ? '#137333' : '#d93025' 
                                                }}>
                                                    {unit.trang_thai}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button className="btn btn-outline" style={{ padding: '4px 12px', marginRight: '8px' }} onClick={() => handleOpenModal(unit)}>Sửa</button>
                                                <button className="btn btn-outline" style={{ padding: '4px 12px', color: '#d93025', borderColor: '#d93025' }} onClick={() => handleDelete(unit.ma_don_vi)}>Xóa</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    partyUnits.map(unit => (
                                        <tr key={unit.ma_don_vi_dang}>
                                            <td><span style={{ fontWeight: '600' }}>{unit.ma_don_vi_dang}</span></td>
                                            <td>{unit.ten_don_vi_dang}</td>
                                            <td>
                                                <span className="badge" style={{ 
                                                    backgroundColor: unit.trang_thai === 'ACTIVE' ? '#e6f4ea' : '#fce8e6', 
                                                    color: unit.trang_thai === 'ACTIVE' ? '#137333' : '#d93025' 
                                                }}>
                                                    {unit.trang_thai}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button className="btn btn-outline" style={{ padding: '4px 12px', marginRight: '8px' }} onClick={() => handleOpenModal(unit)}>Sửa</button>
                                                <button className="btn btn-outline" style={{ padding: '4px 12px', color: '#d93025', borderColor: '#d93025' }} onClick={() => handleDelete(unit.ma_don_vi_dang)}>Xóa</button>
                                            </td>
                                        </tr>
                                    ))
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3>{editingItem ? 'Cập nhật' : 'Thêm mới'} {activeTab === 'regular' ? 'đơn vị' : 'đơn vị Đảng'}</h3>
                            <button className="btn-icon" onClick={() => setShowModal(false)}><MdClose size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {activeTab === 'regular' ? (
                                    <>
                                        <div className="form-group">
                                            <label>Mã đơn vị</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                required 
                                                disabled={!!editingItem}
                                                value={formData.ma_don_vi}
                                                onChange={e => setFormData({...formData, ma_don_vi: e.target.value})}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Tên đơn vị</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                required 
                                                value={formData.ten_don_vi}
                                                onChange={e => setFormData({...formData, ten_don_vi: e.target.value})}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Đơn vị cha</label>
                                            <select 
                                                className="form-control"
                                                value={formData.ma_don_vi_cha}
                                                onChange={e => setFormData({...formData, ma_don_vi_cha: e.target.value})}
                                            >
                                                <option value="">-- Không có --</option>
                                                {units.filter(u => u.ma_don_vi !== formData.ma_don_vi).map(u => (
                                                    <option key={u.ma_don_vi} value={u.ma_don_vi}>{u.ten_don_vi}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Cấp đơn vị</label>
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                required 
                                                value={formData.cap_don_vi}
                                                onChange={e => setFormData({...formData, cap_don_vi: parseInt(e.target.value)})}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Trạng thái</label>
                                            <select 
                                                className="form-control"
                                                value={formData.trang_thai}
                                                onChange={e => setFormData({...formData, trang_thai: e.target.value})}
                                            >
                                                <option value="ACTIVE">Hoạt động</option>
                                                <option value="INACTIVE">Ngừng hoạt động</option>
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="form-group">
                                            <label>Mã đơn vị Đảng</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                required 
                                                disabled={!!editingItem}
                                                value={partyFormData.ma_don_vi_dang}
                                                onChange={e => setPartyFormData({...partyFormData, ma_don_vi_dang: e.target.value})}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Tên đơn vị Đảng</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                required 
                                                value={partyFormData.ten_don_vi_dang}
                                                onChange={e => setPartyFormData({...partyFormData, ten_don_vi_dang: e.target.value})}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Cấp độ</label>
                                            <select 
                                                className="form-control"
                                                required
                                                value={partyFormData.cap_do}
                                                onChange={e => setPartyFormData({...partyFormData, cap_do: e.target.value})}
                                            >
                                                <option value="DANG_UY_TRUONG">Đảng ủy Trường</option>
                                                <option value="DANG_UY_KHOI">Đảng ủy Khối</option>
                                                <option value="CHI_BO">Chi bộ</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Trực thuộc đơn vị chính quyền</label>
                                            <select 
                                                className="form-control"
                                                value={partyFormData.ma_don_vi}
                                                onChange={e => setPartyFormData({...partyFormData, ma_don_vi: e.target.value})}
                                            >
                                                <option value="">-- Không có --</option>
                                                {units.map(u => (
                                                    <option key={u.ma_don_vi} value={u.ma_don_vi}>{u.ten_don_vi}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Trạng thái</label>
                                            <select 
                                                className="form-control"
                                                value={partyFormData.trang_thai}
                                                onChange={e => setPartyFormData({...partyFormData, trang_thai: e.target.value})}
                                            >
                                                <option value="ACTIVE">Hoạt động</option>
                                                <option value="INACTIVE">Ngừng hoạt động</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <MdSave /> {editingItem ? 'Cập nhật' : 'Lưu lại'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnitManagement;
