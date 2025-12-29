const API_URL = '/api/notifications';

const notificationService = {
    getNotifications: async () => {
        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.json();
    },

    getUnreadCount: async () => {
        const response = await fetch(`${API_URL}/unread-count`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.json();
    },

    markAsRead: async (id) => {
        const response = await fetch(`${API_URL}/${id}/read`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.json();
    },

    markAllAsRead: async () => {
        const response = await fetch(`${API_URL}/read-all`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.json();
    }
};

export default notificationService;
