import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaMedal,
  FaExclamationTriangle,
  FaQuestionCircle,
  FaCommentDots,
  FaChartLine
} from 'react-icons/fa';
import { getSubmissionDetail, getSubmissionAnswer } from '@/services/hooks/submissionService';

const SubmissionDetail = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  // States
  const [submissionDetail, setSubmissionDetail] = useState(null);
  const [submissionAnswers, setSubmissionAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubmissionData = async () => {
      try {
        setLoading(true);
        setError('');

        // Gọi 2 API song song để lấy chi tiết bài nộp và câu trả lời
        const [detailResponse, answersResponse] = await Promise.all([
          getSubmissionDetail(submissionId),
          getSubmissionAnswer(submissionId)
        ]);

        setSubmissionDetail(detailResponse);
        setSubmissionAnswers(answersResponse);

      } catch (err) {
        console.error('Error fetching submission data:', err);
        setError('Không thể tải dữ liệu bài nộp. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) {
      fetchSubmissionData();
    }
  }, [submissionId]);

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

  const getScorePercentage = () => {
    if (!submissionDetail?.maxScore || submissionDetail.maxScore === 0) return 0;
    return Math.round((submissionDetail.score / submissionDetail.maxScore) * 100);
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const renderQuestionContent = (question) => {
    switch (question.type) {
      case 'MULTIPLE_CHOICE':
        return (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 mb-3">{question.content}</h4>
            <div className="space-y-2">
              {question.options?.map((option, index) => {
                const isStudentAnswer = option === submissionAnswers.find(ans => ans.question.id === question.id)?.studentAnswer;
                const isCorrectAnswer = option === question.correctAnswer;

                let optionClass = 'p-3 rounded-lg border transition-colors ';
                if (isStudentAnswer && isCorrectAnswer) {
                  optionClass += 'bg-green-50 border-green-200 text-green-800';
                } else if (isStudentAnswer && !isCorrectAnswer) {
                  optionClass += 'bg-red-50 border-red-200 text-red-800';
                } else if (isCorrectAnswer) {
                  optionClass += 'bg-blue-50 border-blue-200 text-blue-800';
                } else {
                  optionClass += 'bg-gray-50 border-gray-200 text-gray-700';
                }

                return (
                  <div key={index} className={optionClass}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{String.fromCharCode(65 + index)}. {option}</span>
                      <div className="flex items-center space-x-2">
                        {isStudentAnswer && (
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                            Học viên chọn
                          </span>
                        )}
                        {isCorrectAnswer && (
                          <FaCheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        {isStudentAnswer && !isCorrectAnswer && (
                          <FaTimesCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      default:
        return (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">{question.content}</h4>
            <p className="text-gray-600 text-sm">Loại câu hỏi: {question.type}</p>
          </div>
        );
    }
  };

  const LoadingSkeleton = () => (
    <div className="p-6 space-y-6">
      <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="h-24 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  );

  const ErrorState = () => (
    <div className="p-6">
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaExclamationTriangle className="w-12 h-12 text-red-400" />
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
    </div>
  );

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState />;

  const scorePercentage = getScorePercentage();
  const correctAnswers = submissionAnswers.filter(answer => answer.isCorrect).length;
  const totalQuestions = submissionAnswers.length;

  return (
    <div className="p-6 space-y-6">
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
            <h1 className="text-3xl font-bold text-gray-900">Chi tiết bài nộp</h1>
            <p className="text-gray-600 mt-1">Xem kết quả và câu trả lời của học viên</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getScoreColor(scorePercentage)}`}>
              <FaMedal className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Điểm số</h3>
              <p className="text-sm text-gray-600">Kết quả tổng thể</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-900">
                {submissionDetail?.score || 0}/{submissionDetail?.maxScore || 0}
              </span>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${getScoreColor(scorePercentage)}`}>
                {scorePercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${scorePercentage >= 80 ? 'bg-green-500' : scorePercentage >= 60 ? 'bg-yellow-500' : scorePercentage >= 40 ? 'bg-orange-500' : 'bg-red-500'}`}
                style={{ width: `${scorePercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Time Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FaClock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Thời gian</h3>
              <p className="text-sm text-gray-600">Thông tin nộp bài</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Bắt đầu:</span>
              <span className="font-medium">{formatDate(submissionDetail?.startedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Nộp bài:</span>
              <span className="font-medium">{formatDate(submissionDetail?.submittedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hạn nộp:</span>
              <span className="font-medium">{formatDate(submissionDetail?.deadline)}</span>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FaChartLine className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Thống kê</h3>
              <p className="text-sm text-gray-600">Câu trả lời</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tổng câu hỏi:</span>
              <span className="font-medium">{totalQuestions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trả lời đúng:</span>
              <span className="font-medium text-green-600">{correctAnswers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trả lời sai:</span>
              <span className="font-medium text-red-600">{totalQuestions - correctAnswers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Feedback */}
      {submissionDetail?.teacherFeedback && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaCommentDots className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Nhận xét của giáo viên</h3>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-gray-700">{submissionDetail.teacherFeedback}</p>
          </div>
        </div>
      )}

      {/* Questions and Answers */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <FaQuestionCircle className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Câu hỏi và câu trả lời</h3>
        </div>

        <div className="space-y-6">
          {submissionAnswers.map((answer, index) => (
            <div key={answer.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-700">
                    {index + 1}
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Câu {index + 1}</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {answer.question.type}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        {answer.question.maxScore} điểm
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {answer.isCorrect ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <FaCheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Đúng ({answer.score} điểm)</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-red-600">
                      <FaTimesCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Sai ({answer.score} điểm)</span>
                    </div>
                  )}
                </div>
              </div>

              {renderQuestionContent(answer.question)}

              {/* Teacher Feedback for this question */}
              {answer.teacherFeedback && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaCommentDots className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Nhận xét cho câu này:</span>
                  </div>
                  <p className="text-sm text-gray-700 bg-purple-50 rounded-lg p-3">
                    {answer.teacherFeedback}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="text-center">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Tóm tắt kết quả</h4>
          <p className="text-gray-600">
            Học viên đã hoàn thành bài kiểm tra với {correctAnswers}/{totalQuestions} câu trả lời đúng,
            đạt {submissionDetail?.score || 0}/{submissionDetail?.maxScore || 0} điểm ({scorePercentage}%).
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetail;
