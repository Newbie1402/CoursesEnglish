import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaUsers,
  FaGraduationCap,
  FaClipboardList,
  FaBell,
  FaChartBar,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBars,
  FaTimes,
  FaSearch,
  FaInfoCircle
} from 'react-icons/fa';
import ProfileDropdownAdmin from '../../components/ui/profile/ProfileDropdownAdmin';
import { useAuth } from '../../contexts/AuthContext';
import { getUnreadNotification } from '@/services/hooks/notificationService';

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
    label: 'Báo cáo',
    path: '/admin/reports',
    icon: FaChartBar,
    color: 'text-indigo-500'
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
];

const AdminLayout = () => {
  const { user, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const [showNewNotificationAlert, setShowNewNotificationAlert] = useState(false);
  const [alertTimeout, setAlertTimeout] = useState(null);

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
    setShowNewNotificationAlert(false); // Ẩn alert khi click vào notifications
  };

  // Handle dismiss alert
  const handleDismissAlert = () => {
    setShowNewNotificationAlert(false);
    if (alertTimeout) {
      clearTimeout(alertTimeout);
    }
  };

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

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-white border-r border-gray-200 
        flex flex-col shadow-xl lg:shadow-sm
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
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

        {/* Navigation Menu */}
        <nav className="flex-1 py-6 px-4 overflow-y-auto">
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

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">EduAdmin v2.0</p>
            <p className="text-xs text-gray-500 mt-1">© 2025 Courses Admin</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen lg:ml-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-gray-200 bg-white shadow-sm">
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
            <button
              onClick={handleNotificationClick}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors group"
              title="Thông báo"
            >
              <FaBell className={`text-lg transition-colors ${
                loadingNotifications ? 'text-blue-500 animate-pulse' : 'text-gray-600 group-hover:text-blue-600'
              }`} />

              {/* Badge hiển thị số thông báo chưa đọc */}
              {unreadNotifications > 0 && !loadingNotifications && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs
                               rounded-full flex items-center justify-center animate-pulse font-medium
                               shadow-lg border-2 border-white">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}

              {/* Loading indicator */}
              {loadingNotifications && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></span>
              )}
            </button>

            {/* Profile Dropdown */}
            <ProfileDropdownAdmin admin={admin} />
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Admin</span>
              <span>/</span>
              <span className="text-gray-700 font-medium">{getCurrentPageTitle()}</span>
            </nav>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[calc(100vh-200px)]">
            <Outlet />
          </div>
        </div>

        {/* New notification alert (bottom right corner) */}
        {showNewNotificationAlert && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-md border border-gray-200">
              <div className="flex-shrink-0">
                <FaInfoCircle className="text-blue-500 text-2xl" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  Bạn có {unreadNotifications - previousUnreadCount} thông báo mới.
                </p>
              </div>
              <button
                onClick={handleDismissAlert}
                className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Đóng thông báo"
              >
                <FaTimes className="text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminLayout;
