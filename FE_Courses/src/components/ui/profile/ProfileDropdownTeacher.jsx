import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaCog,
    FaSignOutAlt,
    FaChevronDown,
    FaChartBar,
    FaBell,
    FaCrown,
    FaGraduationCap, FaBook, FaHome
} from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast/Toast';
import axios from 'axios';

const ProfileDropdownTeacher = ({ teacher }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const navigate = useNavigate();
  const { logout, auth } = useAuth();
  const { addToast } = useToast();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Đóng dropdown khi click outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      // Lấy token từ localStorage hoặc auth context
      const token = localStorage.getItem('token') || auth?.token;

      // Gửi request logout với Authorization header
      await axios.post(`${BASE_URL}/api/auth/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      addToast('Đăng xuất thành công! Hẹn gặp lại 👋', 'success');
      navigate('/login');
    }
  };

  const menuGroups = [
      {
          title: 'Tổng quan',
          items: [
              {
                  icon: FaHome,
                  label: 'Dashboard',
                  description: 'Trang chủ và thống kê',
                  onClick: () => navigate('/teacher/dashboard'),
                  color: 'text-blue-500',
                  bgColor: 'bg-blue-50',
                  hoverColor: 'hover:bg-blue-100'
              },
              {
                  icon: FaBook,
                  label: 'Khóa học',
                  description: 'Xem và chỉnh sửa khóa học',
                  onClick: () => navigate('/teacher/courses'),
                  color: 'text-green-500',
                  bgColor: 'bg-green-50',
                  hoverColor: 'hover:bg-green-100'
              },
          ]
      },
    {
      title: 'Công cụ',
      items: [
          {
              icon: FaCog,
              label: 'Cài đặt',
              description: 'Tùy chỉnh tài khoản',
              onClick: () => navigate('/teacher/settings'),
              color: 'text-gray-500',
              bgColor: 'bg-gray-50',
              hoverColor: 'hover:bg-gray-100'
          },
        {
          icon: FaChartBar,
          label: 'Thống kê',
          description: 'Xem báo cáo chi tiết',
          onClick: () => navigate('/teacher/reports'),
          color: 'text-indigo-500',
          bgColor: 'bg-indigo-50',
          hoverColor: 'hover:bg-indigo-100'
        },
        {
          icon: FaBell,
          label: 'Thông báo',
          description: 'Quản lý thông báo',
          onClick: () => navigate('/teacher/notifications'),
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          hoverColor: 'hover:bg-yellow-100',
          badge: 3
        },
      ]
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200",
          "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "border border-gray-200 bg-white shadow-sm",
          isOpen && "bg-gray-100 ring-2 ring-blue-500 ring-offset-2"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div className="relative">
          {teacher?.avatar ? (
            <img
              src={teacher.avatar}
              alt={teacher.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <FaGraduationCap className="text-white text-sm" />
            </div>
          )}
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>

        {/* User Info */}
        <div className="hidden sm:flex flex-col items-start min-w-0">
          <span className="text-sm font-medium text-gray-900 truncate">
            {teacher?.name || 'Giảng viên'}
          </span>
          <span className="text-xs text-gray-500 truncate">
            {teacher?.role || 'Giáo viên'}
          </span>
        </div>

        {/* Dropdown Icon */}
        <FaChevronDown
          className={cn(
            "w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={cn(
          // Responsive width: full width trên mobile, fixed width trên desktop
          "absolute right-0 mt-2 w-screen max-w-sm sm:w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50",
          // Positioning: đảm bảo không tràn ra ngoài màn hình
          "sm:right-0 -right-2 mr-2 sm:mr-0",
          // Max height và scroll cho mobile
          "max-h-[90vh] overflow-y-auto",
          "animate-in fade-in slide-in-from-top-2 duration-200"
        )}>
          {/* Profile Header */}
          <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative flex-shrink-0">
                {teacher?.avatar ? (
                  <img
                    src={teacher.avatar}
                    alt={teacher.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <FaGraduationCap className="text-white text-base sm:text-lg" />
                  </div>
                )}
                <div className="absolute -bottom-0.5 sm:-bottom-1 -right-0.5 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                  {teacher?.name || 'Giảng viên'}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {teacher?.email || 'teacher@example.com'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <FaCrown className="text-yellow-500 text-xs" />
                    <span className="text-xs text-gray-500 hidden sm:inline">
                      {teacher?.role || 'Giảng viên'}
                    </span>
                  </div>
                  <span className="text-xs text-green-600 bg-green-100 px-1.5 sm:px-2 py-0.5 rounded-full">
                    Đang hoạt động
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Groups */}
          <div className="max-h-60 sm:max-h-none overflow-y-auto">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="py-1 sm:py-2">
                <h4 className="px-3 sm:px-4 py-1 sm:py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {group.title}
                </h4>
                {group.items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setIsOpen(false);
                        item.onClick();
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 transition-all duration-150 group",
                        item.hoverColor,
                        "hover:shadow-sm"
                      )}
                    >
                      <div className={cn(
                        "w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-transform duration-200 flex-shrink-0",
                        item.bgColor,
                        "group-hover:scale-110"
                      )}>
                        <Icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", item.color)} />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse flex-shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-1 sm:my-2"></div>

          {/* Logout Button */}
          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 hover:bg-red-50 transition-all duration-150 group"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-50 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 flex-shrink-0">
              <FaSignOutAlt className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <span className="text-sm font-medium text-red-600 group-hover:text-red-700 block truncate">
                Đăng xuất
              </span>
              <p className="text-xs text-red-400 truncate">
                Thoát khỏi tài khoản
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdownTeacher;