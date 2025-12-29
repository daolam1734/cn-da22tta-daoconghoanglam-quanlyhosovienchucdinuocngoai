import authService from './authService';

const API_URL = '/api/roles';

const getRoles = async () => {
    const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${authService.getToken()}` },
    });
    return await response.json();
};

const createRole = async (roleData) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(roleData),
    });
    return await response.json();
};

export default {
    getRoles,
    createRole
};
