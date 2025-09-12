import React, { useEffect, useMemo, useState, useCallback } from "react";
import { getNotifications, markAllNotificationsAsRead } from "@/services/hooks/studentService.js";
import NotificationItem from "@/components/student/NotificationItem";
import { Bell, Loader2, Filter, CheckCircle2, Inbox, Mail, MailOpen, TrendingUp } from "lucide-react";

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all | unread | read
    const [markingAll, setMarkingAll] = useState(false);

    // Helpers to normalize backend fields
    const getId = useCallback((n) => n?.notificationId ?? n?.id, []);
    const isRead = useCallback(
        (n) => {
            if (typeof n?.read === "boolean") return n.read;
            if (typeof n?.isRead === "boolean") return n.isRead;
            if (typeof n?.status === "string") return n.status.toUpperCase() === "READ";
            return false;
        },
        []
    );

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token"); // optional; service also injects via interceptor
                const data = await getNotifications(token);
                // data is page.content or array (service already unwraps)
                setNotifications(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Lỗi khi lấy thông báo:", error);
                setNotifications([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const unreadCount = useMemo(
        () => notifications.filter((n) => !isRead(n)).length,
        [notifications, isRead]
    );

    const filteredNotifications = useMemo(() => {
        if (filter === "all") return notifications;
        if (filter === "unread") return notifications.filter((n) => !isRead(n));
        if (filter === "read") return notifications.filter((n) => isRead(n));
        return notifications;
    }, [notifications, filter, isRead]);

    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0) return;
        setMarkingAll(true);
        try {
            const token = localStorage.getItem("token");
            const ok = await markAllNotificationsAsRead(token);
            if (ok) {
                // Update local list to read
                setNotifications((prev) =>
                    prev.map((n) => ({
                        ...n,
                        read: true,      // cover read flag
                        isRead: true,    // cover isRead flag
                        status: "READ",  // cover status flag
                    }))
                );
            }
        } catch (e) {
            console.error("Đánh dấu tất cả đã đọc thất bại:", e);
        } finally {
            setMarkingAll(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="relative mb-6">
                                <div className="w-16 h-16 mx-auto bg-white rounded-full shadow-lg flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                </div>
                                <div className="absolute -inset-2 bg-blue-100 rounded-full animate-pulse opacity-50"></div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Đang tải thông báo</h3>
                            <p className="text-gray-500">Vui lòng chờ trong giây lát...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="max-w-5xl mx-auto p-6">
                {/* Modern Header with Glass Effect */}
                <div className="relative overflow-hidden mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700"></div>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative backdrop-blur-sm bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                <div className="relative">
                                    <div className="w-16 h-16 bg-white/90 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg">
                                        <Bell className="w-8 h-8 text-blue-600" />
                                    </div>
                                    {unreadCount > 0 && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white mb-2">
                                        Trung tâm thông báo
                                    </h1>
                                    <p className="text-blue-100 text-lg">
                                        {unreadCount > 0
                                            ? `Bạn có ${unreadCount} thông báo chưa đọc`
                                            : "Tất cả thông báo đã được đọc ✨"}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleMarkAllAsRead}
                                disabled={unreadCount === 0 || markingAll}
                                className="group flex items-center px-6 py-3 bg-white/90 backdrop-blur text-blue-600 rounded-2xl hover:bg-white hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 font-medium shadow-lg"
                            >
                                {markingAll ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : (
                                    <CheckCircle2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                )}
                                Đánh dấu tất cả đã đọc
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modern Filter Tabs */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-white/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Filter className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-lg font-semibold text-gray-800">Bộ lọc thông báo</span>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        {[
                            {
                                value: "all",
                                label: "Tất cả",
                                count: notifications.length,
                                icon: Inbox,
                                color: "blue"
                            },
                            {
                                value: "unread",
                                label: "Chưa đọc",
                                count: unreadCount,
                                icon: Mail,
                                color: "orange"
                            },
                            {
                                value: "read",
                                label: "Đã đọc",
                                count: notifications.length - unreadCount,
                                icon: MailOpen,
                                color: "green"
                            },
                        ].map((item) => {
                            const Icon = item.icon;
                            const isActive = filter === item.value;
                            return (
                                <button
                                    key={item.value}
                                    onClick={() => setFilter(item.value)}
                                    className={`group flex items-center px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
                                        isActive
                                            ? `bg-${item.color}-100 text-${item.color}-700 ring-2 ring-${item.color}-200 scale-105`
                                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-100 hover:scale-105"
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 mr-2 transition-transform group-hover:scale-110 ${
                                        isActive ? `text-${item.color}-600` : "text-gray-500"
                                    }`} />
                                    <span>{item.label}</span>
                                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                        isActive 
                                            ? `bg-${item.color}-200 text-${item.color}-800`
                                            : "bg-gray-200 text-gray-600"
                                    }`}>
                                        {item.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Enhanced Notification List */}
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-3xl border border-white/50 shadow-lg">
                        <div className="relative mb-6">
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-inner">
                                <Bell className="w-12 h-12 text-gray-400" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-2xl"></div>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                            {filter === "unread"
                                ? "Không có thông báo chưa đọc"
                                : filter === "read"
                                    ? "Không có thông báo đã đọc"
                                    : "Chưa có thông báo nào"}
                        </h3>
                        <p className="text-gray-500 text-lg mb-6">
                            {filter === "all"
                                ? "Thông báo mới sẽ xuất hiện tại đây khi có cập nhật"
                                : "Hãy thử chuyển sang bộ lọc khác để xem thông báo"}
                        </p>
                        <div className="inline-flex items-center px-6 py-3 bg-blue-50 text-blue-600 rounded-2xl text-sm font-medium">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Luôn cập nhật thông báo mới nhất
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/70 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/50 shadow-lg">
                        <ul className="divide-y divide-gray-100/50">
                            {filteredNotifications.map((noti) => (
                                <li
                                    key={getId(noti)}
                                    className="hover:bg-white/80 transition-all duration-200 hover:scale-[1.002] hover:shadow-md"
                                >
                                    <NotificationItem
                                        notification={noti}
                                        onClick={(id) => console.log("Clicked notification:", id)}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Enhanced Footer Stats */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            title: "Tổng số thông báo",
                            value: notifications.length,
                            icon: Inbox,
                            color: "blue",
                            bgGradient: "from-blue-500 to-blue-600"
                        },
                        {
                            title: "Chưa đọc",
                            value: unreadCount,
                            icon: Mail,
                            color: "orange",
                            bgGradient: "from-orange-500 to-red-500"
                        },
                        {
                            title: "Đã đọc",
                            value: notifications.length - unreadCount,
                            icon: MailOpen,
                            color: "green",
                            bgGradient: "from-green-500 to-emerald-600"
                        }
                    ].map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={index}
                                className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/50 hover:scale-105 transition-all duration-300"
                            >
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-12 h-12 bg-gradient-to-br ${stat.bgGradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-gray-800 mb-1">
                                                {stat.value}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-gray-600 font-medium">
                                        {stat.title}
                                    </div>
                                </div>
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default NotificationCenter;
