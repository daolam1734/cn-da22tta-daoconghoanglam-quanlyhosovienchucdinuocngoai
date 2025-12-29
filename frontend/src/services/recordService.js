import authService from './authService';

const API_URL = '/api/records';

const getRecords = async () => {
    const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${authService.getToken()}` },
    });
    return await response.json();
};

const getRecordById = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        headers: { 'Authorization': `Bearer ${authService.getToken()}` },
    });
    return await response.json();
};

const createRecord = async (formData) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authService.getToken()}`
            // Note: Don't set Content-Type for FormData, browser will do it with boundary
        },
        body: formData,
    });
    return await response.json();
};

const updateRecord = async (id, formData) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${authService.getToken()}`
        },
        body: formData,
    });
    return await response.json();
};

const submitRecord = async (id) => {
    const response = await fetch(`${API_URL}/${id}/submit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authService.getToken()}` },
    });
    return await response.json();
};

const withdrawRecord = async (id) => {
    const response = await fetch(`${API_URL}/${id}/withdraw`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authService.getToken()}` },
    });
    return await response.json();
};

const processRecord = async (id, action, y_kien, files = []) => {
    const formData = new FormData();
    formData.append('action', action);
    formData.append('y_kien', y_kien);

    files.forEach(file => {
        formData.append('files', file);
    });

    const response = await fetch(`${API_URL}/${id}/process`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authService.getToken()}`
        },
        body: formData,
    });
    return await response.json();
};

export default {
    getRecords,
    getRecordById,
    createRecord,
    updateRecord,
    submitRecord,
    withdrawRecord,
    processRecord
};
