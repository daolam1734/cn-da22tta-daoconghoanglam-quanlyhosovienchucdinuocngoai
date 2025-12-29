import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
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
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#202124', marginBottom: '8px' }}>Hệ thống Quản lý Hồ sơ</h1>
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
                    <label style={{ fontWeight: '600', color: '#3c4043' }}>Mật khẩu</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ padding: '12px' }}
                        placeholder="Nhập mật khẩu của bạn"
                    />
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
                    <span style={{ fontSize: '0.75rem' }}>Phòng Tổ chức Nhân sự - Trung tâm Công nghệ Thông tin</span>
                </div>
            </form>
        </div>
    );
};

export default LoginPage;
