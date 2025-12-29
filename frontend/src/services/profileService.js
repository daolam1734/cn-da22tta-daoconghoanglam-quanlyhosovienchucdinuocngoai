import authService from './authService';

const API_URL = '/api/profile';

const getProfile = async () => {
    const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${authService.getToken()}` },
    });
    return await response.json();
};

const getMetadata = async () => {
    const response = await fetch(`${API_URL}/metadata`, {
        headers: { 'Authorization': `Bearer ${authService.getToken()}` },
    });
    return await response.json();
};

const updateProfile = async (profileData) => {
    const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(profileData),
    });
    return await response.json();
};

const updateAvatar = async (formData) => {
    const response = await fetch(`${API_URL}/avatar`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authService.getToken()}`
        },
        body: formData,
    });
    return await response.json();
};

export default {
    getProfile,
    getMetadata,
    updateProfile,
    updateAvatar
};
