import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
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
  FaSearch
} from 'react-icons/fa';
import ProfileDropdownAdmin from '../../components/ui/profile/ProfileDropdownAdmin';
import { useAuth } from '../../contexts/AuthContext';

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
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <FaBell className="text-gray-600 text-lg" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs
                             rounded-full flex items-center justify-center animate-pulse">
                3
              </span>
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
      </main>
    </div>
  );
};

export default AdminLayout;