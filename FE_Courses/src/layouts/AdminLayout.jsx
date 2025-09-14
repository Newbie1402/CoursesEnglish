import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaUsers,
  FaGraduationCap,
  FaClipboardList,
  FaBell,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBars,
  FaTimes,
  FaSearch,
  FaInfoCircle,
  FaChartLine
} from 'react-icons/fa';
import ProfileDropdownAdmin from '../components/ui/profile/ProfileDropdownAdmin.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import {getNotificationUser, getUnreadNotification} from '@/services/hooks/notificationService.js';
import {NOTIFICATION_TYPES} from "@/pages/teacher/notifications/NotificaitonsTypes.jsx";

const adminMenu = [
  {
    label: 'Dashboard',
    path: '/admin',
    icon: FaHome,
    color: 'text-blue-500'
  },
  {
    label: 'Người dùng',
    path: '/admin/users',
    icon: FaUsers,
    color: 'text-green-500'
  },
  {
    label: 'Khóa học',
    path: '/admin/courses',
    icon: FaGraduationCap,
    color: 'text-purple-500'
  },
  {
    label: 'Bài kiểm tra',
    path: '/admin/exams',
    icon: FaClipboardList,
    color: 'text-orange-500'
  },
  {
    label: 'Thông báo',
    path: '/admin/notifications',
    icon: FaBell,
    color: 'text-yellow-500'
  },
  {
    label: 'Học viên',
    path: '/admin/students',
    icon: FaUserGraduate,
    color: 'text-pink-500'
  },
  {
    label: 'Giảng viên',
    path: '/admin/teachers',
    icon: FaChalkboardTeacher,
    color: 'text-teal-500'
  },
  {
    label: 'Báo cáo',
    path: '/admin/reports',
    icon: FaChartLine,
    color: 'text-red-500'
  },
];

// Helper: format ISO date to "time ago" in Vietnamese
const formatTimeAgo = (dateInput) => {
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const diff = Date.now() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (seconds < 60) return 'vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString();
  } catch {
    return '';
  }
};

const AdminLayout = () => {
  const { user, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const [showNewNotificationAlert, setShowNewNotificationAlert] = useState(false);
  const [alertTimeout, setAlertTimeout] = useState(null);
  const notificationsRef = useRef(null);

  // Tạo admin object từ user data
  const admin = {
    fullName: user?.fullName || user?.name || 'Admin',
    email: user?.email || '',
    avatarUrl: user?.avatarUrl || null
  };

  // Lấy page title từ current route
  const getCurrentPageTitle = () => {
    const currentMenu = adminMenu.find(item => item.path === location.pathname);
    return currentMenu?.label || 'Quản trị hệ thống';
  };

  const fetchRecentNotifications = async () => {
    if (!token) return;

    try {
      setLoadingNotifications(true);
      const response = await getNotificationUser(token);

      if (response?.data?.content) {
        // Lấy 5 notifications gần nhất
        const recent5Notifications = response.data.content.slice(0, 5);

        // Transform notifications để có format phù hợp với UI
        const transformedNotifications = recent5Notifications.map((notification) => {
          const typeConfig = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.COURSE_CREATED;

          return {
            id: notification.id,
            type: notification.type,
            message: notification.message,
            time: formatTimeAgo(notification.createdAt),
            icon: typeConfig.icon,
            color: { text: typeConfig.color, bg: typeConfig.bgColor },
            read: notification.read
          };
        });

        setRecentNotifications(transformedNotifications);
      } else {
        setRecentNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
      setRecentNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Fetch số lượng thông báo chưa đọc
  const fetchUnreadNotifications = async () => {
    if (!token) return;

    try {
      setLoadingNotifications(true);
      const count = await getUnreadNotification(token);
      const newCount = count || 0;

      // Kiểm tra nếu có thông báo mới (chỉ hiển thị khi count tăng lên)
      if (previousUnreadCount > 0 && newCount > previousUnreadCount) {
        setShowNewNotificationAlert(true);

        // Tự động ẩn thông báo sau 5 giây
        if (alertTimeout) {
          clearTimeout(alertTimeout);
        }
        const timeout = setTimeout(() => {
          setShowNewNotificationAlert(false);
        }, 5000);
        setAlertTimeout(timeout);
      }

      setPreviousUnreadCount(unreadNotifications);
      setUnreadNotifications(newCount);
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      setUnreadNotifications(0);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Handle notification click
  const handleNotificationClick = () => {
    navigate('/admin/notifications');
    setShowNotifications(false);
    setShowNewNotificationAlert(false); // Ẩn alert khi click vào notifications
  };

  // Handle dismiss alert
  const handleDismissAlert = () => {
    setShowNewNotificationAlert(false);
    if (alertTimeout) {
      clearTimeout(alertTimeout);
    }
  };

  // Fetch recent notifications khi component mount
  useEffect(() => {
    fetchRecentNotifications();
  }, [token]);

  // Fetch unread notifications khi component mount
  useEffect(() => {
    fetchUnreadNotifications();
  }, [token]);

  // Auto-refresh unread notifications mỗi 30 giây
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadNotifications();
    }, 30000); // 30 giây

    return () => clearInterval(interval);
  }, [token]);

  // Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (alertTimeout) {
        clearTimeout(alertTimeout);
      }
    };
  }, [alertTimeout]);

  // Refresh recent notifications when opening dropdown
  useEffect(() => {
    if (showNotifications) {
      fetchRecentNotifications();
    }
  }, [showNotifications]);

  // Đóng dropdown khi click ra ngoài hoặc nhấn Escape
  useEffect(() => {
    if (!showNotifications) return;
    const handleClickOutside = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showNotifications]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Sidebar - Always visible */}
      <aside className={`
        fixed inset-y-0 left-0 z-50
        w-72 bg-white border-r border-gray-200
        flex flex-col shadow-xl
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo/Brand - Fixed at top */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <FaGraduationCap className="text-blue-600 text-lg" />
            </div>
            <span className="font-bold text-lg text-white">EduAdmin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-white hover:bg-opacity-20 p-1 rounded"
          >
            <FaTimes />
          </button>
        </div>

        {/* Navigation Menu - Scrollable */}
        <nav className="flex-1 py-6 px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="space-y-2">
            {adminMenu.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                             (item.path === '/admin' && location.pathname === '/admin');

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group flex items-center space-x-3 px-4 py-3 rounded-xl
                    font-medium transition-all duration-200 relative overflow-hidden
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md'
                    }
                  `}
                  end={item.path === '/admin'}
                >
                  {/* Background animation */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600
                    transform transition-transform duration-300
                    ${isActive ? 'scale-100' : 'scale-0 group-hover:scale-100 opacity-10'}
                  `} />

                  <Icon className={`
                    text-lg z-10 transition-colors duration-200
                    ${isActive ? 'text-white' : item.color + ' group-hover:text-white'}
                  `} />
                  <span className="z-10 relative">{item.label}</span>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer - Fixed at bottom */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">EduAdmin v2.0</p>
            <p className="text-xs text-gray-500 mt-1">© 2025 Courses Admin</p>
          </div>
        </div>
      </aside>

      {/* Main content with proper spacing */}
      <div className="lg:ml-72">
        {/* Sticky Header - Always visible when scrolling */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-8 border-b border-gray-200 bg-white shadow-sm backdrop-blur-sm bg-white/95">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaBars className="text-gray-600" />
            </button>

            {/* Page Title */}
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-gray-800">
                {getCurrentPageTitle()}
              </h1>
              <div className="hidden lg:block w-px h-6 bg-gray-300" />
              <p className="hidden lg:block text-sm text-gray-500">
                Quản lý và điều hành hệ thống
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Search bar - Desktop only */}
            <div className="hidden lg:flex items-center space-x-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           bg-gray-50 text-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications((v) => !v)}
                className="relative p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Mở thông báo"
                aria-haspopup="menu"
                aria-expanded={showNotifications}
                title="Thông báo"
              >
                <FaBell className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center leading-none shadow-sm">
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Thông báo</h3>
                    <span className="text-xs text-gray-500">Chưa đọc: {unreadNotifications}</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="divide-y divide-gray-100">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="p-4 flex items-start space-x-3 animate-pulse">
                            <div className="w-9 h-9 rounded-lg bg-gray-100" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 bg-gray-100 rounded w-3/4" />
                              <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : recentNotifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        <FaBell className="mx-auto mb-2 w-6 h-6 text-gray-400" />
                        <p className="text-sm">Không có thông báo nào</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {recentNotifications.map((n) => {
                          const Icon = n.icon || FaBell;
                          return (
                            <div key={n.id} className="p-4 hover:bg-gray-50">
                              <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-lg ${n.color?.bg || 'bg-blue-100'}`}>
                                  <Icon className={`${n.color?.text || 'text-blue-600'} w-5 h-5`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-900 truncate">{n.message}</p>
                                  <p className="text-xs text-gray-500 mt-1">{n.time}</p>
                                </div>
                                {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full mt-2" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="p-3 border-t border-gray-100 bg-gray-50">
                    <button
                      onClick={handleNotificationClick}
                      className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Xem tất cả thông báo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <ProfileDropdownAdmin admin={admin} />
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="min-h-[calc(100vh-4rem)]">
          <div className="p-4 lg:p-8">
            {/* Breadcrumb */}
            <div className="mb-6">
              <nav className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Admin</span>
                <span>/</span>
                <span className="text-gray-700 font-medium">{getCurrentPageTitle()}</span>
              </nav>
            </div>

            {/* Content Container - This is where scrolling happens */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[calc(100vh-12rem)]">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* New notification alert (bottom right corner) - Fixed position */}
      {showNewNotificationAlert && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-in-right">
          <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-lg border border-gray-200 max-w-sm">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FaInfoCircle className="text-blue-500 text-lg" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Thông báo mới</p>
              <p className="text-xs text-gray-600">
                Bạn có {unreadNotifications - previousUnreadCount} thông báo mới
              </p>
            </div>
            <button
              onClick={handleDismissAlert}
              className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
              title="Đóng thông báo"
            >
              <FaTimes className="text-gray-400 w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
