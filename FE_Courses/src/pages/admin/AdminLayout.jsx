import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const adminMenu = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Người dùng', path: '/admin/users' },
  { label: 'Khóa học', path: '/admin/courses' },
  { label: 'Bài kiểm tra', path: '/admin/exams' },
  { label: 'Thông báo', path: '/admin/notifications' },
  { label: 'Báo cáo', path: '/admin/reports' },
];

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="h-16 flex items-center justify-center font-bold text-xl border-b">Admin Panel</div>
        <nav className="flex-1 py-4">
          {adminMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block px-6 py-3 rounded-lg mb-1 font-medium transition hover:bg-gray-100 ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`
              }
              end={item.path === '/admin'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t text-sm text-gray-500">© 2025 Courses Admin</div>
      </aside>
      {/* Main content */}
      <main className="flex-1 min-h-screen">
        {/* Header */}
        <header className="h-16 flex items-center justify-end px-8 border-b bg-white">
          <span className="font-medium text-gray-700 mr-4">Admin</span>
          <img src="/vite.svg" alt="avatar" className="w-8 h-8 rounded-full" />
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

