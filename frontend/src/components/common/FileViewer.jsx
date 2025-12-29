import React from 'react';
import { MdClose, MdDownload } from 'react-icons/md';

const FileViewer = ({ file, onClose }) => {
    if (!file) return null;

    const fileUrl = `http://localhost:3000/uploads/${file.duong_dan}`;
    const fileExtension = file.duong_dan.split('.').pop().toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
    const isPdf = fileExtension === 'pdf';

    return (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
            <div className="modal-content" style={{ maxWidth: '90vw', height: '90vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
                <div className="modal-header" style={{ padding: '12px 20px', borderBottom: '1px solid #dadce0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {file.ten_file_goc || file.ten_file || 'Tệp tin'}
                        </h3>
                        {file.kich_thuoc && (
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                ({(file.kich_thuoc / 1024).toFixed(1)} KB)
                            </span>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <a 
                            href={fileUrl} 
                            download={file.ten_file_goc || file.ten_file}
                            className="btn-icon" 
                            title="Tải xuống"
                            style={{ color: '#5f6368' }}
                        >
                            <MdDownload size={22} />
                        </a>
                        <button className="btn-icon" onClick={onClose} title="Đóng">
                            <MdClose size={24} />
                        </button>
                    </div>
                </div>
                <div className="modal-body" style={{ flex: 1, overflow: 'auto', padding: 0, backgroundColor: '#525659', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {isImage ? (
                        <img 
                            src={fileUrl} 
                            alt={file.ten_file_goc || file.ten_file} 
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                        />
                    ) : isPdf ? (
                        <iframe 
                            src={`${fileUrl}#toolbar=0`} 
                            title={file.ten_file_goc || file.ten_file}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                    ) : (
                        <div style={{ textAlign: 'center', color: '#fff', padding: '40px' }}>
                            <p>Định dạng tệp này không hỗ trợ xem trực tiếp.</p>
                            <a href={fileUrl} download={file.ten_file_goc || file.ten_file} className="btn btn-primary">
                                <MdDownload style={{ marginRight: '8px' }} />
                                Tải xuống để xem
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileViewer;
