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
  const { logout } = useAuth();
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
      await axios.post(`${BASE_URL}/api/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      addToast('Đăng xuất thành công!', 'success');
      navigate('/login');
    }
  };

  const handleMenuClick = (onClick) => {
    onClick();
    setIsOpen(false);
  };

  const menuItems = [
    {
      icon: FaUserCircle,
      label: 'Trang cá nhân',
      onClick: () => navigate('/admin/profile'),
      color: 'text-blue-600'
    },
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
    {
      icon: FaChartBar,
      label: 'Thống kê & Báo cáo',
      onClick: () => navigate('/admin/reports'),
      color: 'text-indigo-600'
    },
    {
      icon: FaCog,
      label: 'Cài đặt hệ thống',
      onClick: () => navigate('/admin/settings'),
      color: 'text-gray-600'
    }
  ];

  const displayName = admin?.fullName || admin?.name || 'Admin';
  const displayEmail = admin?.email || '';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200",
          "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "border border-gray-200",
          isOpen && "bg-gray-100 ring-2 ring-blue-500 ring-offset-2"
        )}
      >
        {/* Avatar */}
        <div className="relative">
          {admin?.avatarUrl ? (
            <img
              src={admin.avatarUrl}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <FaUserShield className="text-white text-lg" />
            </div>
          )}
          {/* Online indicator */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        </div>

        {/* User Info */}
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {displayName}
          </p>
          <p className="text-xs text-gray-500 truncate">
            Quản trị viên
          </p>
        </div>

        {/* Dropdown Icon */}
        <FaChevronDown
          className={cn(
            "text-gray-400 transition-transform duration-200 flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              {admin?.avatarUrl ? (
                <img
                  src={admin.avatarUrl}
                  alt={displayName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <FaUserShield className="text-white text-xl" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {displayEmail}
                </p>
                <p className="text-xs text-blue-600 font-medium">
                  Quản trị viên hệ thống
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleMenuClick(item.onClick)}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150"
              >
                <item.icon className={cn("text-lg flex-shrink-0", item.color)} />
                <span className="text-sm text-gray-700 font-medium">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-2"></div>

          {/* Logout Button */}
          <button
            onClick={() => handleMenuClick(handleLogout)}
            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-50 transition-colors duration-150 group"
          >
            <FaSignOutAlt className="text-lg text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-600 font-medium group-hover:text-red-700">
              Đăng xuất
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdownAdmin;
