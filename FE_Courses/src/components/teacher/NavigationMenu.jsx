import React from 'react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FaCog,
    FaChartBar,
    FaHome,
    FaTasks,
    FaUsers,
    FaBook, FaBell
} from 'react-icons/fa';

const navigationGroups = [
  {
    title: 'Tổng quan',
    items: [
      {
        label: 'Dashboard',
        icon: FaHome,
        path: '/teacher/dashboard',
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        hoverColor: 'hover:bg-blue-100',
        activeGradient: 'from-blue-500 to-blue-600',
        description: 'Trang chủ và thống kê'
      },
        {
            label: 'Thông báo',
            icon: FaBell,
            path: '/teacher/notifications',
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-50',
            hoverColor: 'hover:bg-yellow-100',
            activeGradient: 'from-yellow-500 to-yellow-600',
            description: 'Quản lý thông báo',
        }
    ]
  },
  {
    title: 'Quản lý giảng dạy',
    items: [
      {
        label: 'Khóa học',
        icon: FaBook,
        path: '/teacher/courses',
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        hoverColor: 'hover:bg-green-100',
        activeGradient: 'from-green-500 to-green-600',
        description: 'Quản lý khóa học',
      },
      {
        label: 'Bài tập',
        icon: FaTasks,
        path: '/teacher/assignments',
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        hoverColor: 'hover:bg-orange-100',
        activeGradient: 'from-orange-500 to-orange-600',
        description: 'Tạo và chấm bài tập',
      },
    ]
  },
  {
    title: 'Cài đặt',
    items: [
      {
        label: 'Cài đặt',
        icon: FaCog,
        path: '/teacher/settings',
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        hoverColor: 'hover:bg-gray-100',
        activeGradient: 'from-gray-500 to-gray-600',
        description: 'Cài đặt tài khoản'
      }
    ]
  }
];

const NavigationMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="space-y-6">
      {navigationGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-2">
          {/* Group Title */}
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
            {group.title}
          </h3>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                    "hover:shadow-sm transform hover:scale-[1.02]",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white",
                    "relative overflow-hidden",
                    isActive ? (
                      `bg-gradient-to-r ${item.activeGradient} text-white shadow-lg scale-[1.02]`
                    ) : (
                      `text-gray-700 hover:text-gray-900 ${item.hoverColor}`
                    )
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  title={item.description}
                >
                  {/* Background animation */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300",
                    `${item.activeGradient}`,
                    "group-hover:opacity-10"
                  )} />

                  {/* Icon */}
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 z-10",
                    isActive
                      ? "bg-white/20"
                      : `${item.bgColor} group-hover:scale-110`
                  )}>
                    <Icon className={cn(
                      "w-5 h-5 transition-all duration-200",
                      isActive
                        ? "text-white"
                        : `${item.color} group-hover:scale-110`
                    )} />
                  </div>

                  {/* Label & Description */}
                  <div className="flex-1 text-left z-10">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-medium transition-colors duration-200",
                        isActive ? "text-white" : "text-gray-900"
                      )}>
                        {item.label}
                      </span>

                      {/* Badge */}
                      {item.badge && (
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-200",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-red-500 text-white animate-pulse"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className={cn(
                      "text-xs transition-colors duration-200 mt-0.5",
                      isActive ? "text-white/80" : "text-gray-500"
                    )}>
                      {item.description}
                    </p>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="flex-shrink-0 z-10">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    </div>
                  )}

                  {/* Hover indicator */}
                  <div className={cn(
                    "absolute right-3 top-1/2 transform -translate-y-1/2 w-1 h-6 rounded-full transition-all duration-200 z-10",
                    `bg-gradient-to-b ${item.activeGradient}`,
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                  )} />
                </button>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
};

export default NavigationMenu;
