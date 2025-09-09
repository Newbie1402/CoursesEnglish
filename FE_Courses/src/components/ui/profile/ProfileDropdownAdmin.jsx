import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaChevronDown,
  FaUsers,
  FaChartBar,
  FaGraduationCap,
  FaClipboardList,
  FaBell,
  FaUserShield
} from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast/Toast';
import axios from 'axios';

const ProfileDropdownAdmin = ({ admin }) => {
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

  const handleMenuClick = (onClick) => {
    onClick();
    setIsOpen(false);
  };

  const menuItems = [
    {
      icon: FaUsers,
      label: 'Quản lý người dùng',
      onClick: () => navigate('/admin/users'),
      color: 'text-green-600'
    },
    {
      icon: FaGraduationCap,
      label: 'Quản lý khóa học',
      onClick: () => navigate('/admin/courses'),
      color: 'text-purple-600'
    },
    {
      icon: FaClipboardList,
      label: 'Quản lý bài kiểm tra',
      onClick: () => navigate('/admin/exams'),
      color: 'text-orange-600'
    },
    {
      icon: FaBell,
      label: 'Quản lý thông báo',
      onClick: () => navigate('/admin/notifications'),
      color: 'text-yellow-600'
    },
  ];

  const displayName = admin?.fullName || admin?.name || 'Admin';
  const displayEmail = admin?.email || '';

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
          {admin?.avatarUrl ? (
            <img
              src={admin.avatarUrl}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <FaUserShield className="text-white text-sm" />
            </div>
          )}
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>

        {/* User Info */}
        <div className="hidden sm:flex flex-col items-start min-w-0">
          <span className="text-sm font-medium text-gray-900 truncate">
            {displayName}
          </span>
          <span className="text-xs text-gray-500 truncate">
            Quản trị viên
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
          {/* User Info Header */}
          <div className="px-3 sm:px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative flex-shrink-0">
                {admin?.avatarUrl ? (
                  <img
                    src={admin.avatarUrl}
                    alt={displayName}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <FaUserShield className="text-white text-base sm:text-xl" />
                  </div>
                )}
                <div className="absolute -bottom-0.5 sm:-bottom-1 -right-0.5 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                  {displayName}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {displayEmail}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-blue-600 bg-blue-100 px-1.5 sm:px-2 py-0.5 rounded-full font-medium">
                    Quản trị viên hệ thống
                  </span>
                  <span className="text-xs text-green-600 bg-green-100 px-1.5 sm:px-2 py-0.5 rounded-full">
                    Đang hoạt động
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="max-h-60 sm:max-h-none overflow-y-auto py-1 sm:py-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleMenuClick(item.onClick)}
                className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 transition-all duration-150 group"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-transform duration-200 flex-shrink-0 group-hover:scale-110 bg-gray-50">
                  <item.icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", item.color)} />
                </div>
                <span className="text-sm font-medium text-gray-700 truncate">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-1 sm:my-2"></div>

          {/* Logout Button */}
          <button
            onClick={() => handleMenuClick(handleLogout)}
            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-red-50 transition-all duration-150 group"
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

export default ProfileDropdownAdmin;
