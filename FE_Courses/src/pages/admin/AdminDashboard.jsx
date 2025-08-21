import React from 'react';

const AdminDashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Thống kê tổng quan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-3xl font-bold text-blue-600">120</span>
          <span className="text-gray-600 mt-2">Người dùng</span>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-3xl font-bold text-green-600">15</span>
          <span className="text-gray-600 mt-2">Khóa học</span>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-3xl font-bold text-yellow-600">32</span>
          <span className="text-gray-600 mt-2">Bài kiểm tra</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

