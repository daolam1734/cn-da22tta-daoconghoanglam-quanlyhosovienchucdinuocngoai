import authService from './authService';

const API_URL = '/api/categories';

const categoryService = {
    // Trip Types
    getTripTypes: async () => {
        const response = await fetch(`${API_URL}/trip-types`, {
            headers: { 'Authorization': `Bearer ${authService.getToken()}` },
        });
        return await response.json();
    },
    createTripType: async (data) => {
        const response = await fetch(`${API_URL}/trip-types`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authService.getToken()}`
            },
            body: JSON.stringify(data),
        });
        return await response.json();
    },
    updateTripType: async (id, data) => {
        const response = await fetch(`${API_URL}/trip-types/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authService.getToken()}`
            },
            body: JSON.stringify(data),
        });
        return await response.json();
    },
    deleteTripType: async (id) => {
        const response = await fetch(`${API_URL}/trip-types/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authService.getToken()}` },
        });
        return await response.json();
    },

    // Countries
    getCountries: async () => {
        const response = await fetch(`${API_URL}/countries`, {
            headers: { 'Authorization': `Bearer ${authService.getToken()}` },
        });
        return await response.json();
    },
    createCountry: async (data) => {
        const response = await fetch(`${API_URL}/countries`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authService.getToken()}`
            },
            body: JSON.stringify(data),
        });
        return await response.json();
    },
    updateCountry: async (id, data) => {
        const response = await fetch(`${API_URL}/countries/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authService.getToken()}`
            },
            body: JSON.stringify(data),
        });
        return await response.json();
    },
    deleteCountry: async (id) => {
        const response = await fetch(`${API_URL}/countries/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authService.getToken()}` },
        });
        return await response.json();
    },

    // Document Types
    getDocumentTypes: async () => {
        const response = await fetch(`${API_URL}/document-types`, {
            headers: { 'Authorization': `Bearer ${authService.getToken()}` },
        });
        return await response.json();
    },
    createDocumentType: async (data) => {
        const response = await fetch(`${API_URL}/document-types`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authService.getToken()}`
            },
            body: JSON.stringify(data),
        });
        return await response.json();
    },
    updateDocumentType: async (id, data) => {
        const response = await fetch(`${API_URL}/document-types/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authService.getToken()}`
            },
            body: JSON.stringify(data),
        });
        return await response.json();
    },
    deleteDocumentType: async (id) => {
        const response = await fetch(`${API_URL}/document-types/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authService.getToken()}` },
        });
        return await response.json();
    }
};

export default categoryService;
