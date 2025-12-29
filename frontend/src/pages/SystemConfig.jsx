import React, { useState, useEffect } from 'react';
import systemService from '../services/systemService';
import { MdSettings, MdSave, MdRefresh, MdInfoOutline, MdToggleOn, MdToggleOff } from 'react-icons/md';

const SystemConfig = () => {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);

    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const res = await systemService.getConfigs();
            if (res.success) {
                setConfigs(res.data);
            }
        } catch (error) {
            console.error('Error fetching configs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    const handleUpdate = async (config) => {
        setSaving(config.ma_cau_hinh);
        try {
            const res = await systemService.updateConfig(config);
            if (res.success) {
                // Success notification could be added here
            } else {
                alert(res.message);
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('Lỗi khi cập nhật cấu hình');
        } finally {
            setSaving(null);
        }
    };

    const handleChange = (ma_cau_hinh, field, value) => {
        setConfigs(configs.map(c => 
            c.ma_cau_hinh === ma_cau_hinh ? { ...c, [field]: value } : c
        ));
    };

    const groups = {
        'THOI_GIAN': 'Cấu hình thời gian',
        'VALIDATION': 'Quy tắc kiểm chuẩn',
        'FILE': 'Cấu hình tệp tin',
        'EMAIL': 'Cấu hình Email',
        'OTHER': 'Cấu hình khác'
    };

    if (loading) return <div className="page-container">Đang tải cấu hình...</div>;

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <MdSettings /> Cấu hình hệ thống
                    </h1>
                    <p className="text-muted">Quản lý các tham số vận hành của toàn hệ thống</p>
                </div>
                <button className="btn btn-outline" onClick={fetchConfigs} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MdRefresh /> Làm mới
                </button>
            </div>

            {Object.keys(groups).map(groupKey => {
                const groupConfigs = configs.filter(c => c.nhom === groupKey);
                if (groupConfigs.length === 0) return null;

                return (
                    <div key={groupKey} className="card" style={{ padding: '24px', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary-dark)', marginBottom: '20px', borderBottom: '1px solid #e8f0fe', paddingBottom: '12px' }}>
                            {groups[groupKey]}
                        </h3>
                        <div style={{ display: 'grid', gap: '20px' }}>
                            {groupConfigs.map(config => (
                                <div key={config.ma_cau_hinh} style={{ display: 'grid', gridTemplateColumns: '1fr 200px 100px', gap: '24px', alignItems: 'center', padding: '12px', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px' }}>{config.ten_cau_hinh}</div>
                                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                                            <MdInfoOutline size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                            Mã: {config.ma_cau_hinh}
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        {config.loai === 'BOOLEAN' ? (
                                            <select 
                                                className="form-control" 
                                                value={config.gia_tri} 
                                                onChange={(e) => handleChange(config.ma_cau_hinh, 'gia_tri', e.target.value)}
                                            >
                                                <option value="true">Bật</option>
                                                <option value="false">Tắt</option>
                                            </select>
                                        ) : (
                                            <input 
                                                type={config.loai === 'NUMBER' ? 'number' : 'text'} 
                                                className="form-control" 
                                                value={config.gia_tri} 
                                                onChange={(e) => handleChange(config.ma_cau_hinh, 'gia_tri', e.target.value)}
                                            />
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button 
                                            className="btn btn-primary" 
                                            style={{ padding: '8px', minWidth: '40px' }}
                                            onClick={() => handleUpdate(config)}
                                            disabled={saving === config.ma_cau_hinh}
                                        >
                                            {saving === config.ma_cau_hinh ? '...' : <MdSave size={20} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SystemConfig;
