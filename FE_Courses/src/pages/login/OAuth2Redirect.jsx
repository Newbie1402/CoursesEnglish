import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/toast/Toast.jsx';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '@/contexts/AuthContext.jsx';

const OAuth2Redirect = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { setAuth } = useAuth();

  useEffect(() => {
    // Lấy thông tin từ query parameters
    const params = new URLSearchParams(window.location.search);
    const encodedToken = params.get('token');
    const studentId = params.get('studentId');
    const teacherId = params.get('teacherId');

    // Decode token từ URL encoding
    const token = encodedToken ? decodeURIComponent(encodedToken) : null;

    console.log('[OAuth2Redirect] token:', token ? 'Có token' : 'Không có token');
    if (token && token.length > 20) {
      console.log('[OAuth2Redirect] token prefix:', token.substring(0, 20) + '...');
    }
    console.log('[OAuth2Redirect] studentId:', studentId, 'teacherId:', teacherId);

    if (!token) {
      addToast('Không nhận được token, vui lòng đăng nhập lại', 'error');
      navigate('/login');
      return;
    }

    try {
      // Lưu token vào localStorage ngay lập tức
      localStorage.setItem('token', token);
      console.log('[OAuth2Redirect] Đã lưu token vào localStorage');

      // Giải mã token để lấy thông tin user
      const decoded = jwtDecode(token);
      console.log('[OAuth2Redirect] Decoded token:', decoded);

      const userId = decoded.UserId || decoded.userId || decoded.sub;
      const roles = decoded.roles || decoded.Roles || [];
      const role = roles[0] || null;

      // Lưu thông tin vào AuthContext
      setAuth({
        token,
        userId,
        roles,
        role,
        studentId,
        teacherId
      });

      // Điều hướng dựa theo role
      addToast('Đăng nhập thành công!', 'success');

      if (roles.includes('ROLE_ADMIN')) {
        setTimeout(() => navigate('/admin'), 1000);
      } else if (roles.includes('ROLE_TEACHER')) {
        if (teacherId === 'null') {
          setTimeout(() => navigate('/teacher/settings'), 1000);
        } else {
          setTimeout(() => navigate('/teacher'), 1000);
        }
      } else {
        if (studentId === 'null') {
          setTimeout(() => navigate('/student/settings'), 1000);
        } else {
          setTimeout(() => navigate('/student'), 1000);
        }
      }
    } catch (error) {
      console.error('[OAuth2Redirect] Lỗi xử lý token:', error);
      addToast('Có lỗi khi xử lý thông tin đăng nhập', 'error');
      navigate('/login');
    }
  }, [navigate, addToast, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-700">Đang xử lý đăng nhập từ Google...</p>
      </div>
    </div>
  );
};

export default OAuth2Redirect;
