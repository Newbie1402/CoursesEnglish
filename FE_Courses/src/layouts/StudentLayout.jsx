import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FaBars, FaUserCircle, FaTimes, FaHome, FaBook, FaClipboardList, FaBell, FaChartBar
} from 'react-icons/fa';
import { cn } from '@/lib/utils';
import NotificationBadge from '@/components/ui/notification/NotificationBadge';
import ProfileDropdownStudent from '@/components/ui/profile/ProfileDropdownStudent';

// Mock data cho student
const mockStudent = {
  id: 1,
  name: "Nguyễn Văn B",
  avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+B",
  role: "Sinh viên",
  email: "student@example.com"
};

// Đặt tên route để hiển thị breadcrumb
const ROUTE_NAMES = {
  '/student/dashboard': 'Dashboard',
  '/student/courses': 'Khoá học của tôi',
  '/student/attendance': 'Điểm danh',
  '/student/exams': 'Kỳ thi',
  '/student/grades': 'Kết quả học tập',
  '/student/notifications': 'Thông báo',
  '/student/feedback': 'Góp ý giảng viên'
};

const MobileNavItem = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center flex-1 py-2 px-3",
      "text-xs font-medium transition-colors hover:text-blue-600",
      isActive ? "text-blue-600 font-semibold" : "text-gray-600"
    )}
  >
    <Icon className={cn("w-5 h-5 mb-1", isActive ? "text-blue-600" : "text-gray-600")} />
    <span>{label}</span>
  </button>
);

const SidebarItem = ({ label, path, icon: Icon, location, navigate }) => {
  const isActive = location.pathname === path;
  return (
    <button
      onClick={() => navigate(path)}
      className={cn(
        "flex items-center w-full px-3 py-2 rounded-lg text-left transition-colors",
        "hover:bg-gray-100 hover:text-blue-600",
        isActive ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700"
      )}
    >
      {Icon && <Icon className="mr-2 h-5 w-5" />}
      {label}
    </button>
  );
};

const StudentLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentPageName = ROUTE_NAMES[location.pathname] || 'Dashboard';

  React.useEffect(() => {
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  }, [location]);

  React.useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mobileNavItems = [
    { path: '/student/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/student/courses', icon: FaBook, label: 'Khoá học' },
    { path: '/student/exams', icon: FaClipboardList, label: 'Kỳ thi' },
    { path: '/student/notifications', icon: FaBell, label: 'Thông báo' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/95">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white z-40 border-b border-gray-200 shadow-sm">
        <div className="h-14 lg:h-16 flex items-center justify-between px-3 lg:px-4">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isSidebarOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>
            <h1 className="text-lg lg:text-xl font-semibold text-gray-800">
              Student Portal
            </h1>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-sm lg:text-base text-gray-600 font-medium">
              {currentPageName}
            </span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <NotificationBadge />
            <ProfileDropdownStudent student ={mockStudent} />
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-14 lg:top-16 bottom-16 lg:bottom-0 w-[260px] bg-white border-r border-gray-200 z-40 transition-transform",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Avatar */}
          <div className="p-6 border-b flex flex-col items-center">
            <div className="relative group">
              <img
                src={mockStudent.avatar}
                alt="avatar"
                className="w-24 h-24 rounded-full border-4 mb-3 transition-colors duration-300"
                style={{ borderColor: "rgb(219 234 254)" }} // màu nhạt mặc định
              />
              {/* Chấm xanh trạng thái */}
              <span className="absolute bottom-3 right-2 block w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>

              {/* Viền hover overlay */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  border: "4px solid transparent",
                }}
              />
            </div>

            <div className="text-center group-hover:[&>div:first-child>img]:border-[rgb(191,219,254)]">
              <p className="font-semibold text-lg">{mockStudent.name}</p>
              <p className="text-blue-600 font-medium text-base">{mockStudent.role}</p>
              <p className="text-sm text-gray-500">{mockStudent.email}</p>
            </div>
          </div>


          <nav className="flex-1 p-4 space-y-5">
            <SidebarItem label="Dashboard" path="/student/dashboard" icon={FaHome} location={location} navigate={navigate} />
            <SidebarItem label="Khoá học" path="/student/courses" icon={FaBook} location={location} navigate={navigate} />
            <SidebarItem label="Kỳ thi" path="/student/exams" icon={FaClipboardList} location={location} navigate={navigate} />
            <SidebarItem label="Điểm danh" path="/student/attendance" icon={FaChartBar} location={location} navigate={navigate} />
            <SidebarItem label="Kết quả học tập" path="/student/grades" icon={FaChartBar} location={location} navigate={navigate} />
            <SidebarItem label="Thông báo" path="/student/notifications" icon={FaBell} location={location} navigate={navigate} />
            <SidebarItem label="Góp ý giảng viên" path="/student/feedback" icon={FaUserCircle} location={location} navigate={navigate} />
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pt-14 lg:pt-16 pb-16 lg:pb-0 min-h-screen lg:pl-64">
        <div className="px-4 py-4 lg:py-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
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

export default StudentLayout;
