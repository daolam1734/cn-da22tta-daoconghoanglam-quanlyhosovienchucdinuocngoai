const API_URL = '/api/auth';

const login = async (username, password) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    return data;
};

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
};

const getToken = () => localStorage.getItem('token');

export default {
    login,
    logout,
    getCurrentUser,
    getToken
};
