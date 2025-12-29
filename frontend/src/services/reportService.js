import authService from './authService';

const API_URL = '/api/reports';

const submitReport = async (formData) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authService.getToken()}`
        },
        body: formData,
    });
    return await response.json();
};

const getReportByRecord = async (ma_ho_so) => {
    const response = await fetch(`${API_URL}/record/${ma_ho_so}`, {
        headers: { 'Authorization': `Bearer ${authService.getToken()}` },
    });
    return await response.json();
};

const getPendingReports = async () => {
    const response = await fetch(`${API_URL}/pending`, {
        headers: { 'Authorization': `Bearer ${authService.getToken()}` },
    });
    return await response.json();
};

const approveReport = async (id, status, feedback) => {
    const response = await fetch(`${API_URL}/${id}/approve`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({ status, feedback }),
    });
    return await response.json();
};

export default {
    submitReport,
    getReportByRecord,
    getPendingReports,
    approveReport
};
