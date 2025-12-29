import React, { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import notificationService from '../../services/notificationService';

const NotificationBell = ({ onViewChange }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const [notifsRes, countRes] = await Promise.all([
                notificationService.getNotifications(),
                notificationService.getUnreadCount()
            ]);
            if (notifsRes.success) setNotifications(notifsRes.data);
            if (countRes.success) setUnreadCount(countRes.count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 1 minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id, duong_dan) => {
        try {
            await notificationService.markAsRead(id);
            fetchNotifications();
            if (onViewChange) {
                // Redirect to appropriate view based on path
                if (duong_dan === '/records') {
                    onViewChange('my-records');
                } else {
                    onViewChange('dashboard');
                }
            }
            setIsOpen(false);
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async (e) => {
        e.stopPropagation();
        try {
            await notificationService.markAllAsRead();
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef} style={{ position: 'relative' }}>
            <div
                className="bell-icon"
                onClick={() => setIsOpen(!isOpen)}
                style={{ cursor: 'pointer', position: 'relative', padding: '8px', display: 'flex', alignItems: 'center' }}
            >
                <FaBell size={20} color="#5f6368" />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        backgroundColor: '#d93025',
                        color: 'white',
                        borderRadius: '50%',
                        padding: '2px 6px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        minWidth: '18px',
                        textAlign: 'center'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </div>

            {isOpen && (
                <div className="notification-dropdown" style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    width: '320px',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    borderRadius: '8px',
                    zIndex: 1000,
                    maxHeight: '400px',
                    overflowY: 'auto',
                    marginTop: '8px'
                }}>
                    <div style={{ padding: '12px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Thông báo</h4>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                style={{ background: 'none', border: 'none', color: '#1a73e8', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                                Đánh dấu tất cả đã đọc
                            </button>
                        )}
                    </div>
                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#70757a', fontSize: '0.85rem' }}>
                                Không có thông báo nào
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleMarkAsRead(notif.id, notif.duong_dan)}
                                    style={{
                                        padding: '12px',
                                        borderBottom: '1px solid #f1f3f4',
                                        backgroundColor: notif.da_doc ? 'transparent' : '#f8f9fa',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    <div style={{ fontWeight: notif.da_doc ? '400' : '600', fontSize: '0.85rem', marginBottom: '4px' }}>
                                        {notif.tieu_de}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#5f6368', marginBottom: '4px' }}>
                                        {notif.noi_dung}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#9aa0a6' }}>
                                        {new Date(notif.created_at).toLocaleString('vi-VN')}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
