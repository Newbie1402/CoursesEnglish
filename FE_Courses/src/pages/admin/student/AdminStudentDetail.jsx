import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentDetail } from '@/services/hooks/studentService';
import LoadingSpinner from '@/components/ui/loading/LoadingSpinner';
import {
  FaArrowLeft,
  FaUserGraduate,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaMale,
  FaFemale,
  FaUser,
  FaUsers,
  FaEdit,
  FaBook,
  FaChartLine,
  FaTrophy,
  FaClock
} from 'react-icons/fa';

const AdminStudentDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentDetail = async () => {
      try {
        setLoading(true);
        const response = await getStudentDetail(studentId);
        setStudent(response);
      } catch (error) {
        console.error('Error fetching student detail:', error);
        setError('Không thể tải thông tin học viên. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetail();
  }, [studentId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Không xác định';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getGenderIcon = (gender) => {
    switch (gender) {
      case 'MALE':
        return <FaMale className="w-5 h-5 text-blue-600" />;
      case 'FEMALE':
        return <FaFemale className="w-5 h-5 text-pink-600" />;
      default:
        return <FaUser className="w-5 h-5 text-gray-600" />;
    }
  };

  const getGenderText = (gender) => {
    switch (gender) {
      case 'MALE': return 'Nam';
      case 'FEMALE': return 'Nữ';
      default: return 'Không xác định';
    }
  };

  // Mock stats - có thể thay thế bằng API thực tế
  const mockStats = {
    coursesEnrolled: 3,
    completedCourses: 1,
    currentGPA: 8.5,
    attendanceRate: 92
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Đang tải thông tin học viên...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaUserGraduate className="w-12 h-12 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => navigate('/admin/students')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaUserGraduate className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy học viên</h3>
          <p className="text-gray-500 mb-6">Học viên với ID {studentId} không tồn tại trong hệ thống.</p>
          <button
            onClick={() => navigate('/admin/students')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <button
            onClick={() => navigate('/admin/students')}
            className="hover:text-blue-600 transition-colors"
          >
            Quản lý học viên
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">Chi tiết học viên</span>
        </div>
        <button
          onClick={() => navigate('/admin/students')}
          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <FaArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl overflow-hidden">
        <div className="px-8 py-12 text-white">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl font-bold">
              {student.fullName?.charAt(0) || 'S'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{student.fullName || 'Không có tên'}</h1>
              <div className="flex items-center space-x-4 text-white text-opacity-90">
                <div className="flex items-center space-x-2">
                  <FaUserGraduate className="w-4 h-4" />
                  <span>Học viên</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getGenderIcon(student.gender)}
                  <span>{getGenderText(student.gender)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                    ID: {student.studentId}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                <FaEdit className="w-4 h-4" />
                <span>Chỉnh sửa</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaBook className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Khóa học đăng ký</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{mockStats.coursesEnrolled}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FaTrophy className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Khóa học hoàn thành</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{mockStats.completedCourses}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FaChartLine className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Điểm trung bình</h3>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{mockStats.currentGPA}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaClock className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Tỷ lệ tham gia</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">{mockStats.attendanceRate}%</p>
        </div>
      </div>

      {/* Information Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
            <h2 className="text-lg font-semibold text-blue-900 flex items-center space-x-2">
              <FaUser className="w-5 h-5" />
              <span>Thông tin cá nhân</span>
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <FaEnvelope className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{student.email || 'Không có email'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <FaPhone className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Số điện thoại</p>
                <p className="font-medium text-gray-900">{student.phoneNumber || 'Không có'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày sinh</p>
                <p className="font-medium text-gray-900">{formatDate(student.dateOfBirth)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <FaMapMarkerAlt className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Địa chỉ</p>
                <p className="font-medium text-gray-900">{student.address || 'Không có'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Family Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
            <h2 className="text-lg font-semibold text-green-900 flex items-center space-x-2">
              <FaUsers className="w-5 h-5" />
              <span>Thông tin gia đình</span>
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Father Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Thông tin cha</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaUser className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Họ tên</p>
                    <p className="font-medium text-gray-900">{student.fatherName || 'Không có'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaPhone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p className="font-medium text-gray-900">{student.fatherPhone || 'Không có'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mother Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Thông tin mẹ</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                    <FaUser className="w-4 h-4 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Họ tên</p>
                    <p className="font-medium text-gray-900">{student.motherName || 'Không có'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                    <FaPhone className="w-4 h-4 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p className="font-medium text-gray-900">{student.motherPhone || 'Không có'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      {student.application && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200">
            <h2 className="text-lg font-semibold text-purple-900">Đơn đăng ký</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed">{student.application}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <FaEdit className="w-4 h-4" />
          <span>Chỉnh sửa thông tin</span>
        </button>
      </div>
    </div>
  );
};

export default AdminStudentDetail;
