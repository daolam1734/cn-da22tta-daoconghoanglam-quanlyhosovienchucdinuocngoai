import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import { MdClose, MdEmail, MdInfoOutline } from 'react-icons/md';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotMessage, setForgotMessage] = useState({ type: '', text: '' });

    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const result = await login(username, password);
            if (!result.success) {
                setError(result.message);
            }
        } catch (err) {
            setError('Đã có lỗi xảy ra');
        }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setForgotLoading(true);
        setForgotMessage({ type: '', text: '' });
        try {
            const res = await authService.forgotPassword(forgotEmail);
            if (res.success) {
                setForgotMessage({ type: 'success', text: res.message });
            } else {
                setForgotMessage({ type: 'error', text: res.message });
            }
        } catch (err) {
            setForgotMessage({ type: 'error', text: 'Lỗi kết nối đến máy chủ' });
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#f1f3f4'
        }}>
            <form onSubmit={handleSubmit} style={{
                padding: '40px',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #dadce0',
                width: '100%',
                maxWidth: '420px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <img
                        src="/logo.png"
                        alt="TVU Logo"
                        style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'contain',
                            marginBottom: '16px'
                        }}
                    />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-dark)', marginBottom: '8px' }}>HỆ THỐNG QUẢN LÝ HỒ SƠ VIÊN CHỨC ĐI NƯỚC NGOÀI</h1>
                    <p className="text-muted" style={{ fontSize: '0.95rem' }}>Đăng nhập bằng tài khoản viên chức</p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px 16px',
                        background: '#fce8e6',
                        color: '#d93025',
                        borderRadius: '4px',
                        marginBottom: '24px',
                        fontSize: '0.9rem',
                        border: '1px solid #f1998e',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{ fontSize: '1.2rem' }}>!</span> {error}
                    </div>
                )}

                <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{ fontWeight: '600', color: '#3c4043' }}>Tên đăng nhập</label>
                    <input
                        type="text"
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ padding: '12px' }}
                        placeholder="Ví dụ: vanc@tvu.edu.vn"
                    />
                </div>

                <div className="form-group" style={{ marginBottom: '32px' }}>
                    <label style={{ fontWeight: '600', color: '#3c4043', marginBottom: '8px', display: 'block' }}>Mật khẩu</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ padding: '12px' }}
                        placeholder="Nhập mật khẩu của bạn"
                    />
                    <div style={{ textAlign: 'right', marginTop: '8px' }}>
                        <button 
                            type="button" 
                            onClick={() => { setShowForgotModal(true); setForgotMessage({ type: '', text: '' }); setForgotEmail(''); }}
                            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
                        >
                            Quên mật khẩu?
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        height: 'auto'
                    }}
                >
                    Đăng nhập
                </button>

                <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.85rem', color: '#5f6368', borderTop: '1px solid #f1f3f4', paddingTop: '24px' }}>
                    &copy; 2025 Trường Đại học Trà Vinh
                    <br />
                    <span style={{ fontSize: '0.75rem' }}>Trung tâm Công nghệ Thông tin</span>
                </div>
            </form>

            {showForgotModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <MdInfoOutline /> Quên mật khẩu
                            </h3>
                            <button className="btn-icon" onClick={() => setShowForgotModal(false)}>
                                <MdClose size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleForgotSubmit}>
                            <div className="modal-body">
                                {forgotMessage.text ? (
                                    <div style={{ 
                                        padding: '16px', 
                                        borderRadius: '8px', 
                                        backgroundColor: forgotMessage.type === 'success' ? '#e6f4ea' : '#fce8e6',
                                        color: forgotMessage.type === 'success' ? '#1e8e3e' : '#d93025',
                                        fontSize: '0.9rem',
                                        lineHeight: '1.5',
                                        marginBottom: '16px'
                                    }}>
                                        {forgotMessage.text}
                                    </div>
                                ) : (
                                    <p style={{ fontSize: '0.9rem', color: '#5f6368', marginBottom: '20px' }}>
                                        Vui lòng nhập địa chỉ email đã đăng ký với tài khoản của bạn. Chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu.
                                    </p>
                                )}
                                
                                {!forgotMessage.text && (
                                    <div className="form-group">
                                        <label>Email đăng ký</label>
                                        <div style={{ position: 'relative' }}>
                                            <MdEmail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#5f6368' }} />
                                            <input 
                                                type="email" 
                                                className="form-control" 
                                                placeholder="email@tvu.edu.vn"
                                                style={{ paddingLeft: '40px' }}
                                                required
                                                value={forgotEmail}
                                                onChange={(e) => setForgotEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowForgotModal(false)}>
                                    {forgotMessage.text ? 'Đóng' : 'Hủy'}
                                </button>
                                {!forgotMessage.text && (
                                    <button type="submit" className="btn btn-primary" disabled={forgotLoading}>
                                        {forgotLoading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginPage;
