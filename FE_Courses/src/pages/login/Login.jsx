import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/toast/Toast.jsx';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = React.useState(false);

  // Lắng nghe message từ popup (nếu BE hỗ trợ postMessage)
  React.useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== BASE_URL) return;
      const { token, error } = event.data || {};
      if (token) {
        localStorage.setItem('token', token);
        addToast('Đăng nhập thành công!', 'success');
        navigate('/');
      } else if (error) {
        addToast(error, 'error');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addToast, navigate]);

  const handleLoginWithGoogle = () => {
    setLoading(true);
    // Chuyển hướng sang BE để đăng nhập Google, BE sẽ redirect về FE /login/callback
    window.location.href = `${BASE_URL}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-8">
        <div className="flex flex-col items-center gap-2">
          <img src="/vite.svg" alt="Logo" className="w-16 h-16" />
          <h1 className="text-2xl font-bold text-gray-900">Đăng nhập vào hệ thống</h1>
        </div>
        <button
          onClick={handleLoginWithGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 transition text-base font-medium shadow-sm disabled:opacity-60"
        >
          <FcGoogle className="w-6 h-6" />
          Đăng nhập với Google
        </button>
        <p className="text-center text-gray-500 text-sm">Chỉ dành cho tài khoản đã được duyệt</p>
      </div>
    </div>
  );
};

export default Login;