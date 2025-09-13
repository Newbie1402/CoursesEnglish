import api from "../api";

export const getNotificationUser = async (page = 0, size = 10) => {
    try {
        const res = await api.get(`/api/notifications`, {
            params: { page, size }
        });
        return res?.data || {};
    } catch (err) {
        console.error("Error fetching user notifications:", err);
        return {};
    }
};

export const getUnreadNotification = async () => {
    try {
        const res = await api.get(`/api/notifications/unread-count`);
        return res?.data?.data?.count || 0;
    } catch (err) {
        console.error("Error fetching unread notifications count:", err);
        return 0;
    }
};

export const markRead = async (id) => {
    try {
        const res = await api.put(`/api/notifications/${id}/read`, {});
        return res?.data || {};
    } catch (err) {
        console.error(`Error marking notification ${id} as read:`, err);
        return {};
    }
};

export const markReadAll = async () => {
    try {
        const res = await api.put(`/api/notifications/read-all`, {});
        return res?.data || {};
    } catch (err) {
        console.error("Error marking all notifications as read:", err);
        return {};
    }
};
