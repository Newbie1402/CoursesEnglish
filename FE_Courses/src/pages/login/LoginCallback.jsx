import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/toast/Toast.jsx';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Modal from '@/components/ui/modal/Modal.jsx';

const LoginCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { setAuth } = useAuth();
  const [showTeacherModal, setShowTeacherModal] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const studentId = searchParams.get('studentId');
    const teacherId = searchParams.get('teacherId');
    console.log('[LoginCallback] token:', token);
    console.log('[LoginCallback] studentId:', studentId, 'teacherId:', teacherId);
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userId = decoded.UserId || decoded.userId || decoded.sub;
        const roles = decoded.roles || decoded.Roles || [];
        const role = roles[0] || null;
        console.log('[LoginCallback] userId:', userId, 'roles:', roles, 'role:', role);
        setAuth({
          token,
          userId,
          roles,
          role,
          studentId,
          teacherId
        });
        // Nếu là teacher và thiếu teacherId thì show modal
        if (roles.includes('ROLE_TEACHER') && teacherId === 'null') {
          setShowTeacherModal(true);
          console.log('[LoginCallback] Show teacher modal');
          return;
        }
        // Kiểm tra nếu thiếu thông tin studentId/teacherId (giữ logic cũ cho student)
        if (roles.includes('ROLE_STUDENT') && studentId === 'null') {
          addToast('Vui lòng cập nhật thông tin cá nhân để tiếp tục!', 'warning');
          setTimeout(() => navigate('/user/update-profile'), 1500);
          return;
        }
        // Điều hướng theo role
        if (roles.includes('ROLE_ADMIN')) {
          addToast('Đăng nhập thành công!', 'success');
          setTimeout(() => navigate('/admin'), 1000);
        } else if (roles.includes('ROLE_TEACHER')) {
          addToast('Đăng nhập thành công!', 'success');
          setTimeout(() => navigate('/teacher'), 1000);
        } else {
          addToast('Đăng nhập thành công!', 'success');
          setTimeout(() => navigate('/user'), 1000);
        }
      } catch (e) {
        addToast('Token không hợp lệ!', 'error');
        setTimeout(() => navigate('/login'), 1500);
      }
      return;
    }
    // Nếu không có token trên query, thử fetch lại endpoint hiện tại để lấy JSON
    fetch(window.location.href)
      .then(res => res.json())
      .then(data => {
        if (data.statusCode === 200 && data.data) {
          try {
            const decoded = jwtDecode(data.data);
            const userId = decoded.UserId || decoded.userId || decoded.sub;
            const roles = decoded.roles || decoded.Roles || [];
            setAuth({ token: data.data, userId, roles });
            if (roles.includes('ROLE_ADMIN')) {
              addToast('Đăng nhập thành công!', 'success');
              setTimeout(() => navigate('/admin'), 1000);
            } else if (roles.includes('ROLE_TEACHER')) {
              addToast('Đăng nhập thành công!', 'success');
              setTimeout(() => navigate('/teacher'), 1000);
            } else {
              addToast('Đăng nhập thành công!', 'success');
              setTimeout(() => navigate('/user'), 1000);
            }
          } catch (e) {
            addToast('Token không hợp lệ!', 'error');
            setTimeout(() => navigate('/login'), 1500);
          }
        } else {
          addToast(data.message || 'Đăng nhập thất bại!', 'error');
          setTimeout(() => navigate('/login'), 1500);
        }
      })
      .catch(() => {
        addToast('Đăng nhập thất bại!', 'error');
        setTimeout(() => navigate('/login'), 1500);
      });
  }, [location.search, navigate]);

  const handleCloseModal = () => {
    setShowTeacherModal(false);
    navigate('/teacher/settings');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-700">Đang xác thực đăng nhập Google...</p>
      </div>
      <Modal isOpen={showTeacherModal} onClose={handleCloseModal}>
        <h2 className="text-lg font-semibold mb-4">Cập nhật hồ sơ giảng viên</h2>
        <p className="text-gray-700 mb-4">Vui lòng cập nhật thông tin hồ sơ giảng viên để tiếp tục.</p>
        <div className="flex justify-end">
          <button
            onClick={handleCloseModal}
            className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors"
          >
            Cập nhật ngay
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default LoginCallback;
