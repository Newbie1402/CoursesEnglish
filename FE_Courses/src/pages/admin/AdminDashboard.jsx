import React, { useState, useEffect } from 'react';
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
  FaDownload
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const recentActivities = [
    {
      id: 1,
      type: 'user',
      message: 'Học viên mới đăng ký: Nguyễn Văn A',
      time: '5 phút trước',
      icon: FaUsers,
      color: 'text-blue-500'
    },
    {
      id: 2,
      type: 'course',
      message: 'Khóa học mới được tạo: React Advanced',
      time: '15 phút trước',
      icon: FaGraduationCap,
      color: 'text-green-500'
    },
    {
      id: 3,
      type: 'exam',
      message: 'Bài kiểm tra được hoàn thành: 25 học viên',
      time: '1 giờ trước',
      icon: FaClipboardList,
      color: 'text-purple-500'
    },
    {
      id: 4,
      type: 'system',
      message: 'Cập nhật hệ thống thành công',
      time: '2 giờ trước',
      icon: FaCog,
      color: 'text-gray-500'
    }
  ];

  const quickActions = [
    {
      title: 'Thêm người dùng',
      description: 'Tạo tài khoản mới',
      icon: FaPlus,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => console.log('Add user')
    },
    {
      title: 'Xem báo cáo',
      description: 'Thống kê chi tiết',
      icon: FaChartLine,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => console.log('View reports')
    },
    {
      title: 'Quản lý khóa học',
      description: 'Danh sách khóa học',
      icon: FaGraduationCap,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => console.log('Manage courses')
    },
    {
      title: 'Cài đặt hệ thống',
      description: 'Cấu hình admin',
      icon: FaCog,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => console.log('Settings')
    }
  ];

  const systemStatus = [
    {
      name: 'Server Status',
      status: 'online',
      uptime: '99.9%',
      icon: FaCheckCircle,
      color: 'text-green-500'
    },
    {
      name: 'Database',
      status: 'online',
      uptime: '99.8%',
      icon: FaCheckCircle,
      color: 'text-green-500'
    },
    {
      name: 'API Response',
      status: 'warning',
      uptime: '98.5%',
      icon: FaExclamationTriangle,
      color: 'text-yellow-500'
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
            <button className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center space-x-1">
              <FaEye />
              <span>Xem tất cả</span>
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-lg bg-gray-100`}>
                    <Icon className={`${activity.color} text-lg`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions & System Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thao tác nhanh
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`${action.color} text-white p-4 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg group`}
                  >
                    <Icon className="text-xl mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-medium">{action.title}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Trạng thái hệ thống
            </h3>
            <div className="space-y-3">
              {systemStatus.map((system, index) => {
                const Icon = system.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Icon className={`${system.color} text-lg`} />
                      <span className="text-sm font-medium text-gray-900">
                        {system.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Uptime</p>
                      <p className="text-sm font-medium text-gray-900">
                        {system.uptime}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tăng trưởng người dùng
          </h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center text-gray-500">
              <FaChartLine className="text-4xl mx-auto mb-2" />
              <p>Biểu đồ sẽ được tích hợp tại đây</p>
              <p className="text-sm">Chart.js hoặc Recharts</p>
            </div>
          </div>
        </div>

        {/* Course Completion Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tỷ lệ hoàn thành khóa học
          </h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center text-gray-500">
              <FaCheckCircle className="text-4xl mx-auto mb-2" />
              <p>Biểu đồ tròn tỷ lệ hoàn thành</p>
              <p className="text-sm">Progress rings và percentages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Lịch hoạt động
            </h3>
            <FaCalendarAlt className="text-gray-400" />
          </div>
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center text-gray-500">
              <FaCalendarAlt className="text-4xl mx-auto mb-2" />
              <p>Mini calendar component</p>
              <p className="text-sm">Hiển thị sự kiện quan trọng</p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Thông báo hệ thống
            </h3>
            <FaBell className="text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-sm font-medium text-blue-900">
                Cập nhật hệ thống thành công
              </p>
              <p className="text-xs text-blue-700">Phiên bản 2.1.0 đã được triển khai</p>
            </div>
            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
              <p className="text-sm font-medium text-yellow-900">
                Bảo trì định kỳ
              </p>
              <p className="text-xs text-yellow-700">Dự kiến vào 2:00 AM ngày mai</p>
            </div>
            <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
              <p className="text-sm font-medium text-green-900">
                Backup hoàn tất
              </p>
              <p className="text-xs text-green-700">Dữ liệu đã được sao lưu thành công</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
