import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubmissionDetail, getSubmissionAnswer } from '@/services/hooks/submissionService';

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

  const formatDateTime = (iso) => {
    if (!iso) return '--';
    const d = new Date(iso);
    return d.toLocaleString(undefined, { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const renderMCAnswer = (a, index) => {
    const q = a.question || {};
    const options = q.options || [];
    const correctRaw = q.correctAnswer; // giờ BE trả về nội dung; vẫn hỗ trợ letter cũ
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    // Tìm index đáp án đúng: ưu tiên so khớp nội dung (case-insensitive), fallback nếu là letter đơn.
    let correctIndex = -1;
    if (typeof correctRaw === 'string') {
      const lower = correctRaw.trim().toLowerCase();
      correctIndex = options.findIndex(o => (o || '').trim().toLowerCase() === lower);
      if (correctIndex === -1 && correctRaw.length === 1) {
        const letterIdx = letters.indexOf(correctRaw.toUpperCase());
        if (letterIdx >= 0 && letterIdx < options.length) correctIndex = letterIdx;
      }
    }

    // Xác định lựa chọn của học viên (lưu bằng nội dung) – fallback nếu BE còn lưu letter.
    let studentIndex = options.findIndex(o => o === a.studentAnswer);
    if (studentIndex === -1 && typeof a.studentAnswer === 'string' && a.studentAnswer.length === 1) {
      const letterIdx = letters.indexOf(a.studentAnswer.toUpperCase());
      if (letterIdx >= 0 && letterIdx < options.length) studentIndex = letterIdx;
    }

    const isCorrect = a.isCorrect != null ? a.isCorrect : (studentIndex !== -1 && studentIndex === correctIndex);

    return (
      <div key={a.id} className="border rounded-xl p-4 bg-white shadow-sm space-y-3">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-gray-800">Câu {index + 1}: {q.content}</h4>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{isCorrect ? 'Đúng' : 'Sai'}</span>
        </div>
        <div className="space-y-2">
          {options.map((opt, i) => {
            const isCorrectOpt = i === correctIndex;
            const isStudentOpt = i === studentIndex;
            return (
              <div key={i} className={`flex items-start gap-2 text-sm rounded-lg border px-3 py-2 ${isCorrectOpt ? 'border-green-500 bg-green-50' : isStudentOpt && !isCorrectOpt ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
                <span className="font-mono text-xs pt-0.5">{letters[i] || i + 1}.</span>
                <span className="flex-1">{opt || <em className="text-gray-400">(Trống)</em>}</span>
                {isCorrectOpt && <span className="text-green-600 text-xs font-medium">Đáp án đúng</span>}
                {isStudentOpt && !isCorrectOpt && <span className="text-red-500 text-xs font-medium">Bạn chọn</span>}
                {isStudentOpt && isCorrectOpt && <span className="text-green-600 text-xs font-medium">Bạn chọn</span>}
              </div>
            );
          })}
        </div>
        {!isCorrect && correctIndex !== -1 && (
          <p className="text-xs text-gray-600">Đáp án đúng: <strong>{options[correctIndex] || '(Không xác định)'}</strong></p>
        )}
        <div className="text-xs text-gray-500">Điểm câu: {a.score != null ? `${a.score}/${q.maxScore}` : `0/${q.maxScore}`}</div>
      </div>
    );
  };

  const renderEssayAnswer = (a, index) => {
    const q = a.question || {};
    return (
      <div key={a.id} className="border rounded-xl p-4 bg-white shadow-sm space-y-3">
        <h4 className="font-semibold text-gray-800">Câu {index + 1}: {q.content}</h4>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{a.studentAnswer || <em className="text-gray-400">(Chưa trả lời)</em>}</p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
          <span><strong>Loại:</strong> Tự luận</span>
          <span><strong>Điểm:</strong> {a.score != null ? `${a.score}/${q.maxScore}` : `Chưa chấm / ${q.maxScore}`}</span>
        </div>
        {a.teacherFeedback && (
          <div className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md px-3 py-2">
            <strong>Nhận xét GV:</strong> {a.teacherFeedback}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Chi tiết bài nộp</h2>
        <button
          onClick={() => navigate(`/student/exams/${examId}`)}
          className="px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
        >Quay lại đề thi</button>
      </div>

      {submission && (
        <div className="bg-white border rounded-xl p-4 shadow-sm text-sm flex flex-wrap gap-x-8 gap-y-2">
          <span><strong>Mã bài nộp:</strong> {submission.id}</span>
          <span><strong>Bắt đầu:</strong> {formatDateTime(submission.startedAt)}</span>
          <span><strong>Nộp lúc:</strong> {formatDateTime(submission.submittedAt)}</span>
          <span><strong>Điểm tổng:</strong> {totalScore}</span>
        </div>
      )}

      {error && <div className="text-red-500 text-sm">{error}</div>}
      {loading && <div className="text-sm text-gray-500">Đang tải câu trả lời...</div>}

      {!loading && !answers.length && !error && (
        <div className="text-sm text-gray-500">Không có câu trả lời nào.</div>
      )}

      <div className="space-y-6">
        {answers.map((a, idx) => {
          const type = a.question?.type;
            if (type === 'MULTIPLE_CHOICE') return renderMCAnswer(a, idx);
            return renderEssayAnswer(a, idx);
        })}
      </div>
    </div>
  );
};

export default SubmissionDetail;

