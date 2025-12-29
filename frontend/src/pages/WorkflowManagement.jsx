import React, { useState, useEffect } from 'react';
import workflowService from '../services/workflowService';
import unitService from '../services/unitService';
import authService from '../services/authService';
import { MdAdd, MdEdit, MdDelete, MdAccountTree, MdClose, MdSave, MdArrowDownward, MdArrowUpward } from 'react-icons/md';

const WorkflowManagement = () => {
    const [workflows, setWorkflows] = useState([]);
    const [units, setUnits] = useState([]);
    const [partyUnits, setPartyUnits] = useState([]);
    const [tripTypes, setTripTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    
    const [formData, setFormData] = useState({
        ma_luong: '',
        ten_luong: '',
        ma_loai_chuyen_di: '',
        ap_dung_dang_vien: true,
        ap_dung_vien_chuc: true,
        mo_ta: '',
        steps: []
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [wfRes, unitRes, partyRes, tripRes] = await Promise.all([
                workflowService.getWorkflows(),
                unitService.getUnits(),
                unitService.getPartyUnits(),
                fetch('/api/regulations/trip-types', {
                    headers: { Authorization: `Bearer ${authService.getToken()}` }
                }).then(res => res.json())
            ]);

            if (wfRes.success) setWorkflows(wfRes.data);
            if (unitRes.success) setUnits(unitRes.data);
            if (partyRes.success) setPartyUnits(partyRes.data);
            if (tripRes.success) setTripTypes(tripRes.data);
        } catch (error) {
            console.error('Error fetching workflow data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = async (item = null) => {
        if (item) {
            const res = await workflowService.getWorkflowById(item.ma_luong);
            if (res.success) {
                setEditingItem(res.data);
                setFormData({
                    ma_luong: res.data.ma_luong,
                    ten_luong: res.data.ten_luong,
                    ma_loai_chuyen_di: res.data.ma_loai_chuyen_di || '',
                    ap_dung_dang_vien: res.data.ap_dung_dang_vien,
                    ap_dung_vien_chuc: res.data.ap_dung_vien_chuc,
                    mo_ta: res.data.mo_ta || '',
                    steps: res.data.steps || []
                });
            }
        } else {
            setEditingItem(null);
            setFormData({
                ma_luong: '',
                ten_luong: '',
                ma_loai_chuyen_di: '',
                ap_dung_dang_vien: true,
                ap_dung_vien_chuc: true,
                mo_ta: '',
                steps: []
            });
        }
        setShowModal(true);
    };

    const handleAddStep = () => {
        const newStep = {
            thu_tu: formData.steps.length + 1,
            ten_buoc: '',
            ma_buoc: '',
            loai_xu_ly: 'HANH_CHINH',
            ma_don_vi: '',
            ma_don_vi_dang: '',
            thoi_gian_du_kien: 3
        };
        setFormData({ ...formData, steps: [...formData.steps, newStep] });
    };

    const handleRemoveStep = (index) => {
        const newSteps = formData.steps.filter((_, i) => i !== index);
        // Re-order
        const reorderedSteps = newSteps.map((step, i) => ({ ...step, thu_tu: i + 1 }));
        setFormData({ ...formData, steps: reorderedSteps });
    };

    const handleStepChange = (index, field, value) => {
        const newSteps = [...formData.steps];
        newSteps[index][field] = value;
        setFormData({ ...formData, steps: newSteps });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (editingItem) {
                res = await workflowService.updateWorkflow(editingItem.ma_luong, formData);
            } else {
                res = await workflowService.createWorkflow(formData);
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
        if (window.confirm('Bạn có chắc chắn muốn xóa luồng này?')) {
            try {
                const res = await workflowService.deleteWorkflow(id);
                if (res.success) fetchData();
                else alert(res.message);
            } catch (error) {
                alert('Lỗi khi xóa');
            }
        }
    };

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <MdAccountTree /> Cấu hình luồng xử lý
                    </h1>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Thiết lập các bước phê duyệt cho từng loại hồ sơ</p>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <MdAdd style={{ marginRight: '8px' }} />
                    Thêm luồng mới
                </button>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Mã luồng</th>
                                <th>Tên luồng</th>
                                <th>Loại chuyến đi</th>
                                <th>Đối tượng</th>
                                <th style={{ textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>Đang tải dữ liệu...</td></tr>
                            ) : (
                                workflows.map(wf => (
                                    <tr key={wf.ma_luong}>
                                        <td><span style={{ fontWeight: '600' }}>{wf.ma_luong}</span></td>
                                        <td>{wf.ten_luong}</td>
                                        <td>{wf.ten_loai || 'Tất cả'}</td>
                                        <td>
                                            {wf.ap_dung_vien_chuc && <span className="badge" style={{ marginRight: '4px' }}>Viên chức</span>}
                                            {wf.ap_dung_dang_vien && <span className="badge" style={{ backgroundColor: '#fce8e6', color: '#d93025' }}>Đảng viên</span>}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="btn-icon" onClick={() => handleOpenModal(wf)} style={{ color: '#1a73e8' }}><MdEdit size={20} /></button>
                                            <button className="btn-icon" onClick={() => handleDelete(wf.ma_luong)} style={{ color: '#d93025' }}><MdDelete size={20} /></button>
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
                    <div className="modal-content" style={{ maxWidth: '900px', width: '95%' }}>
                        <div className="modal-header">
                            <h3>{editingItem ? 'Cập nhật' : 'Thêm mới'} luồng xử lý</h3>
                            <button className="btn-icon" onClick={() => setShowModal(false)}><MdClose size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                    <div className="form-group">
                                        <label>Mã luồng</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            required 
                                            disabled={!!editingItem}
                                            value={formData.ma_luong}
                                            onChange={e => setFormData({...formData, ma_luong: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Tên luồng</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            required 
                                            value={formData.ten_luong}
                                            onChange={e => setFormData({...formData, ten_luong: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                    <div className="form-group">
                                        <label>Loại chuyến đi áp dụng</label>
                                        <select 
                                            className="form-control"
                                            value={formData.ma_loai_chuyen_di}
                                            onChange={e => setFormData({...formData, ma_loai_chuyen_di: e.target.value})}
                                        >
                                            <option value="">Tất cả loại chuyến đi</option>
                                            {tripTypes.map(t => (
                                                <option key={t.ma_loai} value={t.ma_loai}>{t.ten_loai}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Đối tượng áp dụng</label>
                                        <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal' }}>
                                                <input type="checkbox" checked={formData.ap_dung_vien_chuc} onChange={e => setFormData({...formData, ap_dung_vien_chuc: e.target.checked})} /> Viên chức
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal' }}>
                                                <input type="checkbox" checked={formData.ap_dung_dang_vien} onChange={e => setFormData({...formData, ap_dung_dang_vien: e.target.checked})} /> Đảng viên
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <h4 style={{ margin: 0 }}>Các bước xử lý</h4>
                                        <button type="button" className="btn btn-outline" onClick={handleAddStep}>
                                            <MdAdd /> Thêm bước
                                        </button>
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {formData.steps.map((step, index) => (
                                            <div key={index} className="card" style={{ margin: 0, padding: '16px', backgroundColor: '#f8f9fa' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                    <span className="badge" style={{ backgroundColor: '#1a73e8', color: '#fff' }}>Bước {step.thu_tu}</span>
                                                    <button type="button" className="btn-icon" onClick={() => handleRemoveStep(index)} style={{ color: '#d93025' }}><MdDelete size={20} /></button>
                                                </div>
                                                
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                                    <div className="form-group">
                                                        <label>Tên bước</label>
                                                        <input 
                                                            type="text" 
                                                            className="form-control" 
                                                            required 
                                                            value={step.ten_buoc}
                                                            onChange={e => handleStepChange(index, 'ten_buoc', e.target.value)}
                                                            placeholder="VD: Duyệt đơn vị"
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Mã bước</label>
                                                        <input 
                                                            type="text" 
                                                            className="form-control" 
                                                            required 
                                                            value={step.ma_buoc}
                                                            onChange={e => handleStepChange(index, 'ma_buoc', e.target.value)}
                                                            placeholder="VD: DUYET_DV"
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Loại xử lý</label>
                                                        <select 
                                                            className="form-control"
                                                            value={step.loai_xu_ly}
                                                            onChange={e => handleStepChange(index, 'loai_xu_ly', e.target.value)}
                                                        >
                                                            <option value="HANH_CHINH">Hành chính</option>
                                                            <option value="DANG">Đảng</option>
                                                            <option value="PHOI_HOP">Phối hợp</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
                                                    <div className="form-group">
                                                        <label>Đơn vị thẩm quyền</label>
                                                        <select 
                                                            className="form-control"
                                                            value={step.ma_don_vi || ''}
                                                            onChange={e => handleStepChange(index, 'ma_don_vi', e.target.value)}
                                                            disabled={step.loai_xu_ly === 'DANG'}
                                                        >
                                                            <option value="">-- Chọn đơn vị --</option>
                                                            {units.map(u => <option key={u.ma_don_vi} value={u.ma_don_vi}>{u.ten_don_vi}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Đơn vị Đảng thẩm quyền</label>
                                                        <select 
                                                            className="form-control"
                                                            value={step.ma_don_vi_dang || ''}
                                                            onChange={e => handleStepChange(index, 'ma_don_vi_dang', e.target.value)}
                                                            disabled={step.loai_xu_ly === 'HANH_CHINH'}
                                                        >
                                                            <option value="">-- Chọn đơn vị Đảng --</option>
                                                            {partyUnits.map(u => <option key={u.ma_don_vi_dang} value={u.ma_don_vi_dang}>{u.ten_don_vi_dang}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Thời gian xử lý (ngày)</label>
                                                        <input 
                                                            type="number" 
                                                            className="form-control" 
                                                            value={step.thoi_gian_du_kien}
                                                            onChange={e => handleStepChange(index, 'thoi_gian_du_kien', parseInt(e.target.value))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {formData.steps.length === 0 && (
                                            <div style={{ textAlign: 'center', padding: '20px', border: '2px dashed #dadce0', borderRadius: '8px', color: '#5f6368' }}>
                                                Chưa có bước xử lý nào. Nhấn "Thêm bước" để bắt đầu.
                                            </div>
                                        )}
                                    </div>
                                </div>
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

export default WorkflowManagement;
