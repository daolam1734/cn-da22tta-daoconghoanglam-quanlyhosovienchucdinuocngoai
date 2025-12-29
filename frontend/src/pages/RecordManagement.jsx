import React, { useEffect, useState } from 'react';
import recordService from '../services/recordService';
import reportService from '../services/reportService';
import regulationService from '../services/regulationService';
import { useAuth } from '../contexts/AuthContext';
import { 
    MdAdd, 
    MdSearch, 
    MdClose, 
    MdFolderOpen, 
    MdEdit, 
    MdSend, 
    MdVisibility, 
    MdAssignmentTurnedIn,
    MdHistory,
    MdAttachFile,
    MdCheckCircle,
    MdError
} from 'react-icons/md';

const RecordManagement = ({ mode = 'all' }) => {
    const { user } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [tripTypes, setTripTypes] = useState([]);
    const [countries, setCountries] = useState([]);
    const [processFiles, setProcessFiles] = useState([]);
    const [newReport, setNewReport] = useState({
        noi_dung_bao_cao: '',
        ket_qua_dat_duoc: '',
        kien_nghi: ''
    });
    const [reportFiles, setReportFiles] = useState([]);
    const [newRecord, setNewRecord] = useState({
        ma_loai_chuyen_di: 'CONG_TAC',
        ma_quoc_gia: 'VN',
        tu_ngay: '',
        den_ngay: '',
        dia_diem_cu_the: '',
        noi_dung_cong_viec: '',
        nguon_kinh_phi: 'TU_TUC',
        kinh_phi: 0
    });
    const [files, setFiles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const todayStr = new Date().toISOString().split('T')[0];

    useEffect(() => {
        fetchRecords();
        fetchMetadata();
    }, []);

    const fetchMetadata = async () => {
        try {
            const [tripTypesRes, countriesRes] = await Promise.all([
                regulationService.getTripTypes(),
                regulationService.getCountries()
            ]);
            if (tripTypesRes.success) setTripTypes(tripTypesRes.data);
            if (countriesRes.success) setCountries(countriesRes.data);
        } catch (error) {
            console.error('Error fetching metadata:', error);
        }
    };

    const resetForm = () => {
        setNewRecord({
            ma_loai_chuyen_di: tripTypes.length > 0 ? tripTypes[0].ma_loai : 'CONG_TAC',
            ma_quoc_gia: countries.length > 0 ? countries[0].ma_quoc_gia : 'VN',
            tu_ngay: '',
            den_ngay: '',
            dia_diem_cu_the: '',
            noi_dung_cong_viec: '',
            nguon_kinh_phi: 'TU_TUC',
            kinh_phi: 0
        });
        setFiles([]);
        setIsEditing(false);
        setEditingId(null);
    };

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const result = await recordService.getRecords();
            if (result.success) {
                setRecords(result.data);
            } else {
                console.error(result.message);
            }
        } catch (error) {
            console.error('Error fetching records:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e, submitImmediately = false) => {
        if (e) e.preventDefault();

        // Basic validation
        if (!newRecord.tu_ngay || !newRecord.den_ngay || !newRecord.noi_dung_cong_viec) {
            alert('Vui lòng điền đầy đủ các thông tin bắt buộc (Từ ngày, Đến ngày, Nội dung)');
            return;
        }

        // Date validation
        const tuNgay = new Date(newRecord.tu_ngay);
        const denNgay = new Date(newRecord.den_ngay);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (tuNgay < today && !isEditing) {
            alert('Ngày bắt đầu không được nhỏ hơn ngày hiện tại');
            return;
        }

        if (denNgay < tuNgay) {
            alert('Ngày kết thúc không được nhỏ hơn ngày bắt đầu');
            return;
        }

        const formData = new FormData();
        Object.keys(newRecord).forEach(key => {
            formData.append(key, newRecord[key]);
        });
        formData.append('submit_immediately', submitImmediately);

        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            let result;
            if (isEditing) {
                result = await recordService.updateRecord(editingId, formData);
            } else {
                result = await recordService.createRecord(formData);
            }

            if (result.success) {
                setShowModal(false);
                resetForm();
                fetchRecords();
                alert(submitImmediately ? 'Hồ sơ đã được nộp thành công!' : (isEditing ? 'Cập nhật hồ sơ thành công!' : 'Hồ sơ đã được lưu nháp!'));
            } else {
                alert(result.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            alert('Lỗi kết nối đến server');
        }
    };

    const handleEdit = (record) => {
        setNewRecord({
            ma_loai_chuyen_di: record.ma_loai_chuyen_di,
            ma_quoc_gia: record.ma_quoc_gia,
            tu_ngay: record.tu_ngay.split('T')[0],
            den_ngay: record.den_ngay.split('T')[0],
            dia_diem_cu_the: record.dia_diem_cu_the || '',
            noi_dung_cong_viec: record.noi_dung_cong_viec,
            nguon_kinh_phi: record.nguon_kinh_phi,
            kinh_phi: record.kinh_phi
        });
        setIsEditing(true);
        setEditingId(record.ma_ho_so);
        setShowModal(true);
    };

    const handleViewDetail = async (id) => {
        const result = await recordService.getRecordById(id);
        if (result.success) {
            setSelectedRecord(result.data);
            // Fetch report if exists
            const reportResult = await reportService.getReportByRecord(id);
            if (reportResult.success) {
                setReportData(reportResult.data);
            }
            setShowDetailModal(true);
        } else {
            alert(result.message);
        }
    };

    const handleOpenReport = (record) => {
        setSelectedRecord(record);
        setNewReport({
            noi_dung_bao_cao: '',
            ket_qua_dat_duoc: '',
            kien_nghi: ''
        });
        setReportFiles([]);
        setShowReportModal(true);
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('ma_ho_so', selectedRecord.ma_ho_so);
        formData.append('noi_dung_bao_cao', newReport.noi_dung_bao_cao);
        formData.append('ket_qua_dat_duoc', newReport.ket_qua_dat_duoc);
        formData.append('kien_nghi', newReport.kien_nghi);
        reportFiles.forEach(file => {
            formData.append('files', file);
        });

        const result = await reportService.submitReport(formData);
        if (result.success) {
            alert('Nộp báo cáo thành công!');
            setShowReportModal(false);
            fetchRecords();
        } else {
            alert(result.message);
        }
    };

    const handleApproveReport = async (reportId, status) => {
        const feedback = prompt('Nhập ý kiến phản hồi (nếu có):');
        const result = await reportService.approveReport(reportId, status, feedback);
        if (result.success) {
            alert('Cập nhật trạng thái báo cáo thành công!');
            handleViewDetail(selectedRecord.ma_ho_so);
        } else {
            alert(result.message);
        }
    };

    const handleAction = async (id, action, comment = null, files = []) => {
        let y_kien = comment;
        if (y_kien === null) {
            y_kien = prompt('Nhập ý kiến xử lý:');
        }

        if (y_kien !== null) {
            const result = await recordService.processRecord(id, action, y_kien, files);
            if (result.success) {
                setProcessFiles([]);
                fetchRecords();
            } else {
                alert(result.message);
            }
        }
    };

    const handleWithdraw = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn rút hồ sơ này về trạng thái nháp?')) {
            try {
                const result = await recordService.withdrawRecord(id);
                if (result.success) {
                    fetchRecords();
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error('Error withdrawing record:', error);
                alert('Lỗi khi rút hồ sơ');
            }
        }
    };

    const canProcess = (record) => {
        if (!record) return false;
        // Không cho phép tự xử lý hồ sơ của chính mình
        if (record.ma_vien_chuc === user.ma_vien_chuc) return false;

        const status = record.ma_trang_thai;
        if (status === 'CHO_DON_VI' && user.roles.includes('TRUONG_DON_VI')) return true;
        if (status === 'CHO_CHI_BO' && user.roles.includes('CHI_BO')) return true;
        if (status === 'CHO_DANG_UY' && user.roles.includes('DANG_UY')) return true;
        if (status === 'CHO_TCNS' && user.roles.includes('TCNS')) return true;
        if (status === 'CHO_BGH' && user.roles.includes('BGH')) return true;
        return false;
    };

    if (loading) return <div>Đang tải danh sách hồ sơ...</div>;

    const filteredRecords = records.filter(record => {
        if (mode === 'personal') return record.ma_vien_chuc === user.ma_vien_chuc;
        if (mode === 'process') return record.ma_vien_chuc !== user.ma_vien_chuc;
        return true;
    });

    const stats = {
        total: filteredRecords.length,
        pending: filteredRecords.filter(r => ['CHO_DON_VI', 'CHO_CHI_BO', 'CHO_DANG_UY', 'CHO_TCNS', 'CHO_BGH'].includes(r.ma_trang_thai)).length,
        approved: filteredRecords.filter(r => r.ma_trang_thai === 'DA_DUYET' || r.ma_trang_thai === 'DA_HOAN_THANH').length,
        rejected: filteredRecords.filter(r => r.ma_trang_thai === 'YEU_CAU_BO_SUNG').length,
        draft: filteredRecords.filter(r => r.ma_trang_thai === 'DRAFT').length
    };

    const displayRecords = filteredRecords.filter(record => 
        record.ma_ho_so.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.ten_quoc_gia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.noi_dung_cong_viec.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '4px' }}>
                        {mode === 'personal' ? 'Hồ sơ của tôi' : (mode === 'process' ? 'Duyệt hồ sơ' : 'Quản lý hồ sơ')}
                    </h1>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                        {mode === 'personal' ? 'Theo dõi và quản lý các hồ sơ bạn đã tạo' : 'Xử lý các hồ sơ đang chờ phê duyệt'}
                    </p>
                </div>
                {mode === 'personal' && user.roles.includes('VIEN_CHUC') && (
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <MdAdd style={{ marginRight: '8px', fontSize: '1.2rem' }} />
                        Tạo hồ sơ mới
                    </button>
                )}
            </div>

            {mode === 'personal' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    <div className="card" style={{ margin: 0, padding: '20px', borderLeft: '4px solid #1a73e8' }}>
                        <div className="text-muted" style={{ fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Tổng số hồ sơ</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>{stats.total}</div>
                    </div>
                    <div className="card" style={{ margin: 0, padding: '20px', borderLeft: '4px solid #f4b400' }}>
                        <div className="text-muted" style={{ fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Đang chờ duyệt</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#f4b400' }}>{stats.pending}</div>
                    </div>
                    <div className="card" style={{ margin: 0, padding: '20px', borderLeft: '4px solid #0f9d58' }}>
                        <div className="text-muted" style={{ fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Đã được duyệt</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#0f9d58' }}>{stats.approved}</div>
                    </div>
                    <div className="card" style={{ margin: 0, padding: '20px', borderLeft: '4px solid #d93025' }}>
                        <div className="text-muted" style={{ fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Cần bổ sung</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#d93025' }}>{stats.rejected}</div>
                    </div>
                </div>
            )}

            <div className="card">
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #dadce0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Tìm kiếm hồ sơ..." 
                            style={{ paddingLeft: '36px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <MdSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#5f6368', fontSize: '1.2rem' }} />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#5f6368' }}>
                        Hiển thị <strong>{displayRecords.length}</strong> hồ sơ
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Mã hồ sơ</th>
                                {mode === 'process' && <th>Người đi</th>}
                                <th>Quốc gia</th>
                                <th>Thời gian</th>
                                <th>Nội dung</th>
                                <th>Trạng thái</th>
                                <th style={{ textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayRecords.map(record => (
                                <tr key={record.ma_ho_so} onClick={() => handleViewDetail(record.ma_ho_so)} style={{ cursor: 'pointer' }}>
                                    <td><span style={{ fontWeight: '600', color: '#1a73e8' }}>{record.ma_ho_so}</span></td>
                                    {mode === 'process' && <td>{record.ho_ten}</td>}
                                    <td>{record.ten_quoc_gia}</td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            {new Date(record.tu_ngay).toLocaleDateString('vi-VN')}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#5f6368' }}>
                                            đến {new Date(record.den_ngay).toLocaleDateString('vi-VN')}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ 
                                            maxWidth: '250px', 
                                            overflow: 'hidden', 
                                            textOverflow: 'ellipsis', 
                                            whiteSpace: 'nowrap',
                                            fontSize: '0.85rem'
                                        }}>
                                            {record.noi_dung_cong_viec}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${record.ma_trang_thai.toLowerCase()}`} style={{
                                            backgroundColor: record.ma_trang_thai === 'DA_DUYET' ? '#e6f4ea' : 
                                                            record.ma_trang_thai === 'YEU_CAU_BO_SUNG' ? '#fce8e6' : 
                                                            record.ma_trang_thai === 'DRAFT' ? '#f1f3f4' : '#fef7e0',
                                            color: record.ma_trang_thai === 'DA_DUYET' ? '#1e8e3e' : 
                                                   record.ma_trang_thai === 'YEU_CAU_BO_SUNG' ? '#d93025' : 
                                                   record.ma_trang_thai === 'DRAFT' ? '#5f6368' : '#f9ab00'
                                        }}>
                                            {record.ten_trang_thai}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => handleViewDetail(record.ma_ho_so)}>Chi tiết</button>
                                            {(record.ma_trang_thai === 'DA_DUYET' || record.ma_trang_thai === 'DA_HOAN_THANH') && record.ma_vien_chuc === user.ma_vien_chuc && (
                                                <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.8rem', backgroundColor: '#673ab7' }} onClick={() => handleOpenReport(record)}>Báo cáo</button>
                                            )}
                                            {(record.ma_trang_thai === 'DRAFT' || record.ma_trang_thai === 'YEU_CAU_BO_SUNG') && record.ma_vien_chuc === user.ma_vien_chuc && (
                                                <>
                                                    <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem', borderColor: '#f4b400', color: '#f4b400' }} onClick={() => handleEdit(record)}>Sửa</button>
                                                    <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => recordService.submitRecord(record.ma_ho_so).then(fetchRecords)}>Nộp</button>
                                                </>
                                            )}
                                            {['CHO_DON_VI', 'CHO_CHI_BO', 'CHO_DANG_UY', 'CHO_TCNS', 'CHO_BGH'].includes(record.ma_trang_thai) && record.ma_vien_chuc === user.ma_vien_chuc && (
                                                <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem', borderColor: '#d93025', color: '#d93025' }} onClick={() => handleWithdraw(record.ma_ho_so)}>Rút hồ sơ</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {displayRecords.length === 0 && (
                                <tr>
                                    <td colSpan={mode === 'process' ? 7 : 6} style={{ textAlign: 'center', padding: '48px', color: '#5f6368' }}>
                                        <MdFolderOpen style={{ fontSize: '3rem', marginBottom: '16px', color: '#dadce0' }} />
                                        <div>Không tìm thấy hồ sơ nào</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{isEditing ? `Chỉnh sửa hồ sơ: ${editingId}` : 'Tạo hồ sơ mới'}</h3>
                            <button className="btn-icon" onClick={() => { setShowModal(false); resetForm(); }}><MdClose size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="form-group">
                                        <label>Loại chuyến đi</label>
                                        <select className="form-control" value={newRecord.ma_loai_chuyen_di} onChange={e => setNewRecord({ ...newRecord, ma_loai_chuyen_di: e.target.value })}>
                                            {tripTypes.map(type => (
                                                <option key={type.ma_loai} value={type.ma_loai}>{type.ten_loai}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Quốc gia</label>
                                        <select className="form-control" value={newRecord.ma_quoc_gia} onChange={e => setNewRecord({ ...newRecord, ma_quoc_gia: e.target.value })}>
                                            {countries.map(country => (
                                                <option key={country.ma_quoc_gia} value={country.ma_quoc_gia}>{country.ten_quoc_gia}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="form-group">
                                        <label>Từ ngày</label>
                                        <input 
                                            type="date" 
                                            className="form-control" 
                                            required 
                                            min={isEditing ? undefined : todayStr}
                                            value={newRecord.tu_ngay} 
                                            onChange={e => setNewRecord({ ...newRecord, tu_ngay: e.target.value })} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Đến ngày</label>
                                        <input 
                                            type="date" 
                                            className="form-control" 
                                            required 
                                            min={newRecord.tu_ngay || todayStr}
                                            value={newRecord.den_ngay} 
                                            onChange={e => setNewRecord({ ...newRecord, den_ngay: e.target.value })} 
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Địa điểm cụ thể</label>
                                    <input type="text" className="form-control" value={newRecord.dia_diem_cu_the} placeholder="Ví dụ: Tokyo, Nhật Bản" onChange={e => setNewRecord({ ...newRecord, dia_diem_cu_the: e.target.value })} />
                                </div>

                                <div className="form-group">
                                    <label>Nội dung công việc</label>
                                    <textarea className="form-control" required rows="3" value={newRecord.noi_dung_cong_viec} placeholder="Mô tả chi tiết mục đích chuyến đi..." onChange={e => setNewRecord({ ...newRecord, noi_dung_cong_viec: e.target.value })}></textarea>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="form-group">
                                        <label>Nguồn kinh phí</label>
                                        <select className="form-control" value={newRecord.nguon_kinh_phi} onChange={e => setNewRecord({ ...newRecord, nguon_kinh_phi: e.target.value })}>
                                            <option value="TU_TUC">Tự túc</option>
                                            <option value="TAI_TRO">Tài trợ</option>
                                            <option value="NGAN_SACH">Ngân sách trường</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Kinh phí dự kiến (VNĐ)</label>
                                        <input type="number" className="form-control" value={newRecord.kinh_phi} onChange={e => setNewRecord({ ...newRecord, kinh_phi: e.target.value })} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Tài liệu đính kèm</label>
                                    <input type="file" className="form-control" multiple onChange={e => setFiles(Array.from(e.target.files))} />
                                    {files.length > 0 && (
                                        <div style={{ marginTop: '12px' }}>
                                            <div className="text-muted font-small" style={{ fontWeight: '600', marginBottom: '4px' }}>Đã chọn {files.length} tệp:</div>
                                            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem' }}>
                                                {files.map((f, i) => <li key={i}>{f.name} ({(f.size / 1024).toFixed(1)} KB)</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => { setShowModal(false); resetForm(); }}>Hủy</button>
                                <button type="button" className="btn btn-outline" style={{ borderColor: '#f4b400', color: '#f4b400' }} onClick={(e) => handleSubmit(null, false)}>{isEditing ? 'Cập nhật' : 'Lưu nháp'}</button>
                                <button type="submit" className="btn btn-primary" onClick={(e) => handleSubmit(e, true)}>{isEditing ? 'Cập nhật & Nộp' : 'Nộp hồ sơ'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showReportModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Báo cáo sau chuyến đi: {selectedRecord?.ma_ho_so}</h3>
                            <button className="btn-icon" onClick={() => setShowReportModal(false)}><MdClose size={24} /></button>
                        </div>
                        <form onSubmit={handleReportSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Nội dung báo cáo</label>
                                    <textarea className="form-control" required rows="4" value={newReport.noi_dung_bao_cao} placeholder="Tóm tắt nội dung chuyến đi..." onChange={e => setNewReport({ ...newReport, noi_dung_bao_cao: e.target.value })}></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Kết quả đạt được</label>
                                    <textarea className="form-control" required rows="4" value={newReport.ket_qua_dat_duoc} placeholder="Các kết quả cụ thể đạt được..." onChange={e => setNewReport({ ...newReport, ket_qua_dat_duoc: e.target.value })}></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Kiến nghị</label>
                                    <textarea className="form-control" rows="3" value={newReport.kien_nghi} placeholder="Các đề xuất, kiến nghị sau chuyến đi..." onChange={e => setNewReport({ ...newReport, kien_nghi: e.target.value })}></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Tài liệu đính kèm (Minh chứng, báo cáo chi tiết...)</label>
                                    <input type="file" className="form-control" multiple onChange={e => setReportFiles(Array.from(e.target.files))} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowReportModal(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary">Gửi báo cáo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDetailModal && selectedRecord && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Chi tiết hồ sơ: {selectedRecord.ma_ho_so}</h3>
                            <button className="btn-icon" onClick={() => { setShowDetailModal(false); setReportData(null); }}><MdClose size={24} /></button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', color: '#5f6368', marginBottom: '16px', letterSpacing: '0.5px' }}>Thông tin chung</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Người đi</label>
                                            <div style={{ fontWeight: '500' }}>{selectedRecord.ho_ten}</div>
                                        </div>
                                        <div>
                                            <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Loại chuyến đi</label>
                                            <div style={{ fontWeight: '500' }}>{selectedRecord.ten_loai}</div>
                                        </div>
                                        <div>
                                            <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Quốc gia</label>
                                            <div style={{ fontWeight: '500' }}>{selectedRecord.ten_quoc_gia}</div>
                                        </div>
                                        <div>
                                            <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Thời gian</label>
                                            <div style={{ fontWeight: '500' }}>{new Date(selectedRecord.tu_ngay).toLocaleDateString('vi-VN')} - {new Date(selectedRecord.den_ngay).toLocaleDateString('vi-VN')}</div>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '16px' }}>
                                        <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Địa điểm cụ thể</label>
                                        <div style={{ fontWeight: '500' }}>{selectedRecord.dia_diem_cu_the}</div>
                                    </div>

                                    <div style={{ marginTop: '16px' }}>
                                        <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Nội dung công việc</label>
                                        <div style={{ fontWeight: '500', lineHeight: '1.5' }}>{selectedRecord.noi_dung_cong_viec}</div>
                                    </div>

                                    <div style={{ marginTop: '16px' }}>
                                        <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Kinh phí</label>
                                        <div style={{ fontWeight: '500' }}>{selectedRecord.nguon_kinh_phi} ({new Intl.NumberFormat('vi-VN').format(selectedRecord.kinh_phi)} VNĐ)</div>
                                    </div>

                                    {reportData && (
                                        <div style={{ marginTop: '32px', padding: '20px', backgroundColor: '#f3e5f5', borderRadius: '8px', border: '1px solid #e1bee7' }}>
                                            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', color: '#6a1b9a', marginBottom: '16px', letterSpacing: '0.5px' }}>Báo cáo sau chuyến đi</h4>
                                            <div style={{ marginBottom: '12px' }}>
                                                <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Trạng thái báo cáo</label>
                                                <span className={`badge badge-${reportData.trang_thai.toLowerCase()}`} style={{
                                                    backgroundColor: reportData.trang_thai === 'DA_DUYET' ? '#0f9d58' : (reportData.trang_thai === 'CHO_DUYET' ? '#f4b400' : '#d93025')
                                                }}>
                                                    {reportData.trang_thai === 'DA_DUYET' ? 'Đã duyệt' : (reportData.trang_thai === 'CHO_DUYET' ? 'Chờ duyệt' : 'Yêu cầu bổ sung')}
                                                </span>
                                            </div>
                                            <div style={{ marginBottom: '12px' }}>
                                                <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Nội dung</label>
                                                <div style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{reportData.noi_dung_bao_cao}</div>
                                            </div>
                                            <div style={{ marginBottom: '12px' }}>
                                                <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Kết quả</label>
                                                <div style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{reportData.ket_qua_dat_duoc}</div>
                                            </div>
                                            {reportData.kien_nghi && (
                                                <div style={{ marginBottom: '12px' }}>
                                                    <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Kiến nghị</label>
                                                    <div style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{reportData.kien_nghi}</div>
                                                </div>
                                            )}
                                            {reportData.y_kien_phan_hoi && (
                                                <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#fff', borderRadius: '4px', borderLeft: '4px solid #6a1b9a' }}>
                                                    <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Phản hồi từ TCNS/Chi bộ</label>
                                                    <div style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>{reportData.y_kien_phan_hoi}</div>
                                                </div>
                                            )}

                                            {/* Report Files */}
                                            {reportData.files && reportData.files.length > 0 && (
                                                <div style={{ marginTop: '16px' }}>
                                                    <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>File báo cáo</label>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                        {reportData.files.map(file => (
                                                            <a key={file.id} href={`http://localhost:3000/uploads/${file.duong_dan}`} target="_blank" rel="noopener noreferrer"
                                                                style={{ fontSize: '0.8rem', padding: '4px 8px', backgroundColor: '#fff', border: '1px solid #dadce0', borderRadius: '4px', textDecoration: 'none', color: '#1a73e8' }}>
                                                                {file.ten_file_goc}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Approval buttons for TCNS/Chi bộ */}
                                            {reportData.trang_thai === 'CHO_DUYET' && (user.roles.includes('TCNS') || user.roles.includes('CHI_BO')) && (
                                                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                                    <button className="btn btn-outline" style={{ borderColor: '#d93025', color: '#d93025', flex: 1 }} onClick={() => handleApproveReport(reportData.id, 'YEU_CAU_BO_SUNG')}>Yêu cầu bổ sung</button>
                                                    <button className="btn btn-primary" style={{ backgroundColor: '#0f9d58', flex: 1 }} onClick={() => handleApproveReport(reportData.id, 'DA_DUYET')}>Duyệt báo cáo</button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', color: '#5f6368', marginBottom: '16px', letterSpacing: '0.5px' }}>Tài liệu đính kèm</h4>
                                    {selectedRecord.files && selectedRecord.files.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {selectedRecord.files.map(file => (
                                                <div key={file.id} style={{ padding: '10px 12px', border: '1px solid #dadce0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{file.ten_file_goc}</span>
                                                    <a href={`http://localhost:3000/uploads/${file.duong_dan}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Xem</a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted" style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>Không có tài liệu đính kèm</p>
                                    )}

                                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', color: '#5f6368', marginBottom: '16px', marginTop: '32px', letterSpacing: '0.5px' }}>Lịch sử xử lý</h4>
                                    {selectedRecord.logs && selectedRecord.logs.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '250px', overflowY: 'auto', paddingRight: '8px' }}>
                                            {selectedRecord.logs.map((log, index) => (
                                                <div key={index} style={{ position: 'relative', paddingLeft: '20px', borderLeft: '2px solid #dadce0' }}>
                                                    <div style={{ position: 'absolute', left: '-6px', top: '0', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#1a73e8' }}></div>
                                                    <div style={{ fontSize: '0.75rem', color: '#5f6368', marginBottom: '2px' }}>{new Date(log.thoi_gian_xu_ly).toLocaleString('vi-VN')}</div>
                                                    <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{log.ten_buoc || 'Xử lý'} - {log.ket_qua}</div>
                                                    <div style={{ fontSize: '0.8rem' }}>{log.nguoi_thuc_hien_ten}</div>
                                                    {log.y_kien && <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: '#5f6368', marginTop: '4px', padding: '6px 10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>"{log.y_kien}"</div>}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted" style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>Chưa có lịch sử xử lý</p>
                                    )}
                                </div>
                            </div>

                            {canProcess(selectedRecord) && (
                                <div style={{ marginTop: '32px', padding: '24px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dadce0' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Thực hiện xử lý hồ sơ</h4>
                                    <div className="form-group">
                                        <label>Ý kiến xử lý</label>
                                        <textarea id="process-comment" className="form-control" rows="3" placeholder="Nhập ý kiến nhận xét hoặc lý do từ chối..."></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>Tài liệu đính kèm (nếu có)</label>
                                        <input type="file" className="form-control" multiple onChange={e => setProcessFiles(Array.from(e.target.files))} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                                        <button className="btn btn-danger" onClick={() => {
                                            const comment = document.getElementById('process-comment').value;
                                            handleAction(selectedRecord.ma_ho_so, 'REJECTED', comment, processFiles);
                                            setShowDetailModal(false);
                                        }}>Từ chối</button>
                                        <button className="btn btn-outline" style={{ borderColor: '#f4b400', color: '#f4b400' }} onClick={() => {
                                            const comment = document.getElementById('process-comment').value;
                                            handleAction(selectedRecord.ma_ho_so, 'RETURNED', comment, processFiles);
                                            setShowDetailModal(false);
                                        }}>Yêu cầu bổ sung</button>
                                        <button className="btn btn-primary" style={{ backgroundColor: '#0f9d58' }} onClick={() => {
                                            const comment = document.getElementById('process-comment').value;
                                            handleAction(selectedRecord.ma_ho_so, 'APPROVED', comment, processFiles);
                                            setShowDetailModal(false);
                                        }}>Duyệt hồ sơ</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            {['CHO_DON_VI', 'CHO_CHI_BO', 'CHO_DANG_UY', 'CHO_TCNS', 'CHO_BGH'].includes(selectedRecord.ma_trang_thai) && selectedRecord.ma_vien_chuc === user.ma_vien_chuc && (
                                <button className="btn btn-outline" style={{ borderColor: '#d93025', color: '#d93025', marginRight: 'auto' }} onClick={() => { handleWithdraw(selectedRecord.ma_ho_so); setShowDetailModal(false); }}>Rút hồ sơ</button>
                            )}
                            <button className="btn btn-outline" onClick={() => { setShowDetailModal(false); setReportData(null); }}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecordManagement;
