import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FaBars, FaUserCircle, FaTimes, FaHome, FaBook, FaClipboardList, FaCog, FaPlus
} from 'react-icons/fa';
import { cn } from '@/lib/utils';
import NavigationMenu from '@/components/dashboard/NavigationMenu';
import ProfileCard from '@/components/dashboard/ProfileCard';
import NotificationBadge from '@/components/ui/notification/NotificationBadge';
import ProfileDropdownTeacher from '@/components/ui/profile/ProfileDropdownTeacher.jsx';
import useTeacherService from '@/services/hooks/useTeacherService.js';

// Mock data cho user đang đăng nhập
const mockTeacher = {
  id: 1,
  name: "Nguyễn Văn A",
  avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+A",
  role: "Giảng viên tiếng Anh",
  email: "teacher@example.com"
};

const ROUTE_NAMES = {
  '/teacher/dashboard': 'Dashboard',
  '/teacher/courses': 'Khóa học',
  '/teacher/assignments': 'Bài tập',
  '/teacher/students': 'Học viên',
  '/teacher/reports': 'Báo cáo',
  '/teacher/settings': 'Cài đặt'
};

const MobileNavItem = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center flex-1 py-2 px-3",
      "text-xs font-medium transition-colors",
      isActive ? "text-blue-600" : "text-gray-600"
    )}
  >
    <Icon className={cn(
      "w-5 h-5 mb-1",
      isActive ? "text-blue-600" : "text-gray-600"
    )} />
    <span>{label}</span>
  </button>
);

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const headerRef = React.useRef(null);

  // Lấy tên trang từ route hiện tại
  const currentPageName = ROUTE_NAMES[location.pathname] || 'Dashboard';

  // Lấy thông tin giảng viên từ API
  const teacherId = localStorage.getItem('teacherId');
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { getTeacherInfo, teacherInfo, loading } = useTeacherService(BASE_URL);
  const [profile, setProfile] = React.useState({
    fullName: '',
    email: '',
    specialization: '',
    avatar: ''
  });

  React.useEffect(() => {
    if (teacherId) {
      getTeacherInfo(teacherId).then((data) => {
        if (data) {
          setProfile({
            fullName: data.fullName || '',
            email: data.email || '',
            specialization: data.specialization || '',
            avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName || 'GV')}`
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
    { path: '/teacher/courses', icon: FaBook, label: 'Khóa học' },
    { path: '/teacher/assignments', icon: FaClipboardList, label: 'Bài tập' },
    { path: '/teacher/settings', icon: FaCog, label: 'Cài đặt' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/95">
      {/* Header */}
      <header
        ref={headerRef}
        className={cn(
          "fixed top-0 left-0 right-0 bg-white z-40",
          "border-b border-gray-200 shadow-sm",
          "transition-all duration-200"
        )}
      >
        <div className="h-14 lg:h-16">
          <div className="flex h-full items-center justify-between px-3 lg:px-4 max-w-[1920px] mx-auto">
            {/* Left side */}
            <div className="flex items-center gap-3 lg:gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={cn(
                  "lg:hidden p-2 rounded-lg transition-colors",
                  "hover:bg-gray-100 active:bg-gray-200",
                  "focus:outline-none focus:ring-2 focus:ring-primary-500"
                )}
                aria-label={isSidebarOpen ? "Đóng menu" : "Mở menu"}
              >
                {isSidebarOpen ? (
                  <FaTimes className="w-5 h-5 text-gray-700" />
                ) : (
                  <FaBars className="w-5 h-5 text-gray-700" />
                )}
              </button>

              {/* Breadcrumb */}
              <div className="hidden sm:flex items-center">
                <h1 className="text-lg lg:text-xl font-semibold text-gray-800">
                  Course Management
                </h1>
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-sm lg:text-base text-gray-600 font-medium">
                  {currentPageName}
                </span>
              </div>

              {/* Mobile Title */}
              <h1 className="sm:hidden text-lg font-semibold text-gray-800 truncate">
                {currentPageName}
              </h1>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Quick Actions */}
              <div className="hidden sm:flex items-center mr-2">
                <button
                  onClick={() => navigate('/teacher/courses/new')}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5",
                    "text-sm text-gray-700 font-medium",
                    "rounded-lg border border-gray-200",
                    "hover:bg-gray-50 active:bg-gray-100",
                    "hover:border-gray-300",
                    "transition-all duration-150"
                  )}
                >
                  <FaPlus className="w-4 h-4" />
                  <span>Tạo khóa học</span>
                </button>
              </div>

              {/* Notifications */}
              <NotificationBadge />

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
            "transition-opacity duration-300",
            "animate-in fade-in"
          )}
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-14 lg:top-16 bottom-16 lg:bottom-0 w-[280px] bg-white border-r border-gray-200",
          "transform transition-transform duration-300 ease-in-out z-40",
          "lg:w-64 lg:transform-none lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "overflow-hidden"
        )}
      >
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
          <div className="p-4 lg:p-6 border-b border-gray-100">
            <ProfileCard teacher={
                {
                    name: profile.fullName || 'Giảng viên',
                    email: profile.email,
                    avatar: profile.avatar,
                    role: profile.specialization || 'Giảng viên tiếng Anh'
                }
            } />
          </div>
          <div className="flex-1 p-4">
            <NavigationMenu />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "pt-14 lg:pt-16 pb-16 lg:pb-0 min-h-screen transition-all duration-300 ease-in-out",
          "lg:pl-64"
        )}
      >
        <div className="px-4 py-4 lg:py-6 max-w-[1920px] mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex items-center justify-around h-16">
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
