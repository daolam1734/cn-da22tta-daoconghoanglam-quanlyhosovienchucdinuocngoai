import authService from './authService';

const API_URL = '/api/units';

const getUnits = async () => {
    const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${authService.getToken()}` },
    });
    return await response.json();
};

const createUnit = async (unitData) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(unitData),
    });
    return await response.json();
};

const updateUnit = async (id, unitData) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(unitData),
    });
    return await response.json();
};

const deleteUnit = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${authService.getToken()}`
        },
    });
    return await response.json();
};

const getPartyUnits = async () => {
    const response = await fetch(`${API_URL}/party`, {
        headers: { 'Authorization': `Bearer ${authService.getToken()}` },
    });
    return await response.json();
};

const createPartyUnit = async (unitData) => {
    const response = await fetch(`${API_URL}/party`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(unitData),
    });
    return await response.json();
};

const updatePartyUnit = async (id, unitData) => {
    const response = await fetch(`${API_URL}/party/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(unitData),
    });
    return await response.json();
};

const deletePartyUnit = async (id) => {
    const response = await fetch(`${API_URL}/party/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${authService.getToken()}`
        },
    });
    return await response.json();
};

const unitService = {
    getUnits,
    createUnit,
    updateUnit,
    deleteUnit,
    getPartyUnits,
    createPartyUnit,
    updatePartyUnit,
    deletePartyUnit
};

export default unitService;
