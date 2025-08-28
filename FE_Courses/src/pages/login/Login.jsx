import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/toast/Toast.jsx';
import {
  FaGraduationCap,
  FaUsers,
  FaBook,
  FaChartLine,
  FaShieldAlt,
  FaSpinner,
  FaCheckCircle,
  FaLaptop,
  FaClock
} from 'react-icons/fa';

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
        setLoading(false);
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

  const features = [
    {
      icon: <FaBook className="w-5 h-5 text-blue-500" />,
      title: "Quản lý khóa học",
      description: "Tạo và quản lý khóa học một cách dễ dàng"
    },
    {
      icon: <FaUsers className="w-5 h-5 text-green-500" />,
      title: "Tương tác học viên",
      description: "Kết nối giảng viên và học viên hiệu quả"
    },
    {
      icon: <FaChartLine className="w-5 h-5 text-purple-500" />,
      title: "Theo dõi tiến độ",
      description: "Thống kê và báo cáo chi tiết"
    }
  ];

  const stats = [
    { number: "500+", label: "Khóa học", icon: <FaBook className="w-4 h-4" /> },
    { number: "1000+", label: "Học viên", icon: <FaUsers className="w-4 h-4" /> },
    { number: "50+", label: "Giảng viên", icon: <FaGraduationCap className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Hero Section - Left Side */}
      <div className="flex-1 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white bg-opacity-10 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white bg-opacity-5 rounded-full translate-y-32 -translate-x-32"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white bg-opacity-10 rounded-full"></div>

        <div className="relative z-10 flex flex-col justify-center h-full p-8 lg:p-12">
          <div className="max-w-lg">
            {/* Logo and Brand */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <FaGraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">EduManage</h1>
                <p className="text-blue-100 text-sm">Hệ thống quản lý học tập</p>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="mb-8">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Chào mừng bạn đến với
                <span className="block text-blue-200">nền tảng học tập hiện đại</span>
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed">
                Quản lý khóa học, theo dõi tiến độ học tập và kết nối cộng đồng học viên một cách dễ dàng và hiệu quả.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 group">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:bg-opacity-30 transition-all duration-200">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{feature.title}</h3>
                    <p className="text-blue-100 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.number}</div>
                  <div className="text-blue-100 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Login Section - Right Side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaShieldAlt className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng nhập</h2>
              <p className="text-gray-600">Truy cập vào hệ thống quản lý học tập</p>
            </div>

            {/* Login Button */}
            <div className="space-y-4">
              <button
                onClick={handleLoginWithGoogle}
                disabled={loading}
                className="w-full relative group overflow-hidden bg-white border-2 border-gray-200 rounded-xl py-4 px-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-3">
                  {loading ? (
                    <FaSpinner className="w-6 h-6 text-blue-500 animate-spin" />
                  ) : (
                    <FcGoogle className="w-6 h-6" />
                  )}
                  <span className="text-gray-700 font-semibold text-lg">
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập với Google'}
                  </span>
                </div>
              </button>
            </div>

            {/* Security Info */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaCheckCircle className="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <h4 className="text-green-800 font-medium text-sm mb-1">Bảo mật cao</h4>
                  <p className="text-green-700 text-xs leading-relaxed">
                    Chỉ dành cho tài khoản đã được xác thực và phê duyệt bởi quản trị viên hệ thống.
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="border-t border-gray-100 pt-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="group">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-100 transition-colors duration-200">
                    <FaLaptop className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-xs text-gray-600">Học trực tuyến</p>
                </div>
                <div className="group">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-purple-100 transition-colors duration-200">
                    <FaClock className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className="text-xs text-gray-600">24/7 Support</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Bằng việc đăng nhập, bạn đồng ý với{' '}
                <a href="#" className="text-blue-500 hover:underline">Điều khoản sử dụng</a>
                {' '}và{' '}
                <a href="#" className="text-blue-500 hover:underline">Chính sách bảo mật</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
