import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import regulationService from '../services/regulationService';
import { 
    MdDownload, 
    MdAdd, 
    MdEdit, 
    MdDelete, 
    MdPictureAsPdf, 
    MdDescription, 
    MdInsertDriveFile,
    MdClose,
    MdSearch,
    MdFilterList
} from 'react-icons/md';

const RegulationManagement = () => {
    const { user } = useAuth();
    const isAdmin = user?.roles?.includes('ADMIN');

    const [regulations, setRegulations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        tieu_de: '',
        mo_ta: '',
        loai: 'QUY_DINH',
        file: null
    });

    const fetchRegulations = async () => {
        try {
            const res = await regulationService.getAll();
            if (res.success) setRegulations(res.data);
        } catch (error) {
            console.error('Error fetching regulations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegulations();
    }, []);

    const handleDownload = async (item) => {
        try {
            await regulationService.incrementDownload(item.id);
            const link = document.createElement('a');
            link.href = `http://localhost:3000/uploads/${item.duong_dan}`;
            link.setAttribute('download', item.ten_file_goc);
            document.body.appendChild(link);
            link.click();
            link.remove();
            fetchRegulations();
        } catch (error) {
            console.error('Download error:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('tieu_de', formData.tieu_de);
        data.append('mo_ta', formData.mo_ta);
        data.append('loai', formData.loai);
        if (formData.file) data.append('file', formData.file);

        try {
            let res;
            if (editingItem) {
                res = await regulationService.update(editingItem.id, data);
            } else {
                res = await regulationService.create(data);
            }

            if (res.success) {
                setShowModal(false);
                setEditingItem(null);
                setFormData({ tieu_de: '', mo_ta: '', loai: 'QUY_DINH', file: null });
                fetchRegulations();
            } else {
                alert(res.message);
            }
        } catch (error) {
            console.error('Submit error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa?')) {
            try {
                const res = await regulationService.delete(id);
                if (res.success) fetchRegulations();
            } catch (error) {
                console.error('Delete error:', error);
            }
        }
    };

    const getFileIcon = (mime) => {
        if (mime?.includes('pdf')) return <MdPictureAsPdf size={24} style={{ color: '#d93025' }} />;
        if (mime?.includes('word') || mime?.includes('officedocument')) return <MdDescription size={24} style={{ color: '#1a73e8' }} />;
        return <MdInsertDriveFile size={24} style={{ color: '#5f6368' }} />;
    };

    const filteredRegulations = regulations.filter(reg => 
        reg.tieu_de.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.mo_ta?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderRegulationSection = (type, title, color) => {
        const items = filteredRegulations.filter(r => r.loai === type);
        if (items.length === 0 && searchTerm === '') return null;

        return (
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '4px', height: '24px', backgroundColor: color, borderRadius: '2px' }}></div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>{title} ({items.length})</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                    {items.map(item => (
                        <div key={item.id} className="card" style={{ padding: '16px', marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #e8eaed', boxShadow: 'none' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        {getFileIcon(item.loai_file || item.mime_type)}
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', margin: 0, color: '#202124' }}>{item.tieu_de}</h3>
                                    </div>
                                    {isAdmin && (
                                        <div style={{ display: 'flex', gap: '2px' }}>
                                            <button className="btn-icon" style={{ padding: '4px' }} onClick={() => { setEditingItem(item); setFormData({ tieu_de: item.tieu_de, mo_ta: item.mo_ta || '', loai: item.loai, file: null }); setShowModal(true); }} title="Sửa">
                                                <MdEdit size={16} />
                                            </button>
                                            <button className="btn-icon" style={{ color: '#d93025', padding: '4px' }} onClick={() => handleDelete(item.id)} title="Xóa">
                                                <MdDelete size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {item.mo_ta || 'Không có mô tả.'}
                                </p>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #f1f3f4' }}>
                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                    {item.luot_tai} lượt tải • {new Date(item.ngay_tao || item.created_at).toLocaleDateString('vi-VN')}
                                </div>
                                <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleDownload(item)}>
                                    <MdDownload size={14} /> Tải xuống
                                </button>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && searchTerm !== '' && (
                        <div className="text-muted" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '20px' }}>Không tìm thấy kết quả.</div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '8px' }}>Quy định & Biểu mẫu</h1>
                    <p className="text-muted">Các văn bản hướng dẫn và biểu mẫu hồ sơ đi nước ngoài</p>
                </div>
                {isAdmin && (
                    <button className="btn btn-primary" onClick={() => { setEditingItem(null); setFormData({ tieu_de: '', mo_ta: '', loai: 'QUY_DINH', file: null }); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MdAdd size={20} /> Thêm văn bản
                    </button>
                )}
            </div>

            <div className="card" style={{ padding: '16px', marginBottom: '32px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <MdSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#5f6368' }} />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm tiêu đề hoặc nội dung..." 
                        className="form-control"
                        style={{ paddingLeft: '40px', marginBottom: 0 }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MdFilterList /> Bộ lọc
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải dữ liệu...</div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '32px' }}>
                        <div>
                            {renderRegulationSection('QUY_DINH', 'Quy định & Hướng dẫn', 'var(--primary-dark)')}
                        </div>
                        <div>
                            {renderRegulationSection('BIEU_MAU', 'Biểu mẫu hồ sơ', '#1e8e3e')}
                        </div>
                    </div>
                    {renderRegulationSection('KHAC', 'Văn bản khác', '#f9ab00')}
                </>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3>{editingItem ? 'Cập nhật văn bản' : 'Thêm văn bản mới'}</h3>
                            <button className="btn-icon" onClick={() => setShowModal(false)}><MdClose size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tiêu đề</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    required 
                                    value={formData.tieu_de}
                                    onChange={e => setFormData({...formData, tieu_de: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea 
                                    className="form-control" 
                                    rows="3"
                                    value={formData.mo_ta}
                                    onChange={e => setFormData({...formData, mo_ta: e.target.value})}
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label>Loại văn bản</label>
                                <select 
                                    className="form-control"
                                    value={formData.loai}
                                    onChange={e => setFormData({...formData, loai: e.target.value})}
                                >
                                    <option value="QUY_DINH">Quy định & Hướng dẫn</option>
                                    <option value="BIEU_MAU">Biểu mẫu hồ sơ</option>
                                    <option value="KHAC">Văn bản khác</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Tệp tin {editingItem && '(Để trống nếu không thay đổi)'}</label>
                                <input 
                                    type="file" 
                                    className="form-control" 
                                    required={!editingItem}
                                    onChange={e => setFormData({...formData, file: e.target.files[0]})}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary">
                                    {editingItem ? 'Cập nhật' : 'Lưu văn bản'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegulationManagement;

