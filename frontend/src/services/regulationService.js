const API_URL = '/api/regulations';

const regulationService = {
    getAll: async () => {
        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.json();
    },

    create: async (formData) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
        return response.json();
    },

    update: async (id, formData) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
        return response.json();
    },

    delete: async (id) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.json();
    },

    incrementDownload: async (id) => {
        const response = await fetch(`${API_URL}/${id}/download`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.json();
    }
};

export default regulationService;
