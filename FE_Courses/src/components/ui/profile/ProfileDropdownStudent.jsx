import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaCog, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import axios from "axios";
import { useToast } from '@/components/ui/toast/Toast';
import { useAuth } from '@/contexts/AuthContext';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProfileDropdownStudent = ({ student }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const navigate = useNavigate();
    const { addToast } = useToast();
    const { auth, logout } = useAuth();

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

  const menuItems = [
    {
      icon: FaUserCircle,
      label: 'Trang cá nhân',
      onClick: () => navigate('/student/profile')
    },
    {
      icon: FaCog,
      label: 'Cài đặt',
      onClick: () => navigate('/student/settings')
    },
    {
      icon: FaSignOutAlt,
      label: 'Đăng xuất',
      onClick: () => { handleLogout() },
      className: 'text-red-600 hover:bg-red-50'
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 p-2",
          "rounded-lg hover:bg-gray-100",
          "transition-colors duration-150"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <FaUserCircle className="w-5 h-5 text-gray-700" />
        <span className="hidden sm:block text-sm font-medium text-gray-700">
          {student?.name || "Student"}
        </span>
        <FaChevronDown
          className={cn(
            "w-4 h-4 text-gray-500 transition-transform duration-200 hidden sm:block",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={cn(
          "absolute right-0 mt-2 w-48 py-2",
          "bg-white rounded-lg shadow-lg border border-gray-100",
          "animate-in fade-in slide-in-from-top-1 duration-200",
          "z-50"
        )}>
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{student?.name || "Student Name"}</p>
            <p className="text-xs text-gray-500">{student?.email || "student@email.com"}</p>
          </div>

          <div className="py-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => {
                    setIsOpen(false);
                    item.onClick();
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-4 py-2",
                    "text-sm text-gray-700",
                    "hover:bg-gray-50 transition-colors duration-150",
                    item.className
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdownStudent;
