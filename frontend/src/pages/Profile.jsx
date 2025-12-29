import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MdPerson, MdEmail, MdPhone, MdBadge, MdSchool, MdSave, MdDescription, MdPhotoCamera, MdSecurity, MdClose, MdLock } from 'react-icons/md';
import profileService from '../services/profileService';
import authService from '../services/authService';

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [metadata, setMetadata] = useState({ units: [], partyUnits: [] });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [profile, setProfile] = useState({
        ho_ten: '',
        email: '',
        so_dien_thoai: '',
        so_ho_chieu: '',
        ngay_cap_ho_chieu: '',
        ngay_het_han_ho_chieu: '',
        hoc_ham: '',
        hoc_vi: '',
        chuyen_nganh: '',
        ngay_sinh: '',
        gioi_tinh: 'NAM',
        ma_don_vi: '',
        chuc_vu: '',
        cccd: '',
        avatar_url: '',
        is_dang_vien: false,
        ma_don_vi_dang: '',
        ngay_vao_dang: '',
        ngay_chinh_thuc: '',
        so_the_dang: '',
        chuc_vu_dang: ''
    });

    const todayStr = new Date().toISOString().split('T')[0];

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const [profileRes, metadataRes] = await Promise.all([
                profileService.getProfile(),
                profileService.getMetadata()
            ]);

            if (metadataRes.success) {
                setMetadata(metadataRes.data);
            }

            if (profileRes.success) {
                const data = profileRes.data;
                setProfile({
                    ho_ten: data.ho_ten || '',
                    email: data.staff_email || data.user_email || '',
                    so_dien_thoai: data.so_dien_thoai || '',
                    so_ho_chieu: data.so_ho_chieu || '',
                    ngay_cap_ho_chieu: data.ngay_cap_ho_chieu ? data.ngay_cap_ho_chieu.split('T')[0] : '',
                    ngay_het_han_ho_chieu: data.ngay_het_han_ho_chieu ? data.ngay_het_han_ho_chieu.split('T')[0] : '',
                    hoc_ham: data.hoc_ham || '',
                    hoc_vi: data.hoc_vi || '',
                    chuyen_nganh: data.chuyen_nganh || '',
                    ngay_sinh: data.ngay_sinh ? data.ngay_sinh.split('T')[0] : '',
                    gioi_tinh: data.gioi_tinh || 'NAM',
                    ma_don_vi: data.ma_don_vi || '',
                    chuc_vu: data.chuc_vu || '',
                    cccd: data.cccd || '',
                    avatar_url: data.avatar_url || '',
                    is_dang_vien: !!data.ma_don_vi_dang,
                    ma_don_vi_dang: data.ma_don_vi_dang || '',
                    ngay_vao_dang: data.ngay_vao_dang ? data.ngay_vao_dang.split('T')[0] : '',
                    ngay_chinh_thuc: data.ngay_chinh_thuc ? data.ngay_chinh_thuc.split('T')[0] : '',
                    so_the_dang: data.so_the_dang || '',
                    chuc_vu_dang: data.chuc_vu_dang || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfile({ ...profile, [name]: type === 'checkbox' ? checked : value });
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const result = await profileService.updateAvatar(formData);
            if (result.success) {
                setProfile({ ...profile, avatar_url: result.data.avatar_url });
                alert('Đã cập nhật ảnh đại diện thành công!');
                // Optional: update user context if needed
            } else {
                alert(result.message || 'Lỗi khi tải ảnh lên');
            }
        } catch (error) {
            alert('Lỗi kết nối khi tải ảnh lên');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await profileService.updateProfile(profile);
            if (result.success) {
                alert('Đã cập nhật thông tin cá nhân thành công!');
                fetchProfile();
            } else {
                alert(result.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            alert('Lỗi kết nối đến server');
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword.length < 6) {
            alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
            return;
        }

        if (passwordData.oldPassword === passwordData.newPassword) {
            alert('Mật khẩu mới không được trùng với mật khẩu cũ!');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Xác nhận mật khẩu mới không khớp!');
            return;
        }
        
        setPasswordLoading(true);
        try {
            const res = await authService.changePassword(passwordData.oldPassword, passwordData.newPassword);
            if (res.success) {
                alert('Đổi mật khẩu thành công!');
                setShowPasswordModal(false);
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                alert(res.message);
            }
        } catch (error) {
            alert('Lỗi khi đổi mật khẩu');
        } finally {
            setPasswordLoading(false);
        }
    };

    if (loading) return <div className="page-container">Đang tải thông tin cá nhân...</div>;

    return (
        <div className="page-container">
            <div style={{ marginBottom: '32px' }}>
                <h1 className="page-title">Thông tin cá nhân</h1>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>Quản lý thông tin cá nhân và hồ sơ của bạn</p>
            </div>

            <div className="card" style={{ marginBottom: '24px', padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            backgroundColor: '#e8f0fe',
                            color: '#1a73e8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            border: '2px solid #fff',
                            boxShadow: '0 0 0 1px #dadce0',
                            overflow: 'hidden'
                        }}>
                            {profile.avatar_url ? (
                                <img 
                                    src={`http://localhost:3000/uploads/${profile.avatar_url}`} 
                                    alt="Avatar" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                            ) : (
                                profile.ho_ten ? profile.ho_ten.charAt(0) : 'U'
                            )}
                        </div>
                        <label style={{
                            position: 'absolute',
                            bottom: '0',
                            right: '0',
                            backgroundColor: '#fff',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            cursor: 'pointer',
                            color: '#5f6368'
                        }}>
                            <MdPhotoCamera size={18} />
                            <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleAvatarChange} />
                        </label>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '4px' }}>{profile.ho_ten || user?.fullName || user?.username}</h2>
                        <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '12px' }}>Mã viên chức: <span style={{ fontWeight: '600', color: '#202124' }}>{user?.ma_vien_chuc || 'N/A'}</span></p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {user?.roles?.map(role => (
                                <span key={role} className="badge" style={{ backgroundColor: '#e8f0fe', color: '#1a73e8', border: '1px solid #d2e3fc', padding: '4px 12px' }}>
                                    {role}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: '32px' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', textTransform: 'uppercase', color: '#5f6368', marginBottom: '20px', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MdPerson /> Thông tin cơ bản
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                            <div className="form-group">
                                <label>Họ và tên</label>
                                <input type="text" className="form-control" name="ho_ten" value={profile.ho_ten} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Ngày sinh</label>
                                <input type="date" className="form-control" name="ngay_sinh" value={profile.ngay_sinh} onChange={handleChange} max={todayStr} />
                            </div>
                            <div className="form-group">
                                <label>Giới tính</label>
                                <select className="form-control" name="gioi_tinh" value={profile.gioi_tinh} onChange={handleChange}>
                                    <option value="NAM">Nam</option>
                                    <option value="NU">Nữ</option>
                                    <option value="KHAC">Khác</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className="form-group">
                                <label>Số CCCD</label>
                                <input type="text" className="form-control" name="cccd" value={profile.cccd} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Email liên hệ</label>
                                <input type="email" className="form-control" name="email" value={profile.email} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input type="text" className="form-control" name="so_dien_thoai" value={profile.so_dien_thoai} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', textTransform: 'uppercase', color: '#5f6368', marginBottom: '20px', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MdBadge /> Thông tin công tác
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className="form-group">
                                <label>Đơn vị</label>
                                <select className="form-control" name="ma_don_vi" value={profile.ma_don_vi} onChange={handleChange}>
                                    <option value="">Chọn đơn vị...</option>
                                    {metadata.units.map(unit => (
                                        <option key={unit.ma_don_vi} value={unit.ma_don_vi}>{unit.ten_don_vi}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Chức vụ</label>
                                <input type="text" className="form-control" name="chuc_vu" value={profile.chuc_vu} onChange={handleChange} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                            <div className="form-group">
                                <label>Học hàm</label>
                                <select className="form-control" name="hoc_ham" value={profile.hoc_ham} onChange={handleChange}>
                                    <option value="">Không có</option>
                                    <option value="GS">Giáo sư</option>
                                    <option value="PGS">Phó Giáo sư</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Học vị</label>
                                <select className="form-control" name="hoc_vi" value={profile.hoc_vi} onChange={handleChange}>
                                    <option value="CN">Cử nhân</option>
                                    <option value="ThS">Thạc sĩ</option>
                                    <option value="TS">Tiến sĩ</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Chuyên ngành</label>
                                <input type="text" className="form-control" name="chuyen_nganh" value={profile.chuyen_nganh} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', textTransform: 'uppercase', color: '#5f6368', marginBottom: '20px', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MdSecurity /> Thông tin Đảng viên
                        </h3>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input type="checkbox" name="is_dang_vien" checked={profile.is_dang_vien} onChange={handleChange} />
                                Là Đảng viên
                            </label>
                        </div>
                        
                        {profile.is_dang_vien && (
                            <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e8eaed' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
                                    <div className="form-group">
                                        <label>Đơn vị Đảng</label>
                                        <select className="form-control" name="ma_don_vi_dang" value={profile.ma_don_vi_dang} onChange={handleChange}>
                                            <option value="">Chọn đơn vị Đảng...</option>
                                            {metadata.partyUnits.map(unit => (
                                                <option key={unit.ma_don_vi_dang} value={unit.ma_don_vi_dang}>{unit.ten_don_vi_dang}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Số thẻ Đảng</label>
                                        <input type="text" className="form-control" name="so_the_dang" value={profile.so_the_dang} onChange={handleChange} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '20px' }}>
                                    <div className="form-group">
                                        <label>Ngày vào Đảng</label>
                                        <input type="date" className="form-control" name="ngay_vao_dang" value={profile.ngay_vao_dang} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Ngày chính thức</label>
                                        <input type="date" className="form-control" name="ngay_chinh_thuc" value={profile.ngay_chinh_thuc} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Chức vụ Đảng</label>
                                        <input type="text" className="form-control" name="chuc_vu_dang" value={profile.chuc_vu_dang} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', textTransform: 'uppercase', color: '#5f6368', marginBottom: '20px', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MdDescription /> Thông tin hộ chiếu
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                            <div className="form-group">
                                <label>Số hộ chiếu</label>
                                <input type="text" className="form-control" name="so_ho_chieu" value={profile.so_ho_chieu} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Ngày cấp</label>
                                <input type="date" className="form-control" name="ngay_cap_ho_chieu" value={profile.ngay_cap_ho_chieu} onChange={handleChange} max={todayStr} />
                            </div>
                            <div className="form-group">
                                <label>Ngày hết hạn</label>
                                <input type="date" className="form-control" name="ngay_het_han_ho_chieu" value={profile.ngay_het_han_ho_chieu} onChange={handleChange} min={profile.ngay_cap_ho_chieu || todayStr} />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f3f4', paddingTop: '24px', gap: '12px' }}>
                        <button 
                            type="button" 
                            className="btn btn-outline" 
                            onClick={() => setShowPasswordModal(true)}
                            style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <MdLock size={20} />
                            Đổi mật khẩu
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MdSave size={20} />
                            Cập nhật thông tin
                        </button>
                    </div>
                </form>
            </div>

            {showPasswordModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '450px' }}>
                        <div className="modal-header">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <MdLock /> Đổi mật khẩu
                            </h3>
                            <button className="btn-icon" onClick={() => setShowPasswordModal(false)}>
                                <MdClose size={24} />
                            </button>
                        </div>
                        <form onSubmit={handlePasswordSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Mật khẩu hiện tại</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        required
                                        value={passwordData.oldPassword}
                                        onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Mật khẩu mới</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        required
                                        minLength={6}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Xác nhận mật khẩu mới</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        required
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowPasswordModal(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                                    {passwordLoading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
