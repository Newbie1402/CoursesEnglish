import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getAssignmentDetails } from "@/services/hooks/assignmentService";
import { startExam, getSubmissionDetail } from "@/services/hooks/submissionService";
import { useAuth} from "@/contexts/AuthContext.jsx";

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

  const formatDateTime = (iso) => {
    if (!iso) return "--";
    const d = new Date(iso);
    return d.toLocaleString(undefined, { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
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

  if (loadingExam) return <p className="p-6">Đang tải đề thi...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!exam) return <p className="p-6">Không tìm thấy đề thi.</p>;

  const showStartButton = !submission; // chưa có submission nào
  const showResumeButton = submission && !submission.submittedAt; // đang làm dở
  const showSubmittedLabel = submission?.submittedAt; // đã nộp xong

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">{exam.title}</h2>
        <p className="text-gray-600">{exam.description}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
          <span><strong>Bắt đầu:</strong> {formatDateTime(exam.startTime)}</span>
            <span><strong>Kết thúc:</strong> {formatDateTime(exam.endTime)}</span>
            {exam.durationMinutes != null && <span><strong>Thời lượng:</strong> {exam.durationMinutes} phút</span>}
            <span><strong>Loại:</strong> {exam.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : exam.type === 'WRITING' ? 'Tự luận' : exam.type}</span>
            <span><strong>Trạng thái:</strong> {statusLabel}</span>
        </div>
      </div>

      {exam.password && showStartButton && (
        <div className="space-y-1">
          <label className="block text-sm font-medium">Mật khẩu (nếu yêu cầu)</label>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập mật khẩu..."
          />
        </div>
      )}

      <div className="pt-4 flex gap-4 items-center">
        {showStartButton && (
          <button
            disabled={!canStart || starting}
            onClick={handleStart}
            className={`px-6 py-3 rounded-xl font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed ${canStart ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'}`}
          >
            {starting ? 'Đang bắt đầu...' : 'Bắt đầu làm bài'}
          </button>
        )}
        {showResumeButton && (
          <button
            onClick={handleResume}
            className="px-6 py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
          >Tiếp tục làm bài</button>
        )}
        {showSubmittedLabel && (
          <>
            <span className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 text-sm font-medium border border-emerald-200">Đã nộp bài</span>
            <button
              onClick={handleViewDetail}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
            >Xem chi tiết bài nộp</button>
          </>
        )}
      </div>

      {loadingSubmission && <div className="text-sm text-gray-500">Đang tải kết quả bài nộp...</div>}
      {showSubmittedLabel && submission && (
        <div className="mt-6 p-4 border rounded-xl bg-white shadow-sm space-y-2">
          <h3 className="font-semibold text-lg">Kết quả bài nộp</h3>
          <div className="text-sm flex flex-col gap-1">
            <span><strong>Mã bài nộp:</strong> {submission.id}</span>
            <span><strong>Thời gian bắt đầu:</strong> {formatDateTime(submission.startedAt)}</span>
            <span><strong>Thời gian nộp:</strong> {submission.submittedAt ? formatDateTime(submission.submittedAt) : '--'}</span>
            <span><strong>Hạn chót:</strong> {formatDateTime(submission.deadline)}</span>
            <span><strong>Điểm:</strong> {submission.score != null ? `${submission.score}/${submission.maxScore ?? '--'}` : 'Chưa chấm'}</span>
            {submission.teacherFeedback && (
              <span><strong>Nhận xét GV:</strong> {submission.teacherFeedback}</span>
            )}
            {isLate && (
              <span className="text-red-600 font-medium">Nộp trễ</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamDetail;
