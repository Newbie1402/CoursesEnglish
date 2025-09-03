import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubmissionAnswer, getSubmissionDetail, gradeAnswer } from '@/services/hooks/submissionService';

const letterFromIndex = (i) => String.fromCharCode(65 + i);

const normalizeLetter = (val) => {
  if (!val) return null;
  if (/^[A-Z]$/i.test(val.trim())) return val.trim().toUpperCase();
  return null;
};

const detectStudentLetter = (studentAnswer, options) => {
  if (!studentAnswer) return null;
  const letter = normalizeLetter(studentAnswer);
  if (letter) return letter;
  // try match by option text
  const idx = options.findIndex(o => o.toLowerCase().trim() === studentAnswer.toLowerCase().trim());
  if (idx >= 0) return letterFromIndex(idx);
  return null;
};

const SubmissionAnswers = () => {
  const { examId, submissionId } = useParams();
  const [answers, setAnswers] = useState([]);
  const [submission, setSubmission] = useState(null); // chi tiết submission để lấy score/maxScore
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savingIds, setSavingIds] = useState([]);
  const [localEdits, setLocalEdits] = useState({});
  const [filterType, setFilterType] = useState('ALL');
  const [refreshTick, setRefreshTick] = useState(0);

  const fetchAnswers = useCallback(async () => {
    try {
      const res = await getSubmissionAnswer(submissionId);
      setAnswers(Array.isArray(res) ? res : []);
    } catch (e) {
      setError('Không tải được danh sách câu trả lời.');
    }
  }, [submissionId]);

  const fetchSubmissionDetail = useCallback(async () => {
    try {
      const res = await getSubmissionDetail(submissionId);
      setSubmission(res || null);
    } catch (e) {
      setError('Không tải được thông tin bài nộp.');
    }
  }, [submissionId]);

  const fetchAll = useCallback(async () => {
    setLoading(true); setError('');
    await Promise.all([fetchAnswers(), fetchSubmissionDetail()]);
    setLoading(false);
  }, [fetchAnswers, fetchSubmissionDetail]);

  useEffect(() => { fetchAll(); }, [fetchAll, refreshTick]);

  const handleChangeEdit = (answerId, field, value) => {
    setLocalEdits(prev => ({
      ...prev,
      [answerId]: {
        score: prev[answerId]?.score ?? '',
        feedback: prev[answerId]?.feedback ?? '',
        ...{ [field]: value }
      }
    }));
  };

  const handleSave = async (answer) => {
    const edit = localEdits[answer.id];
    if (!edit) return;
    const scoreVal = edit.score === '' ? null : Number(edit.score);
    if (scoreVal == null || Number.isNaN(scoreVal)) {
      alert('Điểm không hợp lệ');
      return;
    }
    if (scoreVal < 0 || scoreVal > answer.question.maxScore) {
      alert(`Điểm phải trong khoảng 0 - ${answer.question.maxScore}`);
      return;
    }
    try {
      setSavingIds(ids => [...ids, answer.id]);
      await gradeAnswer(answer.id, scoreVal, edit.feedback || '');
      // Cập nhật local
      setAnswers(prev => prev.map(a => a.id === answer.id ? { ...a, score: scoreVal, teacherFeedback: edit.feedback || '' } : a));
      setLocalEdits(prev => { const cp = { ...prev }; delete cp[answer.id]; return cp; });
    } catch (e) {
      alert('Lưu thất bại');
    } finally {
      setSavingIds(ids => ids.filter(id => id !== answer.id));
    }
  };

  const isSaving = (id) => savingIds.includes(id);

  const filteredAnswers = useMemo(() => {
    if (filterType === 'ALL') return answers;
    return answers.filter(a => a.question?.type === filterType);
  }, [answers, filterType]);

  const stats = useMemo(() => {
    const total = answers.length;
    let multiple = 0; let writing = 0; let gradedWriting = 0;
    for (const a of answers) {
      const t = a.question?.type;
      if (t === 'MULTIPLE_CHOICE') multiple++; else if (t === 'WRITING') writing++;
      if (t === 'WRITING' && typeof a.score === 'number' && !Number.isNaN(a.score)) gradedWriting++;
    }
    return { total, multiple, writing, gradedWriting };
  }, [answers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Câu trả lời Submission #{submissionId}</h1>
          <p className="text-sm text-gray-500 mt-1">Exam #{examId} • Tổng {stats.total} câu hỏi</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=> setRefreshTick(t=> t+1)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50">Làm mới</button>
          <Link to={`/teacher/assignments/${examId}/submissions/${submissionId}`} className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500">Quay lại bài nộp</Link>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Tổng câu</p>
          <p className="mt-1 text-2xl font-semibold">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Trắc nghiệm</p>
          <p className="mt-1 text-2xl font-semibold">{stats.multiple}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Tự luận</p>
          <p className="mt-1 text-2xl font-semibold">{stats.writing}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Điểm tổng (submission)</p>
          <p className="mt-1 text-lg font-semibold">{submission?.score ?? '-'} <span className="text-sm text-gray-400">/ {submission?.maxScore ?? '-'}</span></p>
        </div>
      </div>

      {loading && <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Đang tải...</div>}
      {!loading && error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}
      {!loading && !error && filteredAnswers.length === 0 && <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Không có câu trả lời.</div>}

      <div className="space-y-5">
        {filteredAnswers.map((ans, idx) => {
          const q = ans.question || {};
          const isMC = q.type === 'MULTIPLE_CHOICE';
          const correctLetter = normalizeLetter(q.correctAnswer) || (typeof q.correctAnswer === 'number' ? letterFromIndex(q.correctAnswer) : null);
          const studentLetter = isMC ? detectStudentLetter(ans.studentAnswer, q.options || []) : null;
          const isCorrect = isMC ? (studentLetter && correctLetter && studentLetter === correctLetter) : null;
          const edit = localEdits[ans.id];
          return (
            <div key={ans.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-medium">{idx+1}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{q.type || 'N/A'}</span>
                    {isMC && (
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${isCorrect === null ? 'bg-gray-50 text-gray-500' : isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{isCorrect === null ? '---' : isCorrect ? 'Đúng' : 'Sai'}</span>
                    )}
                  </div>
                  <p className="font-medium text-gray-800 leading-snug mb-3 whitespace-pre-wrap">{q.content || '---'}</p>

                  {isMC && (
                    <ul className="space-y-1 mb-3">
                      {(q.options || []).map((opt,i) => {
                        const letter = letterFromIndex(i);
                        const selected = studentLetter === letter;
                        const isRight = correctLetter === letter;
                        return (
                          <li key={i} className={`flex items-start gap-2 rounded border px-3 py-2 text-sm ${isRight ? 'border-emerald-300 bg-emerald-50' : selected ? 'border-rose-300 bg-rose-50' : 'border-gray-200 bg-white'}`}>
                            <span className={`font-mono text-xs mt-0.5 ${isRight ? 'text-emerald-600' : selected ? 'text-rose-600' : 'text-gray-500'}`}>{letter}.</span>
                            <span className="flex-1 text-gray-700">{opt}</span>
                            {isRight && <span className="text-emerald-600 text-[10px] font-medium">Đáp án đúng</span>}
                            {!isRight && selected && !isCorrect && <span className="text-rose-600 text-[10px] font-medium">Chọn</span>}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {!isMC && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Bài làm của học viên:</p>
                      <div className="rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-wrap">{ans.studentAnswer || <span className="text-gray-400">(Trống)</span>}</div>
                    </div>
                  )}

                  {isMC && !isCorrect && studentLetter && correctLetter && (
                    <div className="mb-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2 inline-block">Đáp án đúng: {correctLetter}</div>
                  )}

                  {isMC && !studentLetter && (
                    <div className="mb-3 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded px-3 py-2 inline-block">Học viên không chọn đáp án hợp lệ.</div>
                  )}

                  {/* WRITING grading */}
                  {!isMC && (
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="text-xs font-medium text-gray-500">Điểm (0 - {q.maxScore}):</label>
                        <input
                          type="number"
                          step="0.1"
                          min={0}
                          max={q.maxScore}
                          value={edit?.score ?? (ans.score ?? '')}
                          onChange={e => handleChangeEdit(ans.id, 'score', e.target.value)}
                          className="w-28 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none"
                          disabled={isSaving(ans.id)}
                        />
                        <button
                          onClick={()=> handleSave(ans)}
                          disabled={isSaving(ans.id) || !localEdits[ans.id]}
                          className="text-xs rounded-md bg-blue-600 text-white px-3 py-1 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500"
                        >{isSaving(ans.id) ? 'Đang lưu...' : 'Lưu điểm'}</button>
                        {ans.score != null && !localEdits[ans.id] && <span className="text-xs text-emerald-600 font-medium">Đã chấm: {ans.score}/{q.maxScore}</span>}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Feedback giáo viên:</p>
                        <textarea
                          rows={3}
                          value={edit?.feedback ?? (ans.teacherFeedback ?? '')}
                          onChange={e => handleChangeEdit(ans.id, 'feedback', e.target.value)}
                          disabled={isSaving(ans.id)}
                          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none resize-y"
                          placeholder="Nhận xét..."
                        />
                      </div>
                    </div>
                  )}
                </div>
                {/* Aside score for MC */}
                {isMC && (
                  <div className="w-28 flex flex-col items-end gap-2 text-right">
                    <span className="text-[10px] uppercase tracking-wide text-gray-400">Điểm tối đa</span>
                    <span className="text-sm font-semibold text-gray-700">{q.maxScore ?? 0}</span>
                    {isCorrect != null && (
                      <span className={`text-xs font-medium ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>{isCorrect ? `+${q.maxScore || 0}` : '+0'}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubmissionAnswers;
