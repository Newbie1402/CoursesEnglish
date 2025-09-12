import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubmissionDetail, getSubmissionAnswer } from '@/services/hooks/submissionService';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Trophy,
  FileText,
  MessageSquare,
  Target,
  Calendar,
  Award,
  BookOpen,
  Eye,
  AlertCircle,
  Loader2
} from 'lucide-react';

const SubmissionDetail = () => {
  const { examId, submissionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setError(null);
        setLoadingSummary(true);
        const detail = await getSubmissionDetail(submissionId);
        if (!ignore) setSubmission(detail);
      } catch (e) {
        console.error(e);
        if (!ignore) setError('Không tải được thông tin bài nộp');
      } finally {
        if (!ignore) setLoadingSummary(false);
      }
    })();
    return () => { ignore = true; };
  }, [submissionId]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getSubmissionAnswer(submissionId);
        if (!ignore) setAnswers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        if (!ignore) setError('Không tải được danh sách câu trả lời');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [submissionId]);

  const totalScore = useMemo(() => {
    if (!submission) return null;
    if (submission.score != null && submission.maxScore != null) return `${submission.score}/${submission.maxScore}`;
    // fallback tính tổng từ answers nếu backend chưa tổng hợp
    const scored = answers.reduce((acc, a) => acc + (a.score || 0), 0);
    const max = answers.reduce((acc, a) => acc + (a.question?.maxScore || 0), 0);
    return `${scored}/${max}`;
  }, [submission, answers]);

  const scorePercentage = useMemo(() => {
    if (!submission) return 0;
    const score = submission.score ?? answers.reduce((acc, a) => acc + (a.score || 0), 0);
    const maxScore = submission.maxScore ?? answers.reduce((acc, a) => acc + (a.question?.maxScore || 0), 0);
    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  }, [submission, answers]);

  const formatDateTime = (iso) => {
    if (!iso) return '--';
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const renderMCAnswer = (a, index) => {
    const q = a.question || {};
    const options = q.options || [];
    const correctRaw = q.correctAnswer;
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    // Tìm index đáp án đúng
    let correctIndex = -1;
    if (typeof correctRaw === 'string') {
      const lower = correctRaw.trim().toLowerCase();
      correctIndex = options.findIndex(o => (o || '').trim().toLowerCase() === lower);
      if (correctIndex === -1 && correctRaw.length === 1) {
        const letterIdx = letters.indexOf(correctRaw.toUpperCase());
        if (letterIdx >= 0 && letterIdx < options.length) correctIndex = letterIdx;
      }
    }

    // Xác định lựa chọn của học viên
    let studentIndex = options.findIndex(o => o === a.studentAnswer);
    if (studentIndex === -1 && typeof a.studentAnswer === 'string' && a.studentAnswer.length === 1) {
      const letterIdx = letters.indexOf(a.studentAnswer.toUpperCase());
      if (letterIdx >= 0 && letterIdx < options.length) studentIndex = letterIdx;
    }

    const isCorrect = a.isCorrect != null ? a.isCorrect : (studentIndex !== -1 && studentIndex === correctIndex);

    return (
      <div key={a.id} className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-300">
        {/* Question Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-semibold text-sm">
              {index + 1}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 leading-relaxed">{q.content}</h4>
              <div className="flex items-center gap-2 mt-1">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">Trắc nghiệm</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Đúng
              </div>
            ) : (
              <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                <XCircle className="w-4 h-4" />
                Sai
              </div>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-4">
          {options.map((opt, i) => {
            const isCorrectOpt = i === correctIndex;
            const isStudentOpt = i === studentIndex;

            let optionStyle = 'border-gray-200 bg-gray-50 hover:bg-gray-100';
            if (isCorrectOpt && isStudentOpt) {
              optionStyle = 'border-green-400 bg-green-50 ring-2 ring-green-200';
            } else if (isCorrectOpt) {
              optionStyle = 'border-green-400 bg-green-50';
            } else if (isStudentOpt) {
              optionStyle = 'border-red-400 bg-red-50 ring-2 ring-red-200';
            }

            return (
              <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 ${optionStyle}`}>
                <div className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-colors ${
                  isCorrectOpt ? 'bg-green-500 text-white border-green-500' : 
                  isStudentOpt ? 'bg-red-500 text-white border-red-500' : 
                  'bg-white border-gray-300 text-gray-600'
                }`}>
                  {letters[i]}
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-gray-800 leading-relaxed">{opt || <em className="text-gray-400">(Trống)</em>}</span>
                  <div className="flex gap-2">
                    {isCorrectOpt && (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <Target className="w-3 h-3" />
                        Đáp án đúng
                      </span>
                    )}
                    {isStudentOpt && !isCorrectOpt && (
                      <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
                        <Eye className="w-3 h-3" />
                        Bạn đã chọn
                      </span>
                    )}
                    {isStudentOpt && isCorrectOpt && (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Bạn đã chọn đúng
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Score Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Trophy className="w-4 h-4" />
            <span>Điểm số: <strong className={isCorrect ? 'text-green-600' : 'text-red-600'}>{a.score || 0}/{q.maxScore}</strong></span>
          </div>
          {!isCorrect && correctIndex !== -1 && (
            <div className="text-xs text-gray-500">
              Đáp án đúng: <strong className="text-green-600">{options[correctIndex]}</strong>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEssayAnswer = (a, index) => {
    const q = a.question || {};
    const hasAnswer = a.studentAnswer && a.studentAnswer.trim();
    const isGraded = a.score != null;

    return (
      <div key={a.id} className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-purple-300">
        {/* Question Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center font-semibold text-sm">
              {index + 1}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 leading-relaxed">{q.content}</h4>
              <div className="flex items-center gap-2 mt-1">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">Tự luận</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isGraded ? (
              <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <Award className="w-4 h-4" />
                Đã chấm
              </div>
            ) : (
              <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                <Clock className="w-4 h-4" />
                Chờ chấm
              </div>
            )}
          </div>
        </div>

        {/* Student Answer */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Câu trả lời của bạn:</span>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
            {hasAnswer ? (
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{a.studentAnswer}</p>
            ) : (
              <div className="flex items-center gap-2 text-gray-400 italic">
                <AlertCircle className="w-4 h-4" />
                Chưa trả lời câu hỏi này
              </div>
            )}
          </div>
        </div>

        {/* Teacher Feedback */}
        {a.teacherFeedback && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-gray-700">Nhận xét của giảng viên:</span>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-4">
              <p className="text-indigo-800 leading-relaxed">{a.teacherFeedback}</p>
            </div>
          </div>
        )}

        {/* Score Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Trophy className="w-4 h-4" />
              <span>Điểm số: <strong className={isGraded ? 'text-blue-600' : 'text-gray-500'}>{isGraded ? `${a.score}/${q.maxScore}` : `Chưa chấm / ${q.maxScore}`}</strong></span>
            </div>
          </div>
          {!hasAnswer && (
            <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              Không có câu trả lời
            </div>
          )}
        </div>
      </div>
    );
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-gray-600">Đang tải dữ liệu...</p>
      </div>
    </div>
  );

  const ErrorState = ({ message }) => (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
      <h3 className="text-lg font-semibold text-red-800 mb-2">Có lỗi xảy ra</h3>
      <p className="text-red-600">{message}</p>
    </div>
  );

  const EmptyState = () => (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center">
      <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có câu trả l���i</h3>
      <p className="text-gray-500">Không tìm thấy câu trả lời nào cho bài nộp này.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative backdrop-blur-sm bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/90 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-white">
                  <h1 className="text-3xl font-bold mb-2">Chi tiết bài nộp</h1>
                  <p className="text-blue-100 text-lg">Xem kết quả và đáp án chi tiết</p>
                </div>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur text-white rounded-2xl font-medium transition-all duration-200 border border-white/20 hover:border-white/40"
              >
                <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Quay lại
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Summary Card */}
        {submission && (
          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                Tổng quan kết quả
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-medium">Mã bài nộp</p>
                      <p className="text-lg font-bold text-blue-800">#{submission.id}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-green-600 font-medium">Điểm số</p>
                      <p className={`text-lg font-bold ${getScoreColor(scorePercentage).split(' ')[0]}`}>{totalScore}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-600 font-medium">Bắt đầu</p>
                      <p className="text-sm font-semibold text-purple-800">{formatDateTime(submission.startedAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-orange-600 font-medium">Nộp bài</p>
                      <p className="text-sm font-semibold text-orange-800">{formatDateTime(submission.submittedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Tỷ lệ đúng</span>
                  <span className={`text-sm font-bold ${getScoreColor(scorePercentage).split(' ')[0]}`}>{scorePercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${scorePercentage >= 80 ? 'bg-green-500' : scorePercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${scorePercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && <ErrorState message={error} />}

        {/* Loading State */}
        {loading && <LoadingSpinner />}

        {/* Empty State */}
        {!loading && !answers.length && !error && <EmptyState />}

        {/* Questions and Answers */}
        {!loading && answers.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Câu hỏi và đáp án</h3>
              <div className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent"></div>
            </div>

            {answers.map((a, idx) => {
              const type = a.question?.type;
              if (type === 'MULTIPLE_CHOICE') return renderMCAnswer(a, idx);
              return renderEssayAnswer(a, idx);
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionDetail;
