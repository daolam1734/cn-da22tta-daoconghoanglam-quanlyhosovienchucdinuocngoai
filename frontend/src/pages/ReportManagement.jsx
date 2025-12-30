import React, { useState, useEffect } from 'react';
import reportService from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { MdCheckCircle, MdError, MdInfo, MdVisibility } from 'react-icons/md';

const ReportManagement = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [feedback, setFeedback] = useState('');
    const { user } = useAuth();
    const { showToast } = useToast();

    useEffect(() => {
        fetchPendingReports();
    }, []);

    const fetchPendingReports = async () => {
        setLoading(true);
        try {
            const result = await reportService.getPendingReports();
            if (result.success) {
                setReports(result.data);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            showToast('Lỗi khi tải danh sách báo cáo', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, status) => {
        try {
            const result = await reportService.approveReport(id, status, feedback);
            if (result.success) {
                showToast('Cập nhật trạng thái báo cáo thành công', 'success');
                setShowDetailModal(false);
                setFeedback('');
                fetchPendingReports();
            } else {
                showToast(result.message, 'error');
            }
        } catch (error) {
            console.error('Error approving report:', error);
            showToast('Lỗi hệ thống', 'error');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'CHO_DUYET': return <span className="badge badge-warning">Chờ duyệt</span>;
            case 'DA_DUYET': return <span className="badge badge-success">Đã duyệt</span>;
            case 'YEU_CAU_BO_SUNG': return <span className="badge badge-danger">Yêu cầu bổ sung</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    if (loading) return <div className="p-4">Đang tải danh sách báo cáo...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h2 className="page-title">Duyệt báo cáo sau chuyến đi</h2>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Mã hồ sơ</th>
                                <th>Viên chức</th>
                                <th>Loại chuyến đi</th>
                                <th>Ngày nộp</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                        Không có báo cáo nào đang chờ duyệt
                                    </td>
                                </tr>
                            ) : (
                                reports.map(report => (
                                    <tr key={report.id}>
                                        <td><strong>{report.ma_ho_so}</strong></td>
                                        <td>{report.ho_ten}</td>
                                        <td>{report.ten_loai}</td>
                                        <td>{new Date(report.ngay_nop).toLocaleDateString('vi-VN')}</td>
                                        <td>{getStatusBadge(report.ma_trang_thai)}</td>
                                        <td>
                                            <button 
                                                className="btn btn-icon" 
                                                title="Xem chi tiết"
                                                onClick={() => {
                                                    setSelectedReport(report);
                                                    setShowDetailModal(true);
                                                }}
                                            >
                                                <MdVisibility />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showDetailModal && selectedReport && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h3>Chi tiết báo cáo: {selectedReport.ma_ho_so}</h3>
                            <button className="close-btn" onClick={() => setShowDetailModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item full-width">
                                    <label>Viên chức:</label>
                                    <span>{selectedReport.ho_ten}</span>
                                </div>
                                <div className="detail-item full-width">
                                    <label>Nội dung báo cáo:</label>
                                    <div className="content-box">{selectedReport.noi_dung_bao_cao}</div>
                                </div>
                                <div className="detail-item full-width">
                                    <label>Kết quả đạt được:</label>
                                    <div className="content-box">{selectedReport.ket_qua_dat_duoc}</div>
                                </div>
                                <div className="detail-item full-width">
                                    <label>Kiến nghị:</label>
                                    <div className="content-box">{selectedReport.kien_nghi}</div>
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                    Ý kiến phản hồi:
                                </label>
                                <textarea 
                                    className="form-control"
                                    rows="3"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Nhập ý kiến phản hồi cho viên chức..."
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowDetailModal(false)}>Đóng</button>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    className="btn btn-danger" 
                                    onClick={() => handleApprove(selectedReport.id, 'YEU_CAU_BO_SUNG')}
                                >
                                    Yêu cầu bổ sung
                                </button>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={() => handleApprove(selectedReport.id, 'DA_DUYET')}
                                >
                                    Duyệt báo cáo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .content-box {
                    background: #f8f9fa;
                    padding: 1rem;
                    border-radius: 4px;
                    border: 1px solid #e0e0e0;
                    white-space: pre-wrap;
                    margin-top: 0.5rem;
                }
                .detail-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                .detail-item.full-width {
                    grid-column: span 2;
                }
                .detail-item label {
                    font-weight: bold;
                    color: #5f6368;
                    display: block;
                }
            `}} />
        </div>
    );
};

export default ReportManagement;
