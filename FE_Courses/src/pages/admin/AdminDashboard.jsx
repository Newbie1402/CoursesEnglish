import React, { useState, useEffect, useContext } from 'react';
import {
  FaUsers,
  FaGraduationCap,
  FaClipboardList,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaPlus,
  FaChartLine,
  FaCalendarAlt,
  FaBell,
  FaCog,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaDownload,
  FaEdit,
  FaTrash,
  FaUserLock,
  FaUserCheck
} from 'react-icons/fa';
import { getNotificationUser } from '@/services/hooks/notificationService';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  // Mapping notification types to icons and colors
  const notificationTypeConfig = {
    ADMIN_NEW_ACCOUNT: {
      icon: FaUserCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    ADMIN_ACCOUNT_LOCKED: {
      icon: FaUserLock,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    ADMIN_ACCOUNT_UNLOCKED: {
      icon: FaUserCheck,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    ADMIN_COURSE_CREATED: {
      icon: FaPlus,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    ADMIN_COURSE_UPDATED: {
      icon: FaEdit,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    ADMIN_COURSE_DELETED: {
      icon: FaTrash,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    ADMIN_EXAM_CREATED: {
      icon: FaClipboardList,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    ADMIN_EXAM_UPDATED: {
      icon: FaEdit,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    ADMIN_EXAM_DELETED: {
      icon: FaTrash,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    DEFAULT: {
      icon: FaBell,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50'
    }
  };

  // Format time function
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

  // Fetch recent activities from notifications
  const fetchRecentActivities = async () => {
    if (!token) return;

    try {
      setLoadingActivities(true);
      const response = await getNotificationUser(token);

      if (response?.data?.content) {
        // Sort by createdAt (newest first) and take first 5
        const sortedNotifications = response.data.content
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        // Map notifications to activity format
        const activities = sortedNotifications.map(notification => {
          const config = notificationTypeConfig[notification.type] || notificationTypeConfig.DEFAULT;

          return {
            id: notification.id,
            type: notification.type,
            message: notification.message,
            time: formatTime(notification.createdAt),
            icon: config.icon,
            color: config.color,
            bgColor: config.bgColor,
            isRead: notification.read
          };
        });

        setRecentActivities(activities);
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setRecentActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchRecentActivities();
  }, [token]);

  // Mock data - sẽ được thay thế bằng API calls
  const stats = [
    {
      title: 'Tổng người dùng',
      value: 1247,
      change: '+12%',
      trend: 'up',
      icon: FaUsers,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Khóa học hoạt động',
      value: 32,
      change: '+8%',
      trend: 'up',
      icon: FaGraduationCap,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Bài kiểm tra',
      value: 156,
      change: '+24%',
      trend: 'up',
      icon: FaClipboardList,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Học viên đang học',
      value: 892,
      change: '+15%',
      trend: 'up',
      icon: FaUserGraduate,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'Giảng viên',
      value: 45,
      change: '+3%',
      trend: 'up',
      icon: FaChalkboardTeacher,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600'
    },
    {
      title: 'Tỷ lệ hoàn thành',
      value: '87%',
      change: '+5%',
      trend: 'up',
      icon: FaCheckCircle,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Quản trị
          </h1>
          <p className="text-gray-600">
            Tổng quan về hoạt động của hệ thống học tập
          </p>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            <FaClock className="inline mr-2" />
            {currentTime.toLocaleString('vi-VN')}
          </div>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
            <FaDownload />
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? FaArrowUp : FaArrowDown;

          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center space-x-1 ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendIcon className="text-xs" />
                      <span className="text-sm font-medium">{stat.change}</span>
                    </div>
                    <span className="text-xs text-gray-500">so với tháng trước</span>
                  </div>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`text-2xl ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Hoạt động gần đây
            </h3>
            <button
              onClick={fetchRecentActivities}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center space-x-1"
            >
              <FaEye />
              <span>Làm mới</span>
            </button>
          </div>

          <div className="space-y-4">
            {loadingActivities ? (
              // Loading skeleton
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivities.length === 0 ? (
              // Empty state
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaBell className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Chưa có hoạt động nào</h4>
                <p className="text-gray-500 text-sm">Các hoạt động gần đây sẽ hiển thị ở đây</p>
              </div>
            ) : (
              // Activities list
              recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className={`flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                      !activity.isRead ? 'bg-blue-50/50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${activity.bgColor || 'bg-gray-100'}`}>
                      <Icon className={`${activity.color} text-lg`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${!activity.isRead ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                    {!activity.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Thao tác nhanh
          </h3>
          <div className="space-y-4">
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg transition-colors flex items-center space-x-3">
              <FaPlus className="text-lg" />
              <span>Thêm người dùng mới</span>
            </button>
            <button className="w-full bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg transition-colors flex items-center space-x-3">
              <FaGraduationCap className="text-lg" />
              <span>Tạo khóa học mới</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
