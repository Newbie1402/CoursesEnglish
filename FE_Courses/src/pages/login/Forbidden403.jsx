import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBan } from 'react-icons/fa';

const Forbidden403 = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <FaBan className="text-red-500 w-20 h-20 mb-6" />
      <h1 className="text-4xl font-bold text-gray-800 mb-2">403 - Không có quyền truy cập</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn nghĩ đây là lỗi.
      </p>
      <button
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        onClick={() => navigate('/')}
      >
        Quay về trang chủ
      </button>
    </div>
  );
};

export default Forbidden403;

