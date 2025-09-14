import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllExams } from '@/services/hooks/adminService.js';
import {
  FaSearch,
  FaFilter,
  FaSort,
  FaClipboardList,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaChevronRight,
  FaPlus,
  FaChevronDown,
  FaQuestionCircle,
  FaTasks
} from 'react-icons/fa';

const AdminExamList = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getAllExams();
        setExams(Array.isArray(response) ? response : []);
      } catch (err) {
        console.error('Error fetching exams:', err);
        setError('Không thể tải danh sách bài kiểm tra. Vui lòng thử lại.');
        setExams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

    const getExamStatus = (exam) => {
        const now = new Date();
        const startTime = new Date(exam.startTime);
        const endTime = new Date(exam.endTime);

        if (now < startTime) return 'upcoming';
        if (now >= startTime && now <= endTime) return 'ongoing';
        return 'completed';
    };

  // Filter và search logic
  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam?.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam?.courseId?.toString().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || exam?.type === filterType;
    const matchesStatus = filterStatus === 'all' || getExamStatus(exam) === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Sort logic
  const sortedExams = [...filteredExams].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.startTime) - new Date(a.startTime);
      case 'oldest':
        return new Date(a.startTime) - new Date(b.startTime);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'duration':
        return b.durationMinutes - a.durationMinutes;
      default:
        return 0;
    }
  });

  // Get unique exam types for filter
  const examTypes = [...new Set(exams.map(exam => exam.type).filter(Boolean))];

  // Calculate stats
  const stats = useMemo(() => ({
    total: exams.length,
    upcoming: exams.filter(exam => getExamStatus(exam) === 'upcoming').length,
    ongoing: exams.filter(exam => getExamStatus(exam) === 'ongoing').length,
    completed: exams.filter(exam => getExamStatus(exam) === 'completed').length,
    types: examTypes.length
  }), [exams]);

  // Helper functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'upcoming':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <FaClock className="w-3 h-3 mr-1" />
            Sắp diễn ra
          </span>
        );
      case 'ongoing':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="w-3 h-3 mr-1" />
            Đang diễn ra
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <FaTimesCircle className="w-3 h-3 mr-1" />
            Đã kết thúc
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'quiz':
        return <FaQuestionCircle className="w-4 h-4 text-purple-600" />;
      case 'midterm':
        return <FaTasks className="w-4 h-4 text-orange-600" />;
      case 'final':
        return <FaClipboardList className="w-4 h-4 text-red-600" />;
      default:
        return <FaClipboardList className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTypeText = (type) => {
    switch (type?.toLowerCase()) {
      case 'quiz': return 'Kiểm tra';
      case 'midterm': return 'Giữa kỳ';
      case 'final': return 'Cuối kỳ';
      default: return type || 'Không xác định';
    }
  };

  // Toast function
  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'error' });
    }, 3000);
  };

  const handleExamClick = (examId) => {
    navigate(`/admin/exams/${examId}`);
  };

  const ExamCard = ({ exam }) => {
    const status = getExamStatus(exam);

    return (
      <div
        onClick={() => handleExamClick(exam.examId)}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer group overflow-hidden"
      >
        {/* Header với gradient theo status */}
        <div className={`h-2 ${
          status === 'upcoming' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
          status === 'ongoing' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
          'bg-gradient-to-r from-gray-400 to-gray-600'
        }`}></div>

        <div className="p-6">
          {/* Title và Status */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {exam.title}
              </h3>
              <div className="flex items-center space-x-2 mb-2">
                {getTypeIcon(exam.type === "WRITING" ? "Tự luận" : "Trắc nghiệm")}
                <span className="text-sm font-medium text-gray-700">
                  {getTypeText(exam.type === "WRITING" ? "Tự luận" : "Trắc nghiệm")}
                </span>
              </div>
            </div>
            <div className="ml-4">
              {getStatusBadge(status)}
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
                <p className="text-sm font-medium">{formatDate(exam.startTime)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaClock className="w-3 h-3 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Kết thúc</p>
                <p className="text-sm font-medium">{formatDate(exam.endTime)}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar cho ongoing exams */}
          {status === 'ongoing' && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Thời gian còn lại</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
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
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              </div>
              <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <FaClipboardList className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {searchTerm || filterType !== 'all' || filterStatus !== 'all' ? 'Không tìm thấy bài kiểm tra' : 'Chưa có bài kiểm tra nào'}
      </h3>
      <p className="text-gray-500 mb-6">
        {searchTerm || filterType !== 'all' || filterStatus !== 'all'
          ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
          : 'Không có bài kiểm tra nào phù hợp'
        }
      </p>
      {(!searchTerm && filterType === 'all' && filterStatus === 'all') && (
        <span
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Chưa có bài kiểm tra nào được tạo
        </span>
      )}
    </div>
  );

  const ErrorState = () => (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <FaClipboardList className="w-12 h-12 text-red-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
      <p className="text-gray-500 mb-6">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Thử lại
      </button>
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý bài kiểm tra</h1>
          <p className="text-gray-600 mt-1">
            Tổng cộng {stats.total} bài kiểm tra • {filteredExams.length} đang hiển thị
          </p>
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Tổng bài kiểm tra</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FaClock className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Sắp diễn ra</h3>
          </div>
          <p className="text-3xl font-bold text-orange-600">{stats.upcoming}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Đang diễn ra</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.ongoing}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FaTimesCircle className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Đã kết thúc</h3>
          </div>
          <p className="text-3xl font-bold text-gray-600">{stats.completed}</p>
        </div>
      </div>

      {/* Search và Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm bài kiểm tra theo tên, loại hoặc khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400 w-4 h-4" />
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[130px] cursor-pointer"
                  style={{
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    backgroundImage: 'none',
                    outline: 'none'
                  }}
                >
                  <option value="all">Tất cả loại</option>
                  {examTypes.map((type) => (
                    <option key={type} value={type}>{getTypeText(type)}</option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none z-10" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[140px] cursor-pointer"
                  style={{
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    backgroundImage: 'none',
                    outline: 'none'
                  }}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="upcoming">Sắp diễn ra</option>
                  <option value="ongoing">Đang diễn ra</option>
                  <option value="completed">Đã kết thúc</option>
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none z-10" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <FaSort className="text-gray-400 w-4 h-4" />
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[120px] cursor-pointer"
                  style={{
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    backgroundImage: 'none',
                    outline: 'none'
                  }}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="title">Theo tên A-Z</option>
                  <option value="duration">Thời lượng</option>
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none z-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || filterType !== 'all' || filterStatus !== 'all') && (
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
            {filterType !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Loại: {getTypeText(filterType)}
                <button
                  onClick={() => setFilterType('all')}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {filterStatus !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                Trạng thái: {filterStatus === 'upcoming' ? 'Sắp diễn ra' : filterStatus === 'ongoing' ? 'Đang diễn ra' : 'Đã kết thúc'}
                <button
                  onClick={() => setFilterStatus('all')}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Exam Grid */}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState />
      ) : sortedExams.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedExams.map((exam) => (
            <ExamCard key={exam.examId} exam={exam} />
          ))}
        </div>
      )}

      {/* Results Info */}
      {!loading && !error && sortedExams.length > 0 && (
        <div className="flex justify-center mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-6 py-3">
            <p className="text-sm text-gray-600">
              Hiển thị {sortedExams.length} trong tổng số {exams.length} bài kiểm tra
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExamList;
