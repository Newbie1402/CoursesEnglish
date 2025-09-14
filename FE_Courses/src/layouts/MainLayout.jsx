import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaTimes,
  FaHome,
  FaBook,
  FaClipboardList,
  FaCog,
  FaSearch,
  FaBell,
  FaGraduationCap,
  FaChevronRight
} from 'react-icons/fa';
import { cn } from '@/lib/utils';
import NavigationMenu from '@/components/teacher/NavigationMenu';
import ProfileDropdownTeacher from '@/components/ui/profile/ProfileDropdownTeacher.jsx';
import useTeacherService from '@/services/hooks/useTeacherService.js';

const ROUTE_NAMES = {
  '/teacher/dashboard': 'Dashboard',
  '/teacher/notifications': 'Thông báo',
  '/teacher/courses': 'Khóa học',
  '/teacher/assignments': 'Bài tập',
  '/teacher/reports': 'Báo cáo',
  '/teacher/settings': 'Cài đặt'
};

const MobileNavItem = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-xl mx-1",
      "text-xs font-medium transition-all duration-200 transform",
      "relative overflow-hidden group",
      isActive
        ? "text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg scale-105"
        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:scale-105"
    )}
  >
    {/* Background animation */}
    <div className={cn(
      "absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 transition-opacity duration-300",
      "group-hover:opacity-10"
    )} />

    <Icon className={cn(
      "w-5 h-5 mb-1 z-10 transition-transform duration-200",
      isActive ? "text-white transform scale-110" : "group-hover:scale-110"
    )} />
    <span className="z-10 relative">{label}</span>

    {/* Active indicator */}
    {isActive && (
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full" />
    )}
  </button>
);

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const location = useLocation();
  const navigate = useNavigate();
  const headerRef = React.useRef(null);

  // Real-time clock
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Lấy tên trang từ route hiện tại
  const currentPageName = ROUTE_NAMES[location.pathname] || 'Dashboard';

  // Lấy thông tin giảng viên từ API
  const teacherId = localStorage.getItem('teacherId');
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { getTeacherDetails } = useTeacherService(BASE_URL);
  const [profile, setProfile] = React.useState({
    fullName: '',
    email: '',
    specialization: '',
    avatar: ''
  });

  React.useEffect(() => {
    if (teacherId) {
      getTeacherDetails(teacherId).then((data) => {
        if (data) {
          setProfile({
            fullName: data.fullName || '',
            email: data.email || '',
            specialization: data.specialization || '',
            avatar: data.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName || 'GV')}`
          });
        }
      });
    }
  }, [teacherId]);

  // Đóng sidebar khi route thay đổi trên mobile
  React.useEffect(() => {
    const handleRouteChange = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };
    handleRouteChange();
  }, [location]);

  // Đóng sidebar khi resize xuống mobile
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mobileNavItems = [
    { path: '/teacher/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: 'teacher/notifications', icon: FaBell, label: 'Thông báo' },
    { path: '/teacher/courses', icon: FaBook, label: 'Khóa học' },
    { path: '/teacher/assignments', icon: FaClipboardList, label: 'Bài tập' },
    { path: '/teacher/settings', icon: FaCog, label: 'Cài đặt' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 17) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header
        ref={headerRef}
        className={cn(
          "fixed top-0 left-0 right-0 z-40",
          "bg-white/80 backdrop-blur-lg border-b border-gray-200/50",
          "shadow-sm transition-all duration-200"
        )}
      >
        <div className="h-16 lg:h-18">
          <div className="flex h-full items-center justify-between px-4 lg:px-6 max-w-[1920px] mx-auto">
            {/* Left side */}
            <div className="flex items-center gap-4 lg:gap-6">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={cn(
                  "lg:hidden p-3 rounded-xl transition-all duration-200",
                  "hover:bg-gray-100 active:bg-gray-200 hover:scale-105",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                )}
                aria-label={isSidebarOpen ? "Đóng menu" : "Mở menu"}
              >
                {isSidebarOpen ? (
                  <FaTimes className="w-5 h-5 text-gray-700" />
                ) : (
                  <FaBars className="w-5 h-5 text-gray-700" />
                )}
              </button>

              {/* Brand & Breadcrumb */}
              <div className="flex items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <FaGraduationCap className="text-white text-xl" />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      EduManager
                    </h1>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>Dashboard</span>
                      <FaChevronRight className="mx-2 text-xs" />
                      <span className="text-gray-700 font-medium">{currentPageName}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Title */}
              <h1 className="sm:hidden text-lg font-semibold text-gray-800 truncate">
                {currentPageName}
              </h1>
            </div>

            {/* Center - Search Bar (Desktop) */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Tìm kiếm khóa học, bài học..."
                  className={cn(
                    "w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200",
                    "bg-white/80 backdrop-blur-sm",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    "text-sm placeholder-gray-400 transition-all duration-200"
                  )}
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 lg:gap-4">
              {/* Time Display */}
              <div className="hidden lg:flex flex-col items-end text-xs">
                <span className="text-gray-600 font-medium">
                  {currentTime.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span className="text-gray-400">
                  {currentTime.toLocaleDateString('vi-VN', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>

              {/* Quick Actions */}
              <div className="hidden sm:flex items-center">
              </div>

              {/* Profile Dropdown */}
              <ProfileDropdownTeacher
                teacher={{
                  name: profile.fullName || 'Giảng viên',
                  email: profile.email,
                  avatar: profile.avatar,
                  role: profile.specialization || 'Giảng viên tiếng Anh'
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className={cn(
            "fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-30",
            "transition-all duration-300 animate-in fade-in"
          )}
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 lg:top-18 bottom-16 lg:bottom-0 w-80 lg:w-72",
          "bg-white/90 backdrop-blur-lg border-r border-gray-200/50",
          "transform transition-all duration-300 ease-in-out z-40",
          "lg:transform-none lg:translate-x-0 shadow-xl lg:shadow-sm",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "overflow-hidden"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Profile Section */}
          <div className="p-6 border-b border-gray-100/50 bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || 'GV')}`}
                  alt={profile.fullName}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {getGreeting()}! 👋
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {profile.fullName || 'Giảng viên'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {profile.specialization || 'Chuyên ngành giảng dạy'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 overflow-y-auto">
            <NavigationMenu />
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100/50 bg-gray-50/50">
            <div className="text-center">
              <p className="text-xs text-gray-500">
                EduManager v2.0
              </p>
              <p className="text-xs text-gray-400 mt-1">
                © 2025 Course Management
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "pt-16 lg:pt-18 pb-20 lg:pb-6 min-h-screen transition-all duration-300 ease-in-out",
          "lg:pl-72"
        )}
      >
        <div className="px-4 lg:px-6 py-6 max-w-[1920px] mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200/50 z-40">
        <div className="flex items-center justify-between px-2 py-2 h-16">
          {mobileNavItems.map((item) => (
            <MobileNavItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              isActive={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            />
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;
