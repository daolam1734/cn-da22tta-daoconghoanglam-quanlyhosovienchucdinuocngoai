import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import { MdPerson } from 'react-icons/md';

const Header = ({ onViewChange }) => {
    const { user } = useAuth();

    return (
        <header className="header">
            <div className="header-left">
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary-dark)' }}>HỆ THỐNG QUẢN LÝ HỒ SƠ VIÊN CHỨC ĐI NƯỚC NGOÀI</h2>
            </div>
            <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <NotificationBell onViewChange={onViewChange} />
                <div
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                    onClick={() => onViewChange('profile')}
                >
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#081642ff' }}>{user?.fullName}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{user?.chuc_vu || user?.roles?.[0]}</div>
                    </div>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#f1f3f4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        border: '1px solid #e8eaed'
                    }}>
                        {user?.avatar_url ? (
                            <img
                                src={`http://localhost:3000${user.avatar_url}`}
                                alt="Avatar"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <MdPerson size={24} color="#5f6368" />
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
