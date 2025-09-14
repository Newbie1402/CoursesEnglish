import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTeacherDetails, countStudents } from '@/services/hooks/teacherService';
import { getCourseOfTeacher } from '@/services/hooks/courseService';
import LoadingSpinner from '@/components/ui/loading/LoadingSpinner';
import {
  FaArrowLeft,
  FaChalkboardTeacher,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaMale,
  FaFemale,
  FaUser,
  FaGraduationCap,
  FaBook,
  FaChartLine,
  FaClock,
  FaBriefcase
} from 'react-icons/fa';

const AdminTeacherDetail = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    coursesTeaching: 0,
    totalStudents: 0,
    coursesCompleted: 0,
  });

  useEffect(() => {
    const fetchTeacherDetail = async () => {
      try {
        setLoading(true);
        const response = await getTeacherDetails(teacherId);
        setTeacher(response.data);
      } catch (error) {
        console.error('Error fetching teacher detail:', error);
        setError('Không thể tải thông tin giảng viên. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherDetail();
  }, [teacherId]);

  // Lấy danh sách khóa học của giảng viên và tính toán số liệu thống kê
  useEffect(() => {
    const fetchTeacherCourses = async () => {
      try {
        const raw = await getCourseOfTeacher(teacherId);
        const courses = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        const now = new Date();
        const coursesCompleted = courses.filter(c => c?.endDate && new Date(c.endDate) < now).length;
        const coursesTeaching = courses.filter(c => !c?.endDate || new Date(c.endDate) >= now).length;
        setStats(prev => ({ ...prev, coursesTeaching, coursesCompleted }));
      } catch (e) {
        console.error('Error fetching courses for teacher:', e);
      }
    };
    if (teacherId) fetchTeacherCourses();
  }, [teacherId]);

  // Lấy tổng số học viên của giảng viên qua API countStudents
  useEffect(() => {
    const fetchTotalStudents = async () => {
      try {
        const total = await countStudents(teacherId);
        const safeTotal = typeof total === 'number' ? total : (total?.studentCount ?? 0);
        setStats(prev => ({ ...prev, totalStudents: safeTotal }));
      } catch (e) {
        console.error('Error counting students for teacher:', e);
      }
    };
    if (teacherId) fetchTotalStudents();
  }, [teacherId]);

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

  const getExperienceLevel = (years) => {
    if (!years || years === 0) return { text: 'Mới bắt đầu', color: 'gray' };
    if (years < 2) return { text: 'Fresher', color: 'blue' };
    if (years < 5) return { text: 'Junior', color: 'green' };
    if (years < 10) return { text: 'Senior', color: 'orange' };
    return { text: 'Expert', color: 'purple' };
  };

  // Số liệu thống kê đã chuẩn hóa (coursesTeaching, coursesCompleted lấy từ API khóa học của GV)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Đang tải thông tin giảng viên...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaChalkboardTeacher className="w-12 h-12 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => navigate('/admin/teachers')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaChalkboardTeacher className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy giảng viên</h3>
          <p className="text-gray-500 mb-6">Giảng viên với ID {teacherId} không tồn tại trong hệ thống.</p>
          <button
            onClick={() => navigate('/admin/teachers')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const experienceLevel = getExperienceLevel(teacher.experienceYears);

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <button
            onClick={() => navigate('/admin/teachers')}
            className="hover:text-blue-600 transition-colors"
          >
            Quản lý giảng viên
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">Chi tiết giảng viên</span>
        </div>
        <button
          onClick={() => navigate('/admin/teachers')}
          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <FaArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl overflow-hidden">
        <div className="px-8 py-12 text-white">
          <div className="flex items-center space-x-6">
            {teacher.avatarUrl ? (
              <img
                src={teacher.avatarUrl}
                alt={teacher.fullName || 'Teacher avatar'}
                className="w-24 h-24 rounded-full object-cover ring-2 ring-white/30"
              />
            ) : (
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl font-bold">
                {teacher.fullName?.charAt(0) || 'T'}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{teacher.fullName || 'Không có tên'}</h1>
              <div className="flex items-center space-x-4 text-white text-opacity-90 mb-3">
                <div className="flex items-center space-x-2">
                  <FaChalkboardTeacher className="w-4 h-4" />
                  <span>Giảng viên</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getGenderIcon(teacher.gender)}
                  <span>{getGenderText(teacher.gender)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                    ID: {teacher.teacherId}
                  </span>
                </div>
              </div>
              {teacher.specialization && (
                <div className="flex items-center space-x-2">
                  <FaGraduationCap className="w-4 h-4" />
                  <span className="text-lg">{teacher.specialization}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaBook className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Khóa học đang dạy</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.coursesTeaching}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FaUser className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Tổng học viên</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.totalStudents}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaChartLine className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Khóa học hoàn thành</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">{stats.coursesCompleted}</p>
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
                <p className="font-medium text-gray-900">{teacher.email || 'Không có email'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <FaPhone className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Số điện thoại</p>
                <p className="font-medium text-gray-900">{teacher.phoneNumber || 'Không có'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày sinh</p>
                <p className="font-medium text-gray-900">{formatDate(teacher.dateOfBirth)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <FaMapMarkerAlt className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Địa chỉ</p>
                <p className="font-medium text-gray-900">{teacher.address || 'Không có'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200">
            <h2 className="text-lg font-semibold text-purple-900 flex items-center space-x-2">
              <FaBriefcase className="w-5 h-5" />
              <span>Thông tin nghề nghiệp</span>
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaGraduationCap className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Chuyên môn</p>
                <p className="font-medium text-gray-900">{teacher.specialization || 'Không xác định'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <FaClock className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Kinh nghiệm</p>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900">
                    {teacher.experienceYears ? `${teacher.experienceYears} năm` : 'Chưa xác định'}
                  </p>
                  {teacher.experienceYears && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${experienceLevel.color}-100 text-${experienceLevel.color}-800`}>
                      {experienceLevel.text}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaUser className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Mã giảng viên</p>
                <p className="font-medium text-gray-900">GV{teacher.teacherId.toString().padStart(4, '0')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Biography Section */}
      {teacher.bio && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
            <h2 className="text-lg font-semibold text-green-900">Tiểu sử nghề nghiệp</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{teacher.bio}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeacherDetail;
