import React from 'react';
import { MdLocationOn, MdPhone, MdEmail, MdLanguage } from 'react-icons/md';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <img
                            src="/logo.png"
                            alt="TVU Logo"
                            style={{
                                width: '24px',
                                height: '24px',
                                objectFit: 'contain'
                            }}
                        />
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#202124', margin: 0 }}>TRƯỜNG ĐẠI HỌC TRÀ VINH</h3>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#5f6368', lineHeight: '1.6', maxWidth: '400px' }}>
                        Hệ thống Quản lý Hồ sơ đi nước ngoài - Giải pháp chuyển đổi số trong công tác quản lý viên chức và hợp tác quốc tế.
                    </p>
                </div>

                <div className="footer-section">
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '12px', color: '#202124' }}>Liên hệ</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#5f6368' }}>
                            <MdLocationOn size={16} color="#1a73e8" />
                            <span>126 Nguyễn Thiện Thành, Phường Hòa Thuận, tỉnh Vĩnh Long</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#5f6368' }}>
                            <MdPhone size={16} color="#1a73e8" />
                            <span>(+84).294.3855246</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#5f6368' }}>
                            <MdEmail size={16} color="#1a73e8" />
                            <span>tvu@tvu.edu.vn</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#5f6368' }}>
                            <MdLanguage size={16} color="#1a73e8" />
                            <a href="https://www.tvu.edu.vn" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>www.tvu.edu.vn</a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} Tra Vinh University. All rights reserved.</p>
                <p>Phiên bản 2.0.0</p>
            </div>
        </footer>
    );
};

export default Footer;
