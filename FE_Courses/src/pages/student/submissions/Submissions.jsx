import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getQuestions } from '@/services/hooks/assignmentService';
import { createAnswers, updateAnswer, deleteAnswer, finishExam } from '@/services/hooks/submissionService';
import { trackChoiceActionBatch, getSubmissionDetail } from '@/services/hooks/submissionService';
import { getAssignmentDetails } from '@/services/hooks/assignmentService';
import { useAuth } from '@/contexts/AuthContext.jsx';

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
  const startedAtRef = useRef(Date.now());
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
      // Không push lại để tránh vòng lặp; chấp nhận mất log trong trường hợp lỗi.
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

  const handleManualSubmit = async () => {
    if (!window.confirm('Bạn chắc chắn muốn nộp bài?')) return;
    await autoFinish();
  };

  useEffect(() => {
    const beforeUnload = (e) => {
      if (trackBufferRef.current.length) {
        // cố gắng flush sync (không đảm bảo) – fetch beacon có thể tốt hơn nếu bổ sung
        flushTrackBuffer();
      }
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      flushTrackBuffer();
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    };
  }, [flushTrackBuffer]);

  const allAnsweredCount = useMemo(() => Object.values(answersMap).filter(a => a?.value)?.length, [answersMap]);

  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!exam) return <div className="p-6">Đang tải thông tin bài kiểm tra...</div>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 p-4 bg-white rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          <p className="text-gray-500 text-sm">Trả lời: {allAnsweredCount}/{questions.length}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-lg font-mono font-semibold px-4 py-2 bg-gray-900 text-green-400 rounded-lg shadow-inner">
            {formatTime(remainingMs)}
          </div>
          <button
            onClick={handleManualSubmit}
            disabled={finishing}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {finishing ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </div>
      </div>

      {loading ? (
        <p>Đang tải câu hỏi...</p>
      ) : (
        <div className="space-y-6">
          {questions.map((q, idx) => {
            const answerValue = answersMap[q.id]?.value || '';
            return (
              <div key={q.id} className="bg-white border rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">Câu {idx + 1}: {q.content}</h3>
                  {answerValue && (
                    <button
                      onClick={() => handleDeleteAnswer(q.id)}
                      className="text-xs text-red-500 hover:underline"
                    >Xóa trả lời</button>
                  )}
                </div>
                {q.type === 'MULTIPLE_CHOICE' ? (
                  <div className="grid gap-2">
                    {q.options?.map((opt, i) => {
                      const id = `q-${q.id}-opt-${i}`;
                      return (
                        <label key={id} htmlFor={id} className={`flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50 ${answerValue === opt ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                          <input
                            id={id}
                            type="radio"
                            name={`question-${q.id}`}
                            value={opt}
                            checked={answerValue === opt}
                            onChange={() => handleSelectOption(q.id, opt)}
                            className="accent-green-600"
                          />
                          <span className="text-sm text-gray-700">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[140px]"
                      placeholder="Nhập câu trả lời..."
                      value={answerValue}
                      onChange={(e) => handleEssayInput(q.id, e.target.value)}
                      onBlur={() => handleEssayBlurOrAutoSave(q.id)}
                    />
                    <p className="text-xs text-gray-500">Tự động lưu sau khi dừng gõ 0.8s hoặc khi rời khỏi ô.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Submissions;
