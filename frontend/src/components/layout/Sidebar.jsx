import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    MdDashboard,
    MdDescription,
    MdGavel,
    MdAssignment,
    MdBusiness,
    MdPeople,
    MdSecurity,
    MdSettings,
    MdAccountTree,
    MdPerson,
    MdLogout
} from 'react-icons/md';

const Sidebar = ({ activeView, onViewChange }) => {
    const { user, logout } = useAuth();

    const menuItems = [
        { id: 'dashboard', label: 'Bảng điều khiển', icon: <MdDashboard />, roles: ['ALL'] },
        { id: 'my-records', label: 'Hồ sơ của tôi', icon: <MdDescription />, roles: ['VIEN_CHUC'] },
        { id: 'process-records', label: 'Duyệt hồ sơ', icon: <MdGavel />, roles: ['TRUONG_DON_VI', 'CHI_BO', 'DANG_UY', 'TCNS', 'BGH'] },
        { id: 'regulations', label: 'Quy định - Biểu mẫu', icon: <MdAssignment />, roles: ['ALL'] },
        { id: 'units', label: 'Quản lý đơn vị', icon: <MdBusiness />, roles: ['ADMIN'] },
        { id: 'users', label: 'Quản lý người dùng', icon: <MdPeople />, roles: ['ADMIN'] },
        { id: 'roles', label: 'Quản lý vai trò', icon: <MdSecurity />, roles: ['ADMIN'] },
        { id: 'system-config', label: 'Cấu hình hệ thống', icon: <MdSettings />, roles: ['ADMIN'] },
        { id: 'workflows', label: 'Cấu hình luồng', icon: <MdAccountTree />, roles: ['ADMIN'] },
        { id: 'profile', label: 'Cá nhân', icon: <MdPerson />, roles: ['ALL'] },
    ];

    const filteredMenu = menuItems.filter(item =>
        item.roles.includes('ALL') || (user?.roles && user.roles.some(role => item.roles.includes(role)))
    );

    return (
        <aside className="sidebar">
            <div className="sidebar-header" style={{ justifyContent: 'center' }}>
                <img
                    src="/logo.png"
                    alt="TVU Logo"
                    style={{
                        width: '48px',
                        height: '48px',
                        objectFit: 'contain'
                    }}
                />
            </div>
            <nav className="sidebar-menu">
                {filteredMenu.map(item => (
                    <div
                        key={item.id}
                        className={`menu-item ${activeView === item.id ? 'active' : ''}`}
                        onClick={() => onViewChange(item.id)}
                    >
                        <span style={{ marginRight: '12px', fontSize: '1.1rem' }}>{item.icon}</span>
                        {item.label}
                    </div>
                ))}
            </nav>
            <div className="sidebar-footer">
                <div
                    className="menu-item"
                    onClick={logout}
                    style={{ color: '#d93025' }}
                >
                    <span style={{ marginRight: '12px', fontSize: '1.1rem' }}><MdLogout /></span>
                    Đăng xuất
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
