import React, { useState } from 'react';
import {
  FaTimes,
  FaUserPlus,
  FaEnvelope,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner
} from 'react-icons/fa';
import { verifyAccount, sendMail } from '@/services/hooks/adminService';

const AddUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'STUDENT'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.role) {
      newErrors.role = 'Vui lòng chọn vai trò';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle role selection
  const handleRoleSelect = (role) => {
    setFormData(prev => ({
      ...prev,
      role
    }));

    if (errors.role) {
      setErrors(prev => ({
        ...prev,
        role: ''
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Step 1: Verify account
      await verifyAccount(formData.email, [formData.role]);

      // Step 2: Send notification email
      await sendMail(formData.email);

      // Success notification
      onSuccess(`Đã duyệt thành công tài khoản ${formData.role === 'STUDENT' ? 'học viên' : 'giảng viên'} và gửi email thông báo!`, 'success');

      // Reset form and close modal
      handleClose();

    } catch (error) {
      console.error('Error verifying account:', error);
      onSuccess('Duyệt tài khoản thất bại! Vui lòng thử lại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setFormData({ email: '', role: 'STUDENT' });
    setErrors({});
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <FaUserPlus className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">Duyệt người dùng mới</h2>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center hover:bg-opacity-30 transition-colors disabled:opacity-50"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email người dùng
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Nhập email người dùng cần duyệt..."
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FaTimesCircle className="w-3 h-3 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Vai trò
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Student Role */}
              <div
                onClick={() => handleRoleSelect('STUDENT')}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all relative ${
                  formData.role === 'STUDENT'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } ${loading ? 'pointer-events-none opacity-50' : ''}`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center justify-between w-full">
                    <div></div> {/* Spacer */}
                    {formData.role === 'STUDENT' && (
                      <FaCheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    formData.role === 'STUDENT' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <FaUserGraduate className={`w-6 h-6 ${
                      formData.role === 'STUDENT' ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <span className={`font-medium ${
                    formData.role === 'STUDENT' ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    Học viên
                  </span>
                  <span className="text-xs text-gray-500 text-center">
                    Tham gia khóa học và làm bài tập
                  </span>
                </div>
              </div>

              {/* Teacher Role */}
              <div
                onClick={() => handleRoleSelect('TEACHER')}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all relative ${
                  formData.role === 'TEACHER'
                    ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } ${loading ? 'pointer-events-none opacity-50' : ''}`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center justify-between w-full">
                    <div></div> {/* Spacer */}
                    {formData.role === 'TEACHER' && (
                      <FaCheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    formData.role === 'TEACHER' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <FaChalkboardTeacher className={`w-6 h-6 ${
                      formData.role === 'TEACHER' ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <span className={`font-medium ${
                    formData.role === 'TEACHER' ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    Giảng viên
                  </span>
                  <span className="text-xs text-gray-500 text-center">
                    Tạo và quản lý khóa học
                  </span>
                </div>
              </div>
            </div>
            {errors.role && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <FaTimesCircle className="w-3 h-3 mr-1" />
                {errors.role}
              </p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FaCheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Quy trình duyệt tài khoản:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Xác thực email và vai trò người dùng</li>
                  <li>• Kích hoạt tài khoản trong hệ thống</li>
                  <li>• Gửi email thông báo tài khoản đã được duyệt</li>
                </ul>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.email.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <FaUserPlus className="w-4 h-4" />
                  <span>Duyệt tài khoản</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
