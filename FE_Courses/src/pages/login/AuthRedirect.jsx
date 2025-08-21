import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';

const AuthRedirect = () => {
  const navigate = useNavigate();
  const { token, roles, logout } = useAuth();

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    if (Array.isArray(roles) && (roles.includes('ADMIN') || roles.includes('ROLE_ADMIN'))) {
      navigate('/admin', { replace: true });
    } else if (Array.isArray(roles) && (roles.includes('TEACHER') || roles.includes('ROLE_TEACHER'))) {
      navigate('/teacher', { replace: true });
    } else if (Array.isArray(roles) && (roles.includes('USER') || roles.includes('ROLE_USER'))) {
      navigate('/user', { replace: true });
    } else {
      // Không có role hợp lệ, logout và về login
      logout && logout();
      navigate('/login', { replace: true });
    }
  }, [token, roles, navigate, logout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-700">Đang kiểm tra đăng nhập...</p>
      </div>
    </div>
  );
};

export default AuthRedirect;
