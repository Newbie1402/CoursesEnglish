import React, { useEffect, useState } from 'react';
import { getAllCourses } from '@/services/hooks/adminService.js';
import { getProgress } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/loading/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaFilter,
  FaSort,
  FaGraduationCap,
  FaCalendarAlt,
  FaUsers,
  FaBook,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaChevronRight,
  FaPlus
} from 'react-icons/fa';

const AdminCourseList = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getAllCourses();
        setCourses(response);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter và search logic
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'active' && course.active) ||
                         (filterStatus === 'inactive' && !course.active);
    return matchesSearch && matchesFilter;
  });

  // Sort logic
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.startDate) - new Date(a.startDate);
      case 'oldest':
        return new Date(a.startDate) - new Date(b.startDate);
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  // Toast function
  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'error' });
    }, 3000);
  };

  const handleCourseClick = (course) => {
    // Kiểm tra nếu khóa học đã bị xóa (active = false)
    if (!course.active) {
      showToast('Khóa học này đã bị xóa', 'error');
      return;
    }

    // Nếu khóa học còn hoạt động thì navigate bình thường
    navigate(`/admin/courses/${course.courseId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const CourseCard = ({ course }) => {
    const progress = getProgress(course.startDate, course.endDate);

    return (
      <div
        onClick={() => handleCourseClick(course)}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer group overflow-hidden"
      >
        {/* Header với gradient */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2"></div>

        <div className="p-6">
          {/* Title và Status */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {course.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {course.description}
              </p>
            </div>
            <div className="ml-4 flex flex-col items-end space-y-2">
              {course.active ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <FaCheckCircle className="w-3 h-3 mr-1" />
                  Hoạt động
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <FaTimesCircle className="w-3 h-3 mr-1" />
                  Tạm dừng
                </span>
              )}
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                ID: {course.courseId}
              </span>
            </div>
          </div>

          {/* Thông tin chi tiết */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Bắt đầu</p>
                <p className="text-sm font-medium">{formatDate(course.startDate)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaGraduationCap className="w-3 h-3 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Kết thúc</p>
                <p className="text-sm font-medium">{formatDate(course.endDate)}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Tiến độ khóa học</span>
              <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center space-x-1">
                <FaBook className="w-3 h-3" />
                <span>{course.online ? 'Online' : 'Offline'}</span>
              </span>
              <span className="flex items-center space-x-1">
                <FaUsers className="w-3 h-3" />
                <span>Giảng viên: {course.teacherId}</span>
              </span>
            </div>
            <div className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
              <FaEye className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">Xem chi tiết</span>
              <FaChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-200 h-2 animate-pulse"></div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
              <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-2 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <FaGraduationCap className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {searchTerm || filterStatus !== 'all' ? 'Không tìm thấy khóa học' : 'Chưa có khóa học nào'}
      </h3>
      <p className="text-gray-500 mb-6">
        {searchTerm || filterStatus !== 'all'
          ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
          : 'Bắt đầu tạo khóa học đầu tiên cho hệ thống'
        }
      </p>
      {(!searchTerm && filterStatus === 'all') && (
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <FaPlus className="w-4 h-4 mr-2" />
          Tạo khóa học mới
        </button>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 bg-red-500 text-white">
          <div className="flex items-center space-x-2">
            <FaTimesCircle className="w-5 h-5" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý khóa học</h1>
          <p className="text-gray-600 mt-1">
            Tổng cộng {courses.length} khóa học • {filteredCourses.length} đang hiển thị
          </p>
        </div>
        <button
            onClick={() => navigate('/admin/courses/new')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
          <FaPlus className="w-4 h-4 mr-2" />
          Tạo khóa học mới
        </button>
      </div>

      {/* Search và Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học theo tên hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400 w-4 h-4" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Tạm dừng</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <FaSort className="text-gray-400 w-4 h-4" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="title">Theo tên A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || filterStatus !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">Bộ lọc đang áp dụng:</span>
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Tìm kiếm: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filterStatus !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Trạng thái: {filterStatus === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                <button
                  onClick={() => setFilterStatus('all')}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Course Grid */}
      {loading ? (
        <LoadingSkeleton />
      ) : sortedCourses.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCourses.map((course) => (
            <CourseCard key={course.courseId} course={course} />
          ))}
        </div>
      )}

      {/* Results Info */}
      {!loading && sortedCourses.length > 0 && (
        <div className="flex justify-center mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-6 py-3">
            <p className="text-sm text-gray-600">
              Hiển thị {sortedCourses.length} trong tổng số {courses.length} khóa học
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourseList;
