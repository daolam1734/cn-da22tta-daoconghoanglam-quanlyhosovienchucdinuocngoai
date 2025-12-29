import authService from './authService';

const API_URL = '/api/workflows';

const workflowService = {
    getWorkflows: async () => {
        const response = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${authService.getToken()}` }
        });
        return await response.json();
    },

    getWorkflowById: async (id) => {
        const response = await fetch(`${API_URL}/${id}`, {
            headers: { 'Authorization': `Bearer ${authService.getToken()}` }
        });
        return await response.json();
    },

    createWorkflow: async (data) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authService.getToken()}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    updateWorkflow: async (id, data) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authService.getToken()}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    deleteWorkflow: async (id) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authService.getToken()}` }
        });
        return await response.json();
    }
};

export default workflowService;
