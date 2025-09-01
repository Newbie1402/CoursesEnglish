import React, { useState, useEffect } from 'react';
import {
  FaBell,
  FaCheckDouble,
  FaFilter,
  FaSearch,
  FaEye,
  FaEyeSlash,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationCircle
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { getNotificationUser, markRead, markReadAll } from '../../services/hooks/notificationService.js';
import LoadingSpinner from '../../components/ui/loading/LoadingSpinner';
import { NOTIFICATION_TYPES } from './NotificaitonsTypes.jsx';

const TeacherNotifications = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0); // Backend sử dụng 0-based indexing
  const [itemsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch danh sách thông báo với pagination
  const fetchNotifications = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await getNotificationUser(token);

      // Xử lý response theo cấu trúc thực tế từ backend
      if (response?.data?.content) {
        setNotifications(response.data.content);
        setTotalElements(response.data.totalElements || 0);
        setTotalPages(response.data.totalPages || 0);
        setCurrentPage(response.data.number || 0);
      } else {
        setNotifications([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Đánh dấu một thông báo đã đọc
  const handleMarkAsRead = async (notificationId) => {
    if (!token) return;

    try {
      await markRead(notificationId, token);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Đánh dấu tất cả thông báo đã đọc
  const handleMarkAllAsRead = async () => {
    if (!token) return;

    try {
      setMarkingRead(true);
      await markReadAll(token);
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setMarkingRead(false);
    }
  };

  // Filter và search notifications (client-side cho các filter hiện tại)
  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'unread' && !notification.read) ||
      (filterStatus === 'read' && notification.read);
    const matchesSearch = !searchTerm ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  });

  // Sử dụng server-side pagination nếu không có filter, client-side nếu có filter
  const shouldUseClientPagination = filterType !== 'all' || filterStatus !== 'all' || searchTerm;

  let paginatedNotifications;
  let displayTotalPages;
  let displayCurrentPage;
  let displayTotalElements;

  if (shouldUseClientPagination) {
    // Client-side pagination cho filtered results
    displayTotalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
    displayCurrentPage = Math.min(currentPage, displayTotalPages - 1);
    const startIndex = displayCurrentPage * itemsPerPage;
    paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + itemsPerPage);
    displayTotalElements = filteredNotifications.length;
  } else {
    // Server-side pagination cho unfiltered results
    paginatedNotifications = notifications;
    displayTotalPages = totalPages;
    displayCurrentPage = currentPage;
    displayTotalElements = totalElements;
  }

  // Reset page khi filter thay đổi
  useEffect(() => {
    setCurrentPage(0);
  }, [filterType, filterStatus, searchTerm]);

  // Fetch dữ liệu khi component mount hoặc page thay đổi
  useEffect(() => {
    if (!shouldUseClientPagination) {
      fetchNotifications(currentPage, itemsPerPage);
    }
  }, [token, currentPage]);

  // Fetch lại khi không có filter (lần đầu load)
  useEffect(() => {
    fetchNotifications(0, itemsPerPage);
  }, [token]);

  // Format thời gian
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInDays < 7) return `${diffInDays} ngày trước`;

    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render notification item
  const renderNotificationItem = (notification) => {
    const typeConfig = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.COURSE_CREATED;
    const Icon = typeConfig.icon;

    return (
      <div
        key={notification.id}
        className={`
          group relative p-4 border-l-4 rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer
          ${notification.read 
            ? 'bg-gray-50 border-l-gray-300' 
            : `${typeConfig.bgColor} ${typeConfig.borderColor} shadow-sm`
          }
        `}
        onClick={() => !notification.read && handleMarkAsRead(notification.id)}
      >
        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div className={`
            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
            ${notification.read ? 'bg-gray-200' : typeConfig.bgColor}
          `}>
            <Icon className={`
              text-lg
              ${notification.read ? 'text-gray-500' : typeConfig.color}
            `} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={`
                  text-sm font-semibold mb-1
                  ${notification.read ? 'text-gray-600' : 'text-gray-800'}
                `}>
                  {notification.title}
                </h3>
                <p className={`
                  text-sm leading-relaxed mb-2
                  ${notification.read ? 'text-gray-500' : 'text-gray-700'}
                `}>
                  {notification.message}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span>{formatTime(notification.createdAt)}</span>
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${notification.read ? 'bg-gray-200 text-gray-600' : `${typeConfig.bgColor} ${typeConfig.color}`}
                  `}>
                    {typeConfig.label}
                  </span>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center space-x-2 ml-4">
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(notification.id);
                  }}
                  className={`
                    p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100
                    ${notification.read 
                      ? 'text-gray-400 hover:bg-gray-200' 
                      : 'text-blue-500 hover:bg-blue-100'
                    }
                  `}
                  title={notification.read ? "Đã đọc" : "Đánh dấu đã đọc"}
                >
                  {notification.read ? <FaEye className="text-xs" /> : <FaEyeSlash className="text-xs" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FaBell className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Thông báo của tôi</h1>
              <p className="text-sm text-gray-600">
                Quản lý và theo dõi các thông báo quan trọng
              </p>
            </div>
          </div>

          {/* Unread count & Mark all as read */}
          <div className="flex items-center space-x-4">
            {unreadCount > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">
                  {unreadCount} chưa đọc
                </span>
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markingRead}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {markingRead ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    <FaCheckDouble className="text-sm" />
                  )}
                  <span className="text-sm font-medium">Đọc tất cả</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Tìm kiếm thông báo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              {/* Filter by type */}
              <div className="flex items-center space-x-2">
                <FaFilter className="text-gray-400 text-sm" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả loại</option>
                  {Object.entries(NOTIFICATION_TYPES).map(([type, config]) => (
                    <option key={type} value={type}>{config.label}</option>
                  ))}
                </select>
              </div>

              {/* Filter by status */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="unread">Chưa đọc</option>
                <option value="read">Đã đọc</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
          <span className="ml-3 text-gray-600">Đang tải thông báo...</span>
        </div>
      ) : (
        <>
          {/* Notifications List */}
          {paginatedNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FaExclamationCircle className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Không tìm thấy thông báo nào'
                  : 'Chưa có thông báo nào'
                }
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                  : 'Các thông báo mới sẽ hiển thị tại đây'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedNotifications.map(renderNotificationItem)}
            </div>
          )}

          {/* Pagination */}
          {displayTotalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Hiển thị {Math.min(displayCurrentPage * itemsPerPage + 1, displayTotalElements)}-{Math.min((displayCurrentPage + 1) * itemsPerPage, displayTotalElements)}
                trong tổng số {displayTotalElements} thông báo
                {shouldUseClientPagination && (
                  <span className="ml-2 text-blue-600 font-medium">(Đã lọc)</span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                  disabled={displayCurrentPage === 0}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronLeft className="text-sm text-gray-600" />
                </button>

                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(displayTotalPages, 5))].map((_, index) => {
                    let pageNumber;
                    if (displayTotalPages <= 5) {
                      pageNumber = index;
                    } else {
                      // Logic để hiển thị pages xung quanh current page
                      const start = Math.max(0, displayCurrentPage - 2);
                      const end = Math.min(displayTotalPages - 1, start + 4);
                      pageNumber = start + index;
                      if (pageNumber > end) return null;
                    }

                    const isActive = pageNumber === displayCurrentPage;

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`
                          px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          ${isActive 
                            ? 'bg-blue-500 text-white' 
                            : 'text-gray-600 hover:bg-gray-50'
                          }
                        `}
                      >
                        {pageNumber + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, displayTotalPages - 1))}
                  disabled={displayCurrentPage === displayTotalPages - 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronRight className="text-sm text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeacherNotifications;
