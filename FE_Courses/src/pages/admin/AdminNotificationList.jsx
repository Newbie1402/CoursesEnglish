import React, { useState, useEffect } from 'react';
import {
  FaBell,
  FaUser,
  FaGraduationCap,
  FaClipboardCheck,
  FaUserLock,
  FaUserCheck,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaCheck,
  FaCheckDouble,
  FaFilter,
  FaSpinner,
  FaExclamationCircle,
  FaInfoCircle
} from 'react-icons/fa';
import { getNotificationUser, getUnreadNotification, markRead, markReadAll } from '@/services/hooks/notificationService';
import { useAuth } from '@/contexts/AuthContext';

const AdminNotificationList = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Định nghĩa các loại thông báo và icon tương ứng
  const notificationTypes = {
    ADMIN_NEW_ACCOUNT: {
      icon: FaUserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'Tài khoản mới'
    },
    ADMIN_ACCOUNT_LOCKED: {
      icon: FaUserLock,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      label: 'Khóa tài khoản'
    },
    ADMIN_ACCOUNT_UNLOCKED: {
      icon: FaUserCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      label: 'Mở khóa tài khoản'
    },
    ADMIN_COURSE_CREATED: {
      icon: FaPlus,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'Khóa học mới'
    },
    ADMIN_COURSE_UPDATED: {
      icon: FaEdit,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      label: 'Cập nhật khóa học'
    },
    ADMIN_COURSE_DELETED: {
      icon: FaTrash,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      label: 'Xóa khóa học'
    },
    ADMIN_EXAM_CREATED: {
      icon: FaClipboardCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      label: 'Bài kiểm tra mới'
    },
    ADMIN_EXAM_UPDATED: {
      icon: FaEdit,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      label: 'Cập nhật bài kiểm tra'
    },
    ADMIN_EXAM_DELETED: {
      icon: FaTrash,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      label: 'Xóa bài kiểm tra'
    },
    DEFAULT: {
      icon: FaBell,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      label: 'Thông báo'
    }
  };

  // Filter options
  const filterOptions = [
    { key: 'ALL', label: 'Tất cả', count: Array.isArray(notifications) ? notifications.length : 0 },
    { key: 'UNREAD', label: 'Chưa đọc', count: unreadCount },
    {
      key: 'USER_MANAGEMENT',
      label: 'Quản lý người dùng',
      count: Array.isArray(notifications) ? notifications.filter(n => n.type?.includes('ACCOUNT')).length : 0
    },
    {
      key: 'COURSE_MANAGEMENT',
      label: 'Quản lý khóa học',
      count: Array.isArray(notifications) ? notifications.filter(n => n.type?.includes('COURSE')).length : 0
    },
    {
      key: 'EXAM_MANAGEMENT',
      label: 'Quản lý bài kiểm tra',
      count: Array.isArray(notifications) ? notifications.filter(n => n.type?.includes('EXAM')).length : 0
    }
  ];

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [notificationData, unreadData] = await Promise.all([
        getNotificationUser(token),
        getUnreadNotification(token)
      ]);

      // Đảm bảo notifications luôn là array dựa trên cấu trúc API response
      const notificationsArray = Array.isArray(notificationData?.data?.content)
        ? notificationData.data.content
        : [];

      setNotifications(notificationsArray);
      setUnreadCount(unreadData || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]); // Đảm bảo luôn là array khi có lỗi
      showToast('Không thể tải thông báo', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  // Show toast
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Mark single notification as read
  const handleMarkRead = async (notificationId) => {
    try {
      await markRead(notificationId, token);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      showToast('Đã đánh dấu thông báo đã đọc');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showToast('Không thể đánh dấu thông báo đã đọc', 'error');
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      setMarkingRead(true);
      await markReadAll(token);
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
      showToast('Đã đánh dấu tất cả thông báo đã đọc');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showToast('Không thể đánh dấu tất cả thông báo đã đọc', 'error');
    } finally {
      setMarkingRead(false);
    }
  };

  // Filter notifications
  const getFilteredNotifications = () => {
    switch (selectedFilter) {
      case 'UNREAD':
        return notifications.filter(n => !n.read);
      case 'USER_MANAGEMENT':
        return notifications.filter(n => n.type?.includes('ACCOUNT'));
      case 'COURSE_MANAGEMENT':
        return notifications.filter(n => n.type?.includes('COURSE'));
      case 'EXAM_MANAGEMENT':
        return notifications.filter(n => n.type?.includes('EXAM'));
      default:
        return notifications;
    }
  };

  // Get notification type config
  const getNotificationConfig = (type) => {
    return notificationTypes[type] || notificationTypes.DEFAULT;
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Vừa xong';
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays} ngày trước`;
      } else {
        return date.toLocaleDateString('vi-VN');
      }
    }
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="p-6 space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {toast.type === 'success' ? (
              <FaCheck className="w-5 h-5" />
            ) : (
              <FaExclamationCircle className="w-5 h-5" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FaBell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý thông báo</h1>
            <p className="text-gray-600 mt-1">
              Tổng cộng {notifications.length} thông báo • {unreadCount} chưa đọc
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {loading ? (
              <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FaBell className="w-4 h-4 mr-2" />
            )}
            Làm mới
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingRead}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {markingRead ? (
                <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FaCheckDouble className="w-4 h-4 mr-2" />
              )}
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Lọc theo loại thông báo</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => setSelectedFilter(option.key)}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedFilter === option.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                selectedFilter === option.key
                  ? 'bg-white bg-opacity-20 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {option.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications list */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse flex space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          // Empty state
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBell className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {selectedFilter === 'ALL' ? 'Chưa có thông báo' : 'Không có thông báo phù hợp'}
            </h3>
            <p className="text-gray-500 mb-6">
              {selectedFilter === 'ALL'
                ? 'Các thông báo mới sẽ hiển thị ở đây'
                : 'Thử thay đổi bộ lọc để xem các thông báo khác'
              }
            </p>
          </div>
        ) : (
          // Notifications
          filteredNotifications.map((notification) => {
            const config = getNotificationConfig(notification.type);
            const IconComponent = config.icon;

            return (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
                  !notification.read 
                    ? 'border-blue-200 bg-blue-50/30' 
                    : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${config.bgColor} ${config.borderColor} border`}>
                      <IconComponent className={`w-6 h-6 ${config.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-lg font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>

                          <p className={`text-sm mb-2 ${!notification.read ? 'text-gray-700' : 'text-gray-600'}`}>
                            {notification.message}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className={`px-2 py-1 rounded-full ${config.bgColor} ${config.color} font-medium`}>
                              {config.label}
                            </span>
                            <span>{formatTime(notification.createdAt)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-4">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkRead(notification.id)}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                              title="Đánh dấu đã đọc"
                            >
                              <FaEye className="w-3 h-3 mr-1" />
                              Đánh dấu đã đọc
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Results info */}
      {!loading && filteredNotifications.length > 0 && (
        <div className="flex justify-center mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-3">
            <p className="text-sm text-gray-600">
              Hiển thị {filteredNotifications.length} trong tổng số {notifications.length} thông báo
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationList;

