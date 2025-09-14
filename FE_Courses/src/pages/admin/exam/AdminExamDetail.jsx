import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaSearch,
  FaFilter,
  FaUsers,
  FaUserGraduate,
  FaClipboardList,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaEnvelope,
  FaPhone,
  FaChevronDown,
  FaExclamationTriangle,
  FaMedal,
  FaEye
} from 'react-icons/fa';
import { getAllExams, getStudentOfCourse } from '@/services/hooks/adminService';
import { getSubmissionsList, notAttempts } from '@/services/hooks/submissionService';

const AdminExamDetail = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  // States
  const [exam, setExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [notAttemptedStudents, setNotAttemptedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Lấy thông tin exam chi tiết
        const examsResponse = await getAllExams();
        const examDetail = examsResponse.find(e => e.examId.toString() === examId);

        if (!examDetail) {
          setError('Không tìm thấy bài kiểm tra');
          return;
        }

        setExam(examDetail);

        // Lấy danh sách submissions, students và notAttempts song song
        const [submissionsResponse, studentsResponse, notAttemptedResponse] = await Promise.all([
          getSubmissionsList(examId),
          getStudentOfCourse(examDetail.courseId),
          notAttempts(examId)
        ]);

        // Xử lý submissions response với cấu trúc mới
        let submissionsData = [];
        if (submissionsResponse && submissionsResponse.data && Array.isArray(submissionsResponse.data)) {
          submissionsData = submissionsResponse.data;
        } else if (Array.isArray(submissionsResponse)) {
          // Fallback cho format cũ
          submissionsData = submissionsResponse;
        }

        // Xử lý notAttempts response với cấu trúc mới
        let notAttemptedData = [];
        if (notAttemptedResponse && notAttemptedResponse.data && Array.isArray(notAttemptedResponse.data)) {
          notAttemptedData = notAttemptedResponse.data;
        } else if (Array.isArray(notAttemptedResponse)) {
          // Fallback cho format cũ
          notAttemptedData = notAttemptedResponse;
        }

        setSubmissions(submissionsData);
        setStudents(Array.isArray(studentsResponse) ? studentsResponse : []);
        setNotAttemptedStudents(notAttemptedData);

      } catch (err) {
        console.error('Error fetching exam detail:', err);
        setError('Không thể tải dữ liệu bài kiểm tra. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchData();
    }
  }, [examId]);

  // Helper functions
  const getStudentStatus = (student) => {
    // Kiểm tra xem học viên có trong danh sách chưa làm bài từ API không
    const isNotAttempted = notAttemptedStudents.some(notAttemptedStudent =>
      notAttemptedStudent.id === student.studentId ||
      notAttemptedStudent.email === student.email
    );

    if (isNotAttempted) {
      return 'not_started';
    }

    // Kiểm tra submission với cả string và number comparison
    const submission = submissions.find(s =>
      s.studentId === student.id ||
      s.studentId === parseInt(student.id) ||
      s.studentId === student.id.toString()
    );

    if (!submission) {
      return 'in_progress';
    }

    // Có submission - kiểm tra trạng thái nộp bài
    if (submission.submittedAt === null) {
      return 'in_progress';
    }

    const submittedTime = new Date(submission.submittedAt);
    const deadline = new Date(submission.deadline);
    const isOnTime = submittedTime <= deadline;

    return isOnTime ? 'submitted_on_time' : 'submitted_late';
  };

  const getSubmissionData = (student) => {
    return submissions.find(s =>
      s.studentId === student.id ||
      s.studentId === parseInt(student.id) ||
      s.studentId === student.id?.toString()
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không xác định';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status, submissionData = null) => {
    switch (status) {
      case 'not_started':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <FaTimesCircle className="w-3 h-3 mr-1" />
            Chưa làm bài
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FaHourglassHalf className="w-3 h-3 mr-1" />
            Đang làm bài
          </span>
        );
      case 'submitted_on_time':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="w-3 h-3 mr-1" />
            Đã nộp đúng hạn
          </span>
        );
      case 'submitted_late':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaExclamationTriangle className="w-3 h-3 mr-1" />
            Nộp trễ hạn
          </span>
        );
      default:
        return null;
    }
  };

  // Filter students based on search and status
  const filteredStudents = students.filter(student => {
    const matchesSearch = student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'all') return true;
    return getStudentStatus(student) === filterStatus;
  });

  // Calculate stats
  const stats = useMemo(() => {
    const statusCounts = students.reduce((acc, student) => {
      const status = getStudentStatus(student);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return {
      total: students.length,
      notStarted: statusCounts.not_started || 0,
      inProgress: statusCounts.in_progress || 0,
      submittedOnTime: statusCounts.submitted_on_time || 0,
      submittedLate: statusCounts.submitted_late || 0
    };
  }, [students, submissions, notAttemptedStudents]);

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'error' });
    }, 3000);
  };

  const StudentCard = ({ student }) => {
    const status = getStudentStatus(student);
    const submissionData = getSubmissionData(student);

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {student.fullName?.charAt(0) || 'S'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{student.fullName}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <FaUserGraduate className="w-3 h-3 text-blue-600" />
                  <span className="text-sm text-gray-600">Học viên</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              {getStatusBadge(status, submissionData)}
              <p className="text-xs text-gray-500 mt-1">ID: {student.studentId}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FaEnvelope className="w-3 h-3 text-gray-400" />
              <span className="truncate">{student.email}</span>
            </div>
            {student.phoneNumber && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FaPhone className="w-3 h-3 text-gray-400" />
                <span>{student.phoneNumber}</span>
              </div>
            )}
          </div>

          {/* Submission Details */}
          {submissionData && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin nộp bài</h4>
              <div className="space-y-1 text-xs text-gray-600">
                {submissionData.startedAt && (
                  <div>Bắt đầu: {formatDate(submissionData.startedAt)}</div>
                )}
                {submissionData.submittedAt && (
                  <div>Nộp bài: {formatDate(submissionData.submittedAt)}</div>
                )}
                <div>Hạn nộp: {formatDate(submissionData.deadline)}</div>
                {submissionData.score !== undefined && (
                  <div className="flex items-center space-x-1 pt-1">
                    <FaMedal className="w-3 h-3 text-yellow-500" />
                    <span className="font-medium">
                      Điểm: {submissionData.score}/{submissionData.maxScore}
                    </span>
                  </div>
                )}
              </div>
              {submissionData.teacherFeedback && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-700">
                    <strong>Nhận xét:</strong> {submissionData.teacherFeedback}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              {status === 'not_started' && 'Chưa bắt đầu làm bài'}
              {status === 'in_progress' && 'Đang thực hiện bài kiểm tra'}
              {status === 'submitted_on_time' && 'Hoàn thành đúng hạn'}
              {status === 'submitted_late' && 'Nộp bài muộn'}
            </div>
            {submissionData ? (
              <button
                onClick={() => navigate(`/admin/submissions/${submissionData.id}`)}
                className="inline-flex items-center px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FaEye className="w-3 h-3 mr-1" />
                Chi tiết
              </button>
            ) : (
              <span className="inline-flex items-center px-3 py-1.5 text-xs bg-gray-50 text-gray-400 rounded-lg cursor-not-allowed">
                <FaEye className="w-3 h-3 mr-1" />
                Không có dữ liệu
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <FaUsers className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {searchTerm || filterStatus !== 'all' ? 'Không tìm thấy học viên' : 'Chưa có học viên nào'}
      </h3>
      <p className="text-gray-500">
        {searchTerm || filterStatus !== 'all'
          ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
          : 'Chưa có học viên nào đăng ký khóa học này'
        }
      </p>
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

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState />;

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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </button>
          <div className="h-6 border-l border-gray-300"></div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{exam?.title}</h1>
            <p className="text-gray-600 mt-1">Chi tiết bài kiểm tra và trạng thái nộp bài</p>
          </div>
        </div>

        {/* Exam Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <FaCalendarAlt className="w-4 h-4 text-blue-600" />
            <span className="text-sm">
              <strong>Thời gian:</strong> {formatDate(exam?.startTime)} - {formatDate(exam?.endTime)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FaClock className="w-4 h-4 text-purple-600" />
            <span className="text-sm">
              <strong>Thời lượng:</strong> {exam?.durationMinutes} phút
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FaClipboardList className="w-4 h-4 text-green-600" />
            <span className="text-sm">
              <strong>Loại:</strong> {exam?.type}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaUsers className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Tổng học viên</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FaTimesCircle className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Chưa làm bài</h3>
          </div>
          <p className="text-3xl font-bold text-gray-600">{stats.notStarted}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Đã nộp đúng hạn</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.submittedOnTime}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FaExclamationTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Nộp trễ hạn</h3>
          </div>
          <p className="text-3xl font-bold text-red-600">{stats.submittedLate}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm học viên theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400 w-4 h-4" />
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[160px] cursor-pointer"
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundImage: 'none',
                  outline: 'none'
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="not_started">Chưa làm bài</option>
                <option value="in_progress">Đang làm bài</option>
                <option value="submitted_on_time">Đã nộp đúng hạn</option>
                <option value="submitted_late">Nộp trễ hạn</option>
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none z-10" />
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
                Trạng thái: {
                  filterStatus === 'not_started' ? 'Chưa làm bài' :
                  filterStatus === 'in_progress' ? 'Đang làm bài' :
                  filterStatus === 'submitted_on_time' ? 'Đã nộp đúng hạn' :
                  'Nộp trễ hạn'
                }
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

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <StudentCard key={student.studentId} student={student} />
          ))}
        </div>
      )}

      {/* Results Info */}
      {filteredStudents.length > 0 && (
        <div className="flex justify-center mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-6 py-3">
            <p className="text-sm text-gray-600">
              Hiển thị {filteredStudents.length} trong tổng số {students.length} học viên
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExamDetail;

