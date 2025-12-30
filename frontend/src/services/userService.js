import authService from './authService';

const API_URL = '/api/users';

const getUsers = async () => {
    const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${authService.getToken()}` },
    });
    return await response.json();
};

const createUser = async (userData) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(userData),
    });
    return await response.json();
};

const updateUser = async (id, userData) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(userData),
    });
    return await response.json();
};

const updateUserRoles = async (id, roles) => {
    const response = await fetch(`${API_URL}/${id}/roles`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({ roles }),
    });
    return await response.json();
};

const quickCreateUser = async (userData) => {
    const response = await fetch(`${API_URL}/quick`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(userData),
    });
    return await response.json();
};

const updateUserStatus = async (id, status) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({ trang_thai: status }),
    });
    return await response.json();
};

export default {
    getUsers,
    createUser,
    updateUser,
    updateUserRoles,
    quickCreateUser,
    updateUserStatus
};
