import authService from './authService';

const API_URL = '/api/dashboard';

const getStats = async () => {
    const response = await fetch(`${API_URL}/stats`, {
        headers: { 'Authorization': `Bearer ${authService.getToken()}` },
    });
    return await response.json();
};

export default {
    getStats
};
