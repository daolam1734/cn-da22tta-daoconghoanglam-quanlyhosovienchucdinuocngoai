import React, { useState, useEffect } from 'react';
import categoryService from '../services/categoryService';
import { useToast } from '../contexts/ToastContext';
import { MdAdd, MdEdit, MdDelete, MdClose, MdSave, MdPublic, MdFlight, MdDescription } from 'react-icons/md';

const CategoryManagement = () => {
    const [tripTypes, setTripTypes] = useState([]);
    const [countries, setCountries] = useState([]);
    const [docTypes, setDocTypes] = useState([]);
    const [activeTab, setActiveTab] = useState('tripTypes'); // 'tripTypes', 'countries', 'docTypes'
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const { showToast } = useToast();

    // Form states
    const [tripTypeForm, setTripTypeForm] = useState({
        ma_loai: '',
        ten_loai: '',
        yeu_cau_duyet_dang: false,
        thu_tu: 0,
        trang_thai: true
    });

    const [countryForm, setCountryForm] = useState({
        ma_quoc_gia: '',
        ten_quoc_gia: '',
        ten_day_du: '',
        trang_thai: true
    });

    const [docTypeForm, setDocTypeForm] = useState({
        ma_loai: '',
        ten_loai: '',
        ap_dung_cho: 'ALL',
        bat_buoc: false,
        thu_tu: 0,
        trang_thai: true
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tripRes, countryRes, docRes] = await Promise.all([
                categoryService.getTripTypes(),
                categoryService.getCountries(),
                categoryService.getDocumentTypes()
            ]);
            if (tripRes.success) setTripTypes(tripRes.data);
            if (countryRes.success) setCountries(countryRes.data);
            if (docRes.success) setDocTypes(docRes.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            showToast('Lỗi khi tải dữ liệu danh mục', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (item = null) => {
        setEditingItem(item);
        if (activeTab === 'tripTypes') {
            setTripTypeForm(item ? { ...item } : {
                ma_loai: '',
                ten_loai: '',
                yeu_cau_duyet_dang: false,
                thu_tu: 0,
                trang_thai: true
            });
        } else if (activeTab === 'countries') {
            setCountryForm(item ? { ...item } : {
                ma_quoc_gia: '',
                ten_quoc_gia: '',
                ten_day_du: '',
                trang_thai: true
            });
        } else {
            setDocTypeForm(item ? { ...item } : {
                ma_loai: '',
                ten_loai: '',
                ap_dung_cho: 'ALL',
                bat_buoc: false,
                thu_tu: 0,
                trang_thai: true
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (activeTab === 'tripTypes') {
                if (editingItem) {
                    res = await categoryService.updateTripType(editingItem.ma_loai, tripTypeForm);
                } else {
                    res = await categoryService.createTripType(tripTypeForm);
                }
            } else if (activeTab === 'countries') {
                if (editingItem) {
                    res = await categoryService.updateCountry(editingItem.ma_quoc_gia, countryForm);
                } else {
                    res = await categoryService.createCountry(countryForm);
                }
            } else {
                if (editingItem) {
                    res = await categoryService.updateDocumentType(editingItem.ma_loai, docTypeForm);
                } else {
                    res = await categoryService.createDocumentType(docTypeForm);
                }
            }

            if (res.success) {
                alert(res.message);
                setShowModal(false);
                fetchData();
            } else {
                alert(res.message);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi khi lưu dữ liệu');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa mục này?')) return;
        try {
            let res;
            if (activeTab === 'tripTypes') res = await categoryService.deleteTripType(id);
            else if (activeTab === 'countries') res = await categoryService.deleteCountry(id);
            else res = await categoryService.deleteDocumentType(id);

            if (res.success) {
                alert(res.message);
                fetchData();
            } else {
                alert(res.message);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi khi xóa dữ liệu');
        }
    };

    if (loading) return <div className="p-4">Đang tải dữ liệu...</div>;

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 className="page-title">Quản lý danh mục</h1>
                    <p className="text-muted">Quản lý các loại chuyến đi, quốc gia và loại tài liệu</p>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <MdAdd style={{ marginRight: '8px' }} /> Thêm mới
                </button>
            </div>

            <div className="tabs-container" style={{ marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
                <button 
                    className={`tab-btn ${activeTab === 'tripTypes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tripTypes')}
                    style={{ padding: '10px 20px', border: 'none', background: 'none', borderBottom: activeTab === 'tripTypes' ? '2px solid #1a73e8' : 'none', color: activeTab === 'tripTypes' ? '#1a73e8' : '#666', fontWeight: '600', cursor: 'pointer' }}
                >
                    <MdFlight style={{ marginRight: '8px' }} /> Loại chuyến đi
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'countries' ? 'active' : ''}`}
                    onClick={() => setActiveTab('countries')}
                    style={{ padding: '10px 20px', border: 'none', background: 'none', borderBottom: activeTab === 'countries' ? '2px solid #1a73e8' : 'none', color: activeTab === 'countries' ? '#1a73e8' : '#666', fontWeight: '600', cursor: 'pointer' }}
                >
                    <MdPublic style={{ marginRight: '8px' }} /> Quốc gia
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'docTypes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('docTypes')}
                    style={{ padding: '10px 20px', border: 'none', background: 'none', borderBottom: activeTab === 'docTypes' ? '2px solid #1a73e8' : 'none', color: activeTab === 'docTypes' ? '#1a73e8' : '#666', fontWeight: '600', cursor: 'pointer' }}
                >
                    <MdDescription style={{ marginRight: '8px' }} /> Loại tài liệu
                </button>
            </div>

            <div className="card">
                <table className="table">
                    <thead>
                        {activeTab === 'tripTypes' && (
                            <tr>
                                <th>Mã</th>
                                <th>Tên loại</th>
                                <th>Thứ tự</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        )}
                        {activeTab === 'countries' && (
                            <tr>
                                <th>Mã</th>
                                <th>Tên quốc gia</th>
                                <th>Tên đầy đủ</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        )}
                        {activeTab === 'docTypes' && (
                            <tr>
                                <th>Mã</th>
                                <th>Tên loại</th>
                                <th>Áp dụng cho</th>
                                <th>Bắt buộc</th>
                                <th>Thứ tự</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {activeTab === 'tripTypes' && tripTypes.map(item => (
                            <tr key={item.ma_loai}>
                                <td>{item.ma_loai}</td>
                                <td>{item.ten_loai}</td>
                                <td>{item.thu_tu}</td>
                                <td><span className={`badge ${item.trang_thai ? 'badge-success' : 'badge-danger'}`}>{item.trang_thai ? 'Hoạt động' : 'Khóa'}</span></td>
                                <td>
                                    <button className="btn-icon" onClick={() => handleOpenModal(item)}><MdEdit /></button>
                                    <button className="btn-icon text-danger" onClick={() => handleDelete(item.ma_loai)}><MdDelete /></button>
                                </td>
                            </tr>
                        ))}
                        {activeTab === 'countries' && countries.map(item => (
                            <tr key={item.ma_quoc_gia}>
                                <td>{item.ma_quoc_gia}</td>
                                <td>{item.ten_quoc_gia}</td>
                                <td>{item.ten_day_du}</td>
                                <td><span className={`badge ${item.trang_thai ? 'badge-success' : 'badge-danger'}`}>{item.trang_thai ? 'Hoạt động' : 'Khóa'}</span></td>
                                <td>
                                    <button className="btn-icon" onClick={() => handleOpenModal(item)}><MdEdit /></button>
                                    <button className="btn-icon text-danger" onClick={() => handleDelete(item.ma_quoc_gia)}><MdDelete /></button>
                                </td>
                            </tr>
                        ))}
                        {activeTab === 'docTypes' && docTypes.map(item => (
                            <tr key={item.ma_loai}>
                                <td>{item.ma_loai}</td>
                                <td>{item.ten_loai}</td>
                                <td>{item.ap_dung_cho === 'ALL' ? 'Tất cả' : (item.ap_dung_cho === 'ADMIN' ? 'Hành chính' : 'Đảng')}</td>
                                <td>{item.bat_buoc ? 'Có' : 'Không'}</td>
                                <td>{item.thu_tu}</td>
                                <td><span className={`badge ${item.trang_thai ? 'badge-success' : 'badge-danger'}`}>{item.trang_thai ? 'Hoạt động' : 'Khóa'}</span></td>
                                <td>
                                    <button className="btn-icon" onClick={() => handleOpenModal(item)}><MdEdit /></button>
                                    <button className="btn-icon text-danger" onClick={() => handleDelete(item.ma_loai)}><MdDelete /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>{editingItem ? 'Cập nhật' : 'Thêm mới'} {activeTab === 'tripTypes' ? 'loại chuyến đi' : (activeTab === 'countries' ? 'quốc gia' : 'loại tài liệu')}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}><MdClose /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {activeTab === 'tripTypes' && (
                                    <>
                                        <div className="form-group">
                                            <label>Mã loại</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={tripTypeForm.ma_loai} 
                                                onChange={e => setTripTypeForm({...tripTypeForm, ma_loai: e.target.value})}
                                                disabled={!!editingItem}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Tên loại</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={tripTypeForm.ten_loai} 
                                                onChange={e => setTripTypeForm({...tripTypeForm, ten_loai: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Thứ tự hiển thị</label>
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                value={tripTypeForm.thu_tu} 
                                                onChange={e => setTripTypeForm({...tripTypeForm, thu_tu: parseInt(e.target.value)})}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Trạng thái</label>
                                            <select 
                                                className="form-control" 
                                                value={tripTypeForm.trang_thai} 
                                                onChange={e => setTripTypeForm({...tripTypeForm, trang_thai: e.target.value === 'true'})}
                                            >
                                                <option value="true">Hoạt động</option>
                                                <option value="false">Khóa</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'countries' && (
                                    <>
                                        <div className="form-group">
                                            <label>Mã quốc gia (ISO)</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={countryForm.ma_quoc_gia} 
                                                onChange={e => setCountryForm({...countryForm, ma_quoc_gia: e.target.value})}
                                                disabled={!!editingItem}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Tên quốc gia</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={countryForm.ten_quoc_gia} 
                                                onChange={e => setCountryForm({...countryForm, ten_quoc_gia: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Tên đầy đủ</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={countryForm.ten_day_du} 
                                                onChange={e => setCountryForm({...countryForm, ten_day_du: e.target.value})}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Trạng thái</label>
                                            <select 
                                                className="form-control" 
                                                value={countryForm.trang_thai} 
                                                onChange={e => setCountryForm({...countryForm, trang_thai: e.target.value === 'true'})}
                                            >
                                                <option value="true">Hoạt động</option>
                                                <option value="false">Khóa</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'docTypes' && (
                                    <>
                                        <div className="form-group">
                                            <label>Mã loại</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={docTypeForm.ma_loai} 
                                                onChange={e => setDocTypeForm({...docTypeForm, ma_loai: e.target.value})}
                                                disabled={!!editingItem}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Tên loại tài liệu</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={docTypeForm.ten_loai} 
                                                onChange={e => setDocTypeForm({...docTypeForm, ten_loai: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Áp dụng cho</label>
                                            <select 
                                                className="form-control" 
                                                value={docTypeForm.ap_dung_cho} 
                                                onChange={e => setDocTypeForm({...docTypeForm, ap_dung_cho: e.target.value})}
                                            >
                                                <option value="ALL">Tất cả</option>
                                                <option value="ADMIN">Hành chính</option>
                                                <option value="PARTY">Đảng</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={docTypeForm.bat_buoc} 
                                                    onChange={e => setDocTypeForm({...docTypeForm, bat_buoc: e.target.checked})}
                                                />
                                                Bắt buộc đính kèm
                                            </label>
                                        </div>
                                        <div className="form-group">
                                            <label>Thứ tự hiển thị</label>
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                value={docTypeForm.thu_tu} 
                                                onChange={e => setDocTypeForm({...docTypeForm, thu_tu: parseInt(e.target.value)})}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Trạng thái</label>
                                            <select 
                                                className="form-control" 
                                                value={docTypeForm.trang_thai} 
                                                onChange={e => setDocTypeForm({...docTypeForm, trang_thai: e.target.value === 'true'})}
                                            >
                                                <option value="true">Hoạt động</option>
                                                <option value="false">Khóa</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary">
                                    <MdSave style={{ marginRight: '8px' }} /> Lưu lại
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagement;
