import React from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import {
    getNotifications,
    getUnreadNotificationCount,
    markAllNotificationsAsRead,
} from "@/services/hooks/studentService";

const NotificationContext = React.createContext();

export const NotificationProvider = ({ children }) => {
    const { token } = useAuth() || {};
    const [notifications, setNotifications] = React.useState([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    // Normalize a notification shape (BE may use `read` instead of `isRead`)
    const normalize = React.useCallback((n) => {
        if (!n || typeof n !== "object") return n;
        const isRead =
            typeof n.isRead === "boolean"
                ? n.isRead
                : typeof n.read === "boolean"
                    ? n.read
                    : !!n?.status?.toString?.().toLowerCase?.().includes?.("read");
        return { ...n, isRead };
    }, []);

    const refresh = React.useCallback(async () => {
        if (!token) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const [list, count] = await Promise.all([
                getNotifications(token),
                getUnreadNotificationCount(token),
            ]);
            const normalized = Array.isArray(list) ? list.map(normalize) : [];
            setNotifications(normalized);
            setUnreadCount(Number(count) || 0);
        } catch (e) {
            console.error("Load notifications failed:", e);
            setError(e?.message || "Không thể tải thông báo");
        } finally {
            setLoading(false);
        }
    }, [token, normalize]);

    // Initial load & on token change
    React.useEffect(() => {
        let mounted = true;
        (async () => {
            await refresh();
            if (!mounted) return;
        })();
        return () => {
            mounted = false;
        };
    }, [refresh]);

    const addNotification = (notification) => {
        const n = normalize({
            id: notification?.id ?? Date.now(),
            title: notification?.title ?? "Thông báo",
            message: notification?.message ?? "",
            createdAt: notification?.createdAt ?? new Date().toISOString(),
            isRead: false,
            ...notification,
        });
        setNotifications((prev) => [n, ...prev]);
        setUnreadCount((prev) => prev + 1);
    };

    const markAllAsRead = async () => {
        try {
            // Try backend first
            await markAllNotificationsAsRead(token);
        } catch (e) {
            // If backend fails, still update UI optimistically
            console.warn("markAllAsRead failed on server, applying locally.", e);
        } finally {
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true, read: true }))
            );
            setUnreadCount(0);
        }
    };

    // Optimistic single-read (no BE endpoint in spec)
    const markAsRead = (id) => {
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === id ? { ...n, isRead: true, read: true } : n
            )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const value = {
        notifications,
        unreadCount,
        loading,
        error,
        addNotification,
        markAllAsRead,
        markAsRead,
        refresh,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = React.useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
};

export default NotificationContext;
