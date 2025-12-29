import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import dashboardService from '../services/dashboardService';
import notificationService from '../services/notificationService';
import {
    MdAddCircleOutline,
    MdDescription,
    MdHelpOutline,
    MdNotificationsNone,
    MdHistory,
    MdArrowForward,
    MdCheckCircle,
    MdInfoOutline,
    MdAssignment
} from 'react-icons/md';

const Dashboard = ({ onViewChange }) => {
    const { user } = useAuth();
    const [data, setData] = useState({ stats: [], recentActivities: [] });
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, notifyRes] = await Promise.all([
                    dashboardService.getStats(),
                    notificationService.getNotifications()
                ]);

                if (statsRes.success) {
                    setData(statsRes.data);
                }
                if (notifyRes.success) {
                    setNotifications(notifyRes.data.slice(0, 5)); // Show top 5
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div className="page-container">Đang tải dữ liệu...</div>;

    return (
        <div className="page-container">
            <div style={{ marginBottom: '32px' }}>
                <h1 className="page-title" style={{ marginBottom: '8px' }}>Chào mừng trở lại, {user?.fullName}!</h1>
                <p className="text-muted">Hệ thống quản lý hồ sơ đi nước ngoài - Trường Đại học Trà Vinh</p>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="card" style={{ padding: '20px', cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid #e8f0fe', backgroundColor: '#f8faff' }} onClick={() => onViewChange('my-records')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#e8f0fe', color: '#1a73e8' }}>
                            <MdAddCircleOutline size={24} />
                        </div>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Tạo hồ sơ mới</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>Bắt đầu quy trình đi nước ngoài</div>
                        </div>
                    </div>
                </div>
                <div className="card" style={{ padding: '20px', cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid #fef7e0', backgroundColor: '#fffcf5' }} onClick={() => onViewChange('regulations')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#fef7e0', color: '#f9ab00' }}>
                            <MdAssignment size={24} />
                        </div>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Quy định & Biểu mẫu</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>Xem các văn bản hướng dẫn</div>
                        </div>
                    </div>
                </div>
                <div className="card" style={{ padding: '20px', cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid #e6f4ea', backgroundColor: '#f6fbf8' }} onClick={() => onViewChange('profile')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#e6f4ea', color: '#1e8e3e' }}>
                            <MdDescription size={24} />
                        </div>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Thông tin cá nhân</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>Cập nhật thông tin viên chức</div>
                        </div>
                    </div>
                </div>
                <div className="card" style={{ padding: '20px', cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid #fce8e6', backgroundColor: '#fff8f7' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#fce8e6', color: '#d93025' }}>
                            <MdHelpOutline size={24} />
                        </div>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Hướng dẫn sử dụng</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>Giải đáp thắc mắc quy trình</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                {data.stats.map((stat, index) => (
                    <div key={index} className="card" style={{ padding: '24px', marginBottom: 0, borderLeft: `4px solid ${stat.color || '#1a73e8'}` }}>
                        <h3 className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', fontWeight: '600' }}>{stat.label}</h3>
                        <div className="value" style={{ fontSize: '1.75rem', fontWeight: '700', color: stat.color }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Process Flow */}
                    <div className="card" style={{ marginBottom: 0 }}>
                        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MdInfoOutline /> Quy trình phê duyệt hồ sơ
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', padding: '20px 0' }}>
                                <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '2px', backgroundColor: '#e8f0fe', zIndex: 1 }}></div>
                                {[
                                    { label: 'Tạo hồ sơ', icon: <MdDescription /> },
                                    { label: 'Đơn vị duyệt', icon: <MdCheckCircle /> },
                                    { label: 'TCNS thẩm định', icon: <MdCheckCircle /> },
                                    { label: 'BGH phê duyệt', icon: <MdCheckCircle /> },
                                    { label: 'Hoàn tất', icon: <MdCheckCircle /> }
                                ].map((step, i) => (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2, position: 'relative', backgroundColor: '#fff', padding: '0 10px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: i === 0 ? '#1a73e8' : '#f1f3f4', color: i === 0 ? '#fff' : '#5f6368', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '1.2rem' }}>
                                            <div style={{ margin: 'auto' }}>{step.icon}</div>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: '600', textAlign: 'center', maxWidth: '80px' }}>{step.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ marginBottom: 0 }}>
                        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MdHistory /> Hoạt động gần đây
                        </div>
                        <div className="card-body" style={{ padding: '0 24px' }}>
                            {data.recentActivities.length > 0 ? data.recentActivities.map((act, i) => (
                                <div key={i} style={{ padding: '16px 0', borderBottom: i === data.recentActivities.length - 1 ? 'none' : '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1a73e8' }}></div>
                                        <div>
                                            <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{act.title}</div>
                                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>{act.description}</div>
                                        </div>
                                    </div>
                                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                                        {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            )) : <div style={{ padding: '24px 0', textAlign: 'center', color: '#5f6368' }}>Chưa có hoạt động nào.</div>}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card" style={{ marginBottom: 0 }}>
                        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MdNotificationsNone /> Thông báo hệ thống
                        </div>
                        <div className="card-body" style={{ padding: '0 24px' }}>
                            <ul style={{ listStyle: 'none' }}>
                                {notifications.length > 0 ? notifications.map((notif, i) => (
                                    <li key={notif.id} style={{ padding: '16px 0', borderBottom: i === notifications.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                                        <div style={{
                                            color: notif.is_read ? '#5f6368' : '#1a73e8',
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            marginBottom: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            {!notif.is_read && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1a73e8' }}></div>}
                                            {notif.tieu_de || 'Thông báo mới'}
                                        </div>
                                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>{notif.noi_dung}</div>
                                        <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                                            {new Date(notif.ngay_tao).toLocaleDateString('vi-VN')}
                                        </div>
                                    </li>
                                )) : (
                                    <li style={{ padding: '24px 0', textAlign: 'center', color: '#5f6368' }}>
                                        Chưa có thông báo nào.
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    <div className="card" style={{ marginBottom: 0, backgroundColor: '#1a73e8', color: '#fff', border: 'none' }}>
                        <div className="card-body" style={{ padding: '24px' }}>
                            <h4 style={{ marginBottom: '12px', fontSize: '1rem' }}>Bạn cần hỗ trợ?</h4>
                            <p style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '20px', lineHeight: '1.5' }}>
                                Nếu gặp khó khăn trong quá trình sử dụng hệ thống, vui lòng liên hệ Phòng Tổ chức Nhân sự.
                            </p>
                            <button className="btn" style={{ backgroundColor: '#fff', color: '#1a73e8', width: '100%', fontWeight: '600' }}>
                                Xem hướng dẫn chi tiết
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

