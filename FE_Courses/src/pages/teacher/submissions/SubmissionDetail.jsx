import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubmissionDetail } from '@/services/hooks/submissionService';
import { getStudentDetail } from '@/services/hooks/studentService';
import { FaUser, FaClock, FaCalendarAlt, FaCheckCircle, FaEye, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import { cn } from '@/lib/utils';

const formatDateTime = (iso) => {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', {
      hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  } catch { return iso; }
};

const diffMinutes = (start, end) => {
  if (!start || !end) return '-';
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (isNaN(s) || isNaN(e)) return '-';
  const diff = Math.max(0, e - s);

  // Tính toán phút và giây
  const totalSeconds = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Hiển thị theo format phù hợp
  if (minutes === 0) {
    return `${seconds} giây`;
  } else if (minutes < 60) {
    return seconds > 0 ? `${minutes} phút ${seconds} giây` : `${minutes} phút`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} giờ ${remainingMinutes} phút`;
  }
};

// Cập nhật logic status theo yêu cầu mới
const getDetailedStatus = (submittedAt, score, deadline) => {
  // Đang làm: submittedAt = null
  if (!submittedAt) {
    return {
      label: 'Đang làm',
      color: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
      icon: FaClock,
      description: 'Học viên đang trong quá trình làm bài'
    };
  }

  // Đã chấm: score != 0
  if (typeof score === 'number' && !Number.isNaN(score) && score !== 0) {
    return {
      label: 'Đã chấm',
      color: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
      icon: FaCheckCircle,
      description: 'Bài thi đã được chấm điểm'
    };
  }

  // Đã nộp: submittedAt != null && score == null
  if (!deadline) {
    return {
      label: 'Đã nộp',
      color: 'bg-blue-50 text-blue-700 ring-blue-600/20',
      icon: FaCheckCircle,
      description: 'Học viên đã nộp bài, chờ chấm điểm'
    };
  }

  const submitted = new Date(submittedAt).getTime();
  const dead = new Date(deadline).getTime();

  if (submitted <= dead) {
    return {
      label: 'Đúng hạn',
      color: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
      icon: FaCheckCircle,
      description: 'Nộp bài đúng thời hạn quy định'
    };
  }

  return {
    label: 'Trễ hạn',
    color: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    icon: FaExclamationTriangle,
    description: 'Nộp bài sau thời hạn quy định'
  };
};

const SubmissionDetail = () => {
  const { examId, submissionId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSubmissionDetail(submissionId);
      setData(res || null);

      // Fetch student detail if submission exists
      if (res?.studentId) {
        setLoadingStudent(true);
        try {
          const student = await getStudentDetail(res.studentId);
          setStudentData(student);
        } catch (studentError) {
          console.error('Failed to fetch student detail:', studentError);
          setStudentData({ fullName: `Student #${res.studentId}`, error: true });
        } finally {
          setLoadingStudent(false);
        }
      }
    } catch (e) {
      setError('Không tải được chi tiết bài nộp.');
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(()=> { fetchDetail(); }, [fetchDetail]);

  const statusInfo = useMemo(()=> {
    if (!data) return getDetailedStatus(null, null, null);
    return getDetailedStatus(data.submittedAt, data.score, data.deadline);
  }, [data]);

  const isInProgress = !data?.submittedAt; // Đang làm bài

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaUser className="w-8 h-8 text-blue-600" />
                Chi tiết bài nộp
              </h1>
            </div>
            <div className="flex items-center gap-3">
                <Link
                    to={`/teacher/assignments/${examId}/submissions/${submissionId}/answers`}
                    className={cn(
                        'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        isInProgress
                            ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed pointer-events-none'
                            : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-sm'
                    )}
                    onClick={isInProgress ? (e) => e.preventDefault() : undefined}
                    title={isInProgress ? 'Học viên chưa nộp bài' : 'Xem chi tiết câu trả lời'}
                >
                    <FaEye className="w-4 h-4" />
                    Xem câu trả lời
                </Link>
              <Link
                to={`/teacher/assignments/${examId}/submissions`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300/60 transition-colors"
              >
                <FaArrowLeft className="w-4 h-4" />
                Quay lại
              </Link>
            </div>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-600 text-lg">Đang tải...</span>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h3>
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button
              onClick={fetchDetail}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && !data && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUser className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy dữ liệu</h3>
            <p className="text-gray-600">Bài nộp không tồn tại hoặc đã bị xóa.</p>
          </div>
        )}

        {!loading && !error && data && (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Student Info Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {studentData?.fullName ? studentData.fullName.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {loadingStudent ? (
                        <div className="animate-pulse bg-gray-200 h-6 w-48 rounded"></div>
                      ) : (
                        studentData?.fullName || `Student #${data.studentId}`
                      )}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <statusInfo.icon className="w-5 h-5" />
                    <span className={cn('inline-flex items-center rounded-xl px-4 py-2 text-sm font-bold ring-2 ring-inset', statusInfo.color)}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 bg-gray-50 rounded-xl p-4">{statusInfo.description}</p>
              </div>

              {/* Submission Details */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FaCalendarAlt className="w-5 h-5 text-blue-600" />
                  Thông tin chi tiết
                </h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <dt className="text-gray-600 text-sm font-medium mb-1">Bắt đầu làm bài</dt>
                    <dd className="font-mono text-sm text-gray-900">{formatDateTime(data.startedAt)}</dd>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <dt className="text-gray-600 text-sm font-medium mb-1">Thời gian nộp</dt>
                    <dd className="font-mono text-sm text-gray-900">{formatDateTime(data.submittedAt)}</dd>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <dt className="text-gray-600 text-sm font-medium mb-1">Deadline</dt>
                    <dd className="font-mono text-sm text-gray-900">{formatDateTime(data.deadline)}</dd>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <dt className="text-gray-600 text-sm font-medium mb-1">Thời gian làm bài</dt>
                    <dd className="text-lg font-bold text-gray-900">{diffMinutes(data.startedAt, data.submittedAt)}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Score & Feedback (moved here replacing Actions) */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FaCheckCircle className="w-5 h-5 text-green-600" />
                  Điểm số & Nhận xét
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white text-center min-w-[100px]">
                      <p className="text-xs opacity-90 mb-1">Điểm số</p>
                      <p className="text-2xl font-bold">
                        {(typeof data.score === 'number' && !Number.isNaN(data.score)) ? data.score : '-'}
                      </p>
                      <p className="text-xs opacity-90">/ {data.maxScore}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 font-medium mb-2">Trạng thái chấm điểm</p>
                      <p className="text-base font-semibold text-gray-900">
                        {(typeof data.score === 'number' && !Number.isNaN(data.score)) ? 'Đã chấm điểm' : 'Chưa chấm điểm'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-3">Nhận xét từ giáo viên</p>
                    <div className="bg-gray-50 rounded-xl p-4 min-h-[80px]">
                      <p className="text-gray-700 whitespace-pre-wrap text-sm">
                        {data.teacherFeedback || (
                          <span className="text-gray-400 italic">Chưa có nhận xét từ giáo viên</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Thời gian</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">So sánh với deadline:</span>
                    <span className={cn('font-bold',
                      data.submittedAt && data.deadline && new Date(data.submittedAt) <= new Date(data.deadline)
                        ? 'text-green-600'
                        : 'text-red-600'
                    )}>
                      {data.submittedAt ? (
                        data.deadline && new Date(data.submittedAt) <= new Date(data.deadline)
                          ? 'Đúng hạn'
                          : 'Trễ hạn'
                      ) : 'Chưa nộp'}
                    </span>
                  </div>
                  {data.submittedAt && data.deadline && (
                    <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                      {new Date(data.submittedAt) > new Date(data.deadline) && (
                        <p>Trễ {Math.round((new Date(data.submittedAt) - new Date(data.deadline)) / 60000)} phút</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionDetail;
