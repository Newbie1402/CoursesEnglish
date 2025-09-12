import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getQuestions } from '@/services/hooks/assignmentService';
import { createAnswers, updateAnswer, deleteAnswer, finishExam } from '@/services/hooks/submissionService';
import { trackChoiceActionBatch, getSubmissionDetail } from '@/services/hooks/submissionService';
import { getAssignmentDetails } from '@/services/hooks/assignmentService';
import { useAuth } from '@/contexts/AuthContext.jsx';
import {
  Clock,
  Send,
  Save,
  CheckCircle,
  AlertTriangle,
  FileText,
  Trash2,
  Timer,
  BookOpen,
  Target,
  Edit3,
  Loader2,
  ArrowLeft,
  CircleCheckBig,
  Circle,
  Brain
} from 'lucide-react';

const Submissions = () => {
  const { examId, submissionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { studentId } = useAuth();

  const examFromState = location.state?.exam || null;

  const [exam, setExam] = useState(examFromState);
  const [questions, setQuestions] = useState([]);
  const [answersMap, setAnswersMap] = useState({}); // { questionId: { answerId, value } }
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState(null);
  const [remainingMs, setRemainingMs] = useState(null);
  const [submission, setSubmission] = useState(null);

  const timerRef = useRef(null);
  const deadlineRef = useRef(null);
  const trackBufferRef = useRef([]); // buffer lưu các lựa chọn
  const flushTimerRef = useRef(null);

  const flushTrackBuffer = useCallback(async () => {
    if (!trackBufferRef.current.length) return;
    const payload = [...trackBufferRef.current];
    trackBufferRef.current = [];
    try {
      await trackChoiceActionBatch(payload);
    } catch (e) {
      console.error('Gửi batch track lựa chọn thất bại', e);
    }
  }, []);

  const scheduleFlush = () => {
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(() => {
      flushTrackBuffer();
    }, 1200); // debounce 1.2s
  };

  const logChoice = (questionId, optionValue, optionIndex) => {
    if (!submissionId) return; // chỉ log khi đã có submission
    trackBufferRef.current.push({
      userId: studentId,
      quizId: Number(examId),
      questionId,
      actionType: 'SELECT',
      choiceId: optionIndex,
      choiceIndex: optionIndex,
      currentChoices: [optionIndex]
    });
    // Giới hạn kích thước batch để tránh quá lớn
    if (trackBufferRef.current.length >= 10) {
      flushTrackBuffer();
    } else {
      scheduleFlush();
    }
  };

  // Định nghĩa autoFinish TRƯỚC khi useEffect phía dưới sử dụng để tránh lỗi TDZ
  const autoFinish = useCallback(async () => {
    if (!submissionId) return;
    if (finishing) return;
    setFinishing(true);
    try {
      await flushTrackBuffer();
      await finishExam(submissionId);
      alert('Đã tự động nộp bài do hết thời gian.');
    } catch (e) {
      console.error('Finish exam thất bại', e);
    } finally {
      navigate(`/student/exams/${examId}` , { state: { submissionId } });
    }
  }, [submissionId, finishing, navigate, examId, flushTrackBuffer]);

  // Tải exam nếu không có trong state (fallback)
  useEffect(() => {
    if (!exam) {
      (async () => {
        try {
          const data = await getAssignmentDetails(examId);
          setExam(data);
        } catch (e) {
          console.error(e);
          setError('Không tải được thông tin bài kiểm tra');
        }
      })();
    }
  }, [exam, examId]);

  // Tải submission detail để lấy deadline chính xác từ server
  useEffect(() => {
    if (!submissionId) return;
    let ignore = false;
    (async () => {
      try {
        const detail = await getSubmissionDetail(submissionId);
        if (!ignore && detail?.id) {
          setSubmission(detail);
        }
      } catch (e) {
        console.error('Không tải được submission detail', e);
      }
    })();
    return () => { ignore = true; };
  }, [submissionId]);

  // Khởi tạo / cập nhật countdown dựa trên deadline của submission
  useEffect(() => {
    if (!submission && !exam) return; // cần ít nhất một trong hai để tính

    // Ưu tiên deadline từ submission (server), đảm bảo chính xác sau reload
    let computedDeadline = null;
    if (submission?.deadline) {
      computedDeadline = new Date(submission.deadline).getTime();
    } else if (submission?.startedAt && exam?.durationMinutes) {
      // fallback nếu server chưa trả deadline nhưng có startedAt + duration
      computedDeadline = new Date(submission.startedAt).getTime() + exam.durationMinutes * 60 * 1000;
    } else if (exam?.endTime) {
      // fallback cuối cùng: endTime của đề
      computedDeadline = new Date(exam.endTime).getTime();
    }

    if (!computedDeadline) return;
    deadlineRef.current = computedDeadline;
    const now = Date.now();
    setRemainingMs(Math.max(0, computedDeadline - now));

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const rest = (deadlineRef.current ?? 0) - Date.now();
      if (rest <= 0) {
        clearInterval(timerRef.current);
        setRemainingMs(0);
        autoFinish();
      } else {
        setRemainingMs(rest);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [submission, exam, autoFinish]);

  const loadQuestions = useCallback(async () => {
    if (!examId) return;
    try {
      const qs = await getQuestions(examId);
      setQuestions(qs || []);
    } catch (e) {
      console.error(e);
      setError('Không tải được danh sách câu hỏi');
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const formatTime = (ms) => {
    if (ms == null) return '--:--';
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const persistAnswer = async (questionId, value) => {
    if (!submissionId) {
      console.warn('Không có submissionId; không thể lưu câu trả lời');
      return;
    }
    setAnswersMap(prev => {
      const existing = prev[questionId];
      return { ...prev, [questionId]: { ...(existing || {}), value } };
    });

    try {
      const current = answersMap[questionId];
      if (current?.answerId) {
        // update
        await updateAnswer(current.answerId, value);
      } else {
        // create
        const created = await createAnswers(questionId, value, submissionId);
        if (created?.id) {
          setAnswersMap(prev => ({ ...prev, [questionId]: { answerId: created.id, value } }));
        }
      }
    } catch (e) {
      console.error('Lưu câu trả lời thất bại', e);
      alert('Không thể lưu câu trả lời.');
    }
  };

  const handleSelectOption = (questionId, optionValue) => {
    persistAnswer(questionId, optionValue);
    const q = questions.find(q => q.id === questionId);
    if (q && Array.isArray(q.options)) {
      const idx = q.options.indexOf(optionValue);
      if (idx !== -1) logChoice(questionId, optionValue, idx);
    }
  };

  const handleEssayChange = (questionId, text) => {
    setAnswersMap(prev => ({ ...prev, [questionId]: { ...(prev[questionId] || {}), value: text } }));
  };

  // Debounce lưu bài tự luận sau 800ms
  const debounceRef = useRef({});
  const handleEssayBlurOrAutoSave = (questionId) => {
    const value = answersMap[questionId]?.value || '';
    persistAnswer(questionId, value);
  };

  const handleEssayInput = (questionId, text) => {
    handleEssayChange(questionId, text);
    if (debounceRef.current[questionId]) clearTimeout(debounceRef.current[questionId]);
    debounceRef.current[questionId] = setTimeout(() => {
      handleEssayBlurOrAutoSave(questionId);
    }, 800);
  };

  const handleDeleteAnswer = async (questionId) => {
    const existing = answersMap[questionId];
    if (!existing?.answerId) {
      setAnswersMap(prev => ({ ...prev, [questionId]: { } }));
      return;
    }
    try {
      await deleteAnswer(existing.answerId);
      setAnswersMap(prev => ({ ...prev, [questionId]: { } }));
    } catch (e) {
      console.error('Xóa câu trả lời thất bại', e);
      alert('Không thể xóa câu trả lời.');
    }
  };


  const handleManualSubmit = async () => {
    if (finishing) return;
    setFinishing(true);
    try {
      await flushTrackBuffer();
      await finishExam(submissionId);
      navigate(`/student/exams/${examId}`, { state: { submissionId } });
    } catch (e) {
      console.error('Finish exam thất bại', e);
      alert('Không thể nộp bài. Vui lòng thử lại.');
      setFinishing(false);
    }
  };

  // Enhanced computed values
  const answeredCount = useMemo(() => {
    return Object.values(answersMap).filter(a => a?.value && a.value.toString().trim()).length;
  }, [answersMap]);

  const progressPercentage = useMemo(() => {
    return questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;
  }, [answeredCount, questions.length]);

  const getTimeColorClass = (ms) => {
    if (ms == null) return 'text-gray-500';
    const minutes = Math.floor(ms / (1000 * 60));
    if (minutes <= 5) return 'text-red-500 animate-pulse';
    if (minutes <= 10) return 'text-orange-500';
    return 'text-green-500';
  };

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl mb-4"></div>
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-2/3"></div>
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-4"></div>
                <div className="space-y-3">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-full"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Đang tải câu hỏi...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Có lỗi xảy ra</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative backdrop-blur-sm bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur text-white rounded-xl font-medium transition-all duration-200 border border-white/20"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center shadow-lg">
                    <Brain className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="text-white">
                    <h1 className="text-2xl font-bold">{exam?.title || 'Bài kiểm tra'}</h1>
                    <p className="text-blue-100 text-sm">Làm bài cẩn thận và kiểm tra lại trước khi nộp</p>
                  </div>
                </div>
              </div>

              {/* Timer and Progress */}
              <div className="text-right text-white">
                <div className="bg-white/20 backdrop-blur rounded-2xl p-4 border border-white/30 space-y-2">
                  <div className="flex items-center gap-2 justify-end">
                    <Timer className="w-5 h-5" />
                    <span className="text-sm font-medium">Thời gian còn lại</span>
                  </div>
                  <div className={`text-2xl font-bold font-mono ${getTimeColorClass(remainingMs)}`}>
                    {formatTime(remainingMs)}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4" />
                    <span>{answeredCount}/{questions.length} câu</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white/80 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                onClick={handleManualSubmit}
                disabled={finishing}
                className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {finishing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang nộp bài...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Nộp bài
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((q, idx) => {
            const answerValue = answersMap[q.id]?.value || '';
            const hasAnswer = answerValue && answerValue.toString().trim();

            return (
              <div key={q.id} className="group bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Question Header */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-semibold text-sm transition-colors ${
                        hasAnswer ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {hasAnswer ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-lg leading-relaxed">
                          Câu {idx + 1}: {q.content}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            {q.type === 'MULTIPLE_CHOICE' ? (
                              <>
                                <CircleCheckBig className="w-4 h-4 text-blue-500" />
                                <span className="text-xs text-blue-600 font-medium">Trắc nghiệm</span>
                              </>
                            ) : (
                              <>
                                <Edit3 className="w-4 h-4 text-purple-500" />
                                <span className="text-xs text-purple-600 font-medium">Tự luận</span>
                              </>
                            )}
                          </div>
                          {hasAnswer && (
                            <button
                              onClick={() => handleDeleteAnswer(q.id)}
                              className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              Xóa trả lời
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question Content */}
                <div className="p-6">
                  {q.type === 'MULTIPLE_CHOICE' ? (
                    <div className="space-y-3">
                      {q.options?.map((opt, i) => {
                        const id = `q-${q.id}-opt-${i}`;
                        const isSelected = answerValue === opt;
                        return (
                          <label
                            key={id}
                            htmlFor={id}
                            className={`group/option flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                              isSelected 
                                ? 'border-green-400 bg-green-50 shadow-sm ring-2 ring-green-200' 
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                            }`}
                          >
                            <div className={`relative flex-shrink-0 w-7 h-7 rounded-full border-2 transition-all duration-200 ${
                              isSelected 
                                ? 'border-green-500 bg-green-500' 
                                : 'border-gray-300 group-hover/option:border-blue-400'
                            }`}>
                              {isSelected && (
                                <CheckCircle className="w-full h-full text-white" />
                              )}
                              <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold ${
                                isSelected ? 'text-transparent' : 'text-gray-500'
                              }`}>
                                {letters[i]}
                              </div>
                            </div>
                            <input
                              id={id}
                              type="radio"
                              name={`question-${q.id}`}
                              value={opt}
                              checked={isSelected}
                              onChange={() => handleSelectOption(q.id, opt)}
                              className="sr-only"
                            />
                            <span className={`flex-1 leading-relaxed transition-colors ${
                              isSelected ? 'text-green-800 font-medium' : 'text-gray-700'
                            }`}>
                              {opt}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span>Nhập câu trả lời của bạn (tự động lưu sau 800ms)</span>
                      </div>
                      <div className="relative">
                        <textarea
                          value={answerValue}
                          onChange={(e) => handleEssayInput(q.id, e.target.value)}
                          onBlur={() => handleEssayBlurOrAutoSave(q.id)}
                          placeholder="Nhập câu trả lời của bạn tại đây..."
                          className="w-full min-h-32 p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all resize-y"
                          rows={4}
                        />
                        {hasAnswer && (
                          <div className="absolute bottom-3 right-3 flex items-center gap-2 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs">
                            <Save className="w-3 h-3" />
                            Đã lưu
                          </div>
                        )}
                      </div>
                      {answerValue && (
                        <div className="text-sm text-gray-500">
                          Số ký tự: {answerValue.length}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Summary */}
        {questions.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <span className="font-semibold text-gray-800">Tổng quan bài thi</span>
                </div>
                <div className="text-sm text-gray-600">
                  Đã trả lời {answeredCount}/{questions.length} câu hỏi ({progressPercentage}%)
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTimeColorClass(remainingMs)} bg-gray-100`}>
                  {formatTime(remainingMs)} còn lại
                </div>
                <button
                  onClick={handleManualSubmit}
                  disabled={finishing}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {finishing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang nộp...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Nộp bài
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Submissions;
