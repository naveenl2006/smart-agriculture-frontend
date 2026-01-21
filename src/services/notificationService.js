import api from './api';

/**
 * Notification Service
 * Handles all notification-related API calls
 */

/**
 * Fetch all notifications for the current user
 * @returns {Promise} - Notifications data
 */
export const getNotifications = async () => {
    const response = await api.get('/notifications');
    return response.data;
};

/**
 * Mark a single notification as read
 * @param {string} id - Notification ID
 * @returns {Promise} - Response data
 */
export const markNotificationAsRead = async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
};

/**
 * Mark all notifications as read
 * @returns {Promise} - Response data
 */
export const markAllNotificationsAsRead = async () => {
    const response = await api.post('/notifications/mark-all-read');
    return response.data;
};

export default {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
};
