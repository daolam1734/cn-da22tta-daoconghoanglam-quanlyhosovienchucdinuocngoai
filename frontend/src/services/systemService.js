import authService from './authService';

const API_URL = '/api/system';

const getConfigs = async () => {
    const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${authService.getToken()}` },
    });
    return await response.json();
};

const updateConfig = async (configData) => {
    const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(configData),
    });
    return await response.json();
};

export default {
    getConfigs,
    updateConfig
};
