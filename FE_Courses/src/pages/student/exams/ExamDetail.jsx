import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getAssignmentDetails } from "@/services/hooks/assignmentService";
import { startExam, getSubmissionDetail } from "@/services/hooks/submissionService";
import { useAuth} from "@/contexts/AuthContext.jsx";
import {
  Clock,
  Calendar,
  Timer,
  Play,
  RotateCcw,
  Eye,
  Lock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  FileText,
  Trophy,
  Target,
  Loader2,
  ArrowLeft,
  PenTool,
  Award,
  User,
  Info,
  Shield
} from 'lucide-react';

const ExamDetail = () => {
  const { studentId } = useAuth();
  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const submissionIdFromState = location.state?.submissionId || null;
  const storageKey = `submission:${examId}:${studentId}`;

  const [exam, setExam] = useState(null);
  const [loadingExam, setLoadingExam] = useState(true);
  const [error, setError] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [starting, setStarting] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);

  // Tải đề thi
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setError(null);
        setLoadingExam(true);
        const data = await getAssignmentDetails(examId);
        if (!ignore) setExam(data);
      } catch (err) {
        console.error("Failed to load exam detail", err);
        if (!ignore) setError("Không thể tải thông tin bài kiểm tra");
      } finally {
        if (!ignore) setLoadingExam(false);
      }
    })();
    return () => { ignore = true; };
  }, [examId]);

  // Khôi phục submission: ưu tiên state -> localStorage
  useEffect(() => {
    let ignore = false;
    const restore = async (sid) => {
      if (!sid) return;
      try {
        setLoadingSubmission(true);
        const data = await getSubmissionDetail(sid);
        if (!ignore && data?.id) setSubmission(data);
      } catch (e) {
        console.error('Không tải được submission', e);
      } finally {
        if (!ignore) setLoadingSubmission(false);
      }
    };

    if (submissionIdFromState) {
      restore(submissionIdFromState);
      if (typeof window !== 'undefined') localStorage.setItem(storageKey, submissionIdFromState);
      return () => { ignore = true; };
    }

    const storedId = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
    if (storedId) restore(storedId);

    return () => { ignore = true; };
  }, [submissionIdFromState, storageKey]);

  const canStart = useMemo(() => {
    if (!exam) return false;
    if (submission && !submission.submittedAt) return false; // đang làm dở -> không cho start mới
    if (submission?.submittedAt) return false; // đã nộp -> không start lại
    const now = Date.now();
    const start = exam.startTime ? new Date(exam.startTime).getTime() : null;
    const end = exam.endTime ? new Date(exam.endTime).getTime() : null;
    if (!start) return false;
    if (now < start) return false;
    if (end && now > end) return false;
    return true;
  }, [exam, submission]);

  const statusLabel = useMemo(() => {
    if (!exam) return "--";
    const now = Date.now();
    const start = exam.startTime ? new Date(exam.startTime).getTime() : null;
    const end = exam.endTime ? new Date(exam.endTime).getTime() : null;
    if (!start) return "Chưa xác định";
    if (now < start) return "Chưa mở";
    if (end && now > end) return "Đã kết thúc";
    return "Đang mở";
  }, [exam]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Đang mở':
        return {
          color: 'text-green-700 bg-green-100 border-green-200',
          icon: CheckCircle
        };
      case 'Chưa mở':
        return {
          color: 'text-yellow-700 bg-yellow-100 border-yellow-200',
          icon: Clock
        };
      case 'Đã kết thúc':
        return {
          color: 'text-red-700 bg-red-100 border-red-200',
          icon: AlertCircle
        };
      default:
        return {
          color: 'text-gray-700 bg-gray-100 border-gray-200',
          icon: Info
        };
    }
  };

  const formatDateTime = (iso) => {
    if (!iso) return "--";
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', {
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isLate = useMemo(() => {
    if (!submission?.submittedAt || !submission?.deadline) return false;
    return new Date(submission.submittedAt).getTime() > new Date(submission.deadline).getTime();
  }, [submission]);

  const handleStart = async () => {
    if (!exam || !studentId) return;
    setStarting(true);
    try {
      const res = await startExam(exam.examId, studentId, passwordInput || "");
      const submissionId = res?.id || res?.submissionId;
      if (submissionId) {
        if (typeof window !== 'undefined') localStorage.setItem(storageKey, submissionId);
        navigate(`/student/exams/${exam.examId}/submission/${submissionId}`, { state: { exam, submissionId } });
      } else {
        alert('Không nhận được submissionId từ server');
      }
    } catch (err) {
      console.error("Start exam failed", err);
      alert("Không thể bắt đầu bài kiểm tra. Kiểm tra mật khẩu hoặc thời gian.");
    } finally {
      setStarting(false);
    }
  };

  const handleResume = () => {
    if (!submission?.id || !exam) return;
    navigate(`/student/exams/${exam.examId}/submission/${submission.id}`, { state: { exam, submissionId: submission.id } });
  };

  const handleViewDetail = () => {
    if (!submission?.id) return;
    navigate(`/student/exams/${exam.examId}/submission/${submission.id}/detail`);
  };

  // Enhanced Loading State
  if (loadingExam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-gradient-to-r from-indigo-200/50 to-purple-200/50 rounded-3xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
              <div className="h-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
            </div>
            <div className="h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
          </div>
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Đang tải thông tin bài ki��m tra...</p>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-8 text-center shadow-lg">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-lg mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-red-800 mb-3">Có lỗi xảy ra</h3>
            <p className="text-red-600 mb-6 leading-relaxed">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <RotateCcw className="w-4 h-4" />
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 text-center shadow-lg">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg mb-6">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-3">Không tìm thấy bài kiểm tra</h3>
            <p className="text-gray-500 mb-6">Bài kiểm tra này có thể đã bị xóa hoặc bạn không có quyền truy cập.</p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl font-semibold transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const showStartButton = !submission;
  const showResumeButton = submission && !submission.submittedAt;
  const showSubmittedLabel = submission?.submittedAt;
  const statusConfig = getStatusConfig(statusLabel);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative backdrop-blur-sm bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-6 flex-1">
                <div className="w-16 h-16 bg-white/90 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg">
                  <PenTool className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="text-white flex-1">
                  <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    {exam.title}
                  </h1>
                  {exam.description && (
                    <p className="text-blue-100/90 text-lg leading-relaxed mb-4 max-w-2xl">
                      {exam.description}
                    </p>
                  )}
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${statusConfig.color} bg-white/90 backdrop-blur`}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="font-semibold">{statusLabel}</span>
                  </div>
                </div>
              </div>

              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur text-white rounded-2xl font-medium transition-all duration-200 border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Quay lại
              </button>
            </div>
          </div>
        </div>

        {/* Exam Details Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Time Information Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Thời gian thi</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500">Bắt đầu</div>
                  <div className="font-semibold text-gray-800">{formatDateTime(exam.startTime)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500">Kết thúc</div>
                  <div className="font-semibold text-gray-800">{formatDateTime(exam.endTime)}</div>
                </div>
              </div>
              {exam.durationMinutes != null && (
                <div className="flex items-center gap-3">
                  <Timer className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-xs text-gray-500">Thời lượng</div>
                    <div className="font-semibold text-gray-800">{exam.durationMinutes} phút</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Exam Info Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Thông tin bài thi</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500">Loại bài thi</div>
                  <div className="font-semibold text-gray-800">
                    {exam.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' :
                     exam.type === 'WRITING' ? 'Tự luận' : exam.type}
                  </div>
                </div>
              </div>
              {exam.password && (
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-xs text-gray-500">Bảo mật</div>
                    <div className="font-semibold text-gray-800">Yêu cầu mật khẩu</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Password Input */}
        {exam.password && showStartButton && (
          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Mật khẩu bài thi</h3>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all"
                placeholder="Nhập mật khẩu để bắt đầu làm bài..."
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg">
          <div className="flex flex-wrap gap-4">
            {showStartButton && (
              <button
                disabled={!canStart || starting}
                onClick={handleStart}
                className={`group flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                  canStart ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' : 'bg-gray-400'
                }`}
              >
                {starting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang bắt đầu...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Bắt đầu làm bài
                  </>
                )}
              </button>
            )}

            {showResumeButton && (
              <button
                onClick={handleResume}
                className="group flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <RotateCcw className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Tiếp tục làm bài
              </button>
            )}

            {showSubmittedLabel && (
              <>
                <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 rounded-xl border border-emerald-200 font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  Đã nộp bài
                </div>
                <button
                  onClick={handleViewDetail}
                  className="group flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Xem chi tiết bài nộp
                </button>
              </>
            )}
          </div>
        </div>

        {/* Loading Submission Status */}
        {loadingSubmission && (
          <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-blue-700 font-medium">Đang tải kết quả bài nộp...</span>
            </div>
          </div>
        )}

        {/* Enhanced Submission Results */}
        {showSubmittedLabel && submission && (
          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                <Trophy className="w-6 h-6" />
                Kết quả bài nộp
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {submission.score != null && (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-green-600 font-medium">Điểm số</div>
                        <div className="text-lg font-bold text-green-800">{submission.score}/{submission.maxScore || '?'}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-purple-600 font-medium">Nộp lúc</div>
                      <div className="text-sm font-semibold text-purple-800">
                        {formatDateTime(submission.submittedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {isLate && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Nộp trễ</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamDetail;
