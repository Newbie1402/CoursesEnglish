import React from 'react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaChalkboardTeacher,
  FaBook,
  FaUserGraduate,
  FaClipboardList,
  FaCog,
  FaGraduationCap,
  FaChartBar
} from 'react-icons/fa';

const navigationItems = [
  {
    label: 'Dashboard',
    icon: FaChalkboardTeacher,
    path: '/teacher/dashboard'
  },
  {
    label: 'Khóa học',
    icon: FaBook,
    path: '/teacher/courses'
  },
  {
    label: 'Bài học',
    icon: FaGraduationCap,
    path: '/teacher/lessons'
  },
  {
    label: 'Bài tập',
    icon: FaClipboardList,
    path: '/teacher/assignments'
  },
  {
    label: 'Học viên',
    icon: FaUserGraduate,
    path: '/teacher/students'
  },
  {
    label: 'Báo cáo',
    icon: FaChartBar,
    path: '/teacher/reports'
  },
  {
    label: 'Cài đặt',
    icon: FaCog,
    path: '/teacher/settings'
  }
];

const NavigationMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className="space-y-1">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
              "hover:bg-gray-50 active:bg-gray-100",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
              isActive ? (
                "bg-blue-50 text-blue-700 font-medium"
              ) : (
                "text-gray-700 hover:text-gray-900"
              )
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className={cn(
              "flex-shrink-0 w-5 h-5 transition-colors duration-200",
              isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
            )} />
            <span>{item.label}</span>
            {isActive && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default NavigationMenu;
