import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getNotificationUser = async (token) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/notifications`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res?.data || {};
    } catch (err) {
        console.error("Error fetching user notifications:", err);
        return {};
    }
};

export const getUnreadNotification = async (token) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/notifications/unread-count`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res?.data?.data?.count || 0;
    } catch (err) {
        console.error("Error fetching unread notifications count:", err);
        return 0;
    }
};

export const markRead = async (id, token) => {
    try {
        const res = await axios.put(`${BASE_URL}/api/notifications/${id}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res?.data || {};
    } catch (err) {
        console.error(`Error marking notification ${id} as read:`, err);
        return {};
    }
};

export const markReadAll = async (token) => {
    try {
        const res = await axios.put(`${BASE_URL}/api/notifications/read-all`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res?.data || {};
    } catch (err) {
        console.error("Error marking all notifications as read:", err);
        return {};
    }
};

