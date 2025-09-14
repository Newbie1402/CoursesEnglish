import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubmissionAnswer, getSubmissionDetail, gradeAnswer } from '@/services/hooks/submissionService';
import { getStudentDetail } from '@/services/hooks/studentService';
import { FaArrowLeft, FaRedoAlt, FaCheckCircle, FaTimesCircle, FaEye, FaEdit, FaSave } from 'react-icons/fa';

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
  const [submission, setSubmission] = useState(null); // chi tiết submission đ�� lấy score/maxScore
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStudent, setLoadingStudent] = useState(false);
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
      if (t === 'MULTIPLE_CHOICE') multiple++; else if (t === 'ESSAY') writing++;
      if (t === 'ESSAY' && typeof a.score === 'number' && !Number.isNaN(a.score)) gradedWriting++;
    }
    return { total, multiple, writing, gradedWriting };
  }, [answers]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaEye className="w-8 h-8 text-blue-600" />
                Câu trả lời chi tiết
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Tổng {stats.total} câu hỏi • {stats.multiple} trắc nghiệm • {stats.writing} tự luận
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={()=> setRefreshTick(t=> t+1)}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
              >
                <FaRedoAlt className="w-4 h-4" />
                Làm mới
              </button>
              <Link
                to={`/teacher/assignments/${examId}/submissions/${submissionId}`}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg"
              >
                <FaArrowLeft className="w-4 h-4" />
                Quay lại bài nộp
              </Link>
            </div>
          </div>
        </div>

        {/* Student Info Card */}
        {submission && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {studentData?.fullName ? studentData.fullName.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {loadingStudent ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-48 rounded"></div>
                  ) : (
                    studentData?.fullName || `Student #${submission.studentId}`
                  )}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 font-medium">Điểm tổng</p>
                <p className="text-2xl font-bold text-gray-900">
                  {submission?.score ?? '-'}
                  <span className="text-lg text-gray-400 ml-1">/ {submission?.maxScore ?? '-'}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaEye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Tổng câu</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FaCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Trắc nghiệm</p>
                <p className="text-2xl font-bold text-gray-900">{stats.multiple}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <span className="text-indigo-600 font-bold">★</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Đã chấm TL</p>
                <p className="text-2xl font-bold text-gray-900">{stats.gradedWriting}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">Lọc theo loại:</span>
            {[
              { value: 'ALL', label: 'Tất cả' },
              { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm' },
              { value: 'ESSAY', label: 'Tự luận' }
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilterType(value)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  filterType === value
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
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
              <FaTimesCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h3>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && filteredAnswers.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaEye className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không có câu trả lời</h3>
            <p className="text-gray-600">Chưa có dữ liệu câu trả lời cho bài nộp này.</p>
          </div>
        )}

        {/* Answers List */}
        <div className="space-y-6">
          {filteredAnswers.map((ans, idx) => {
            const q = ans.question || {};
            const isMC = q.type === 'MULTIPLE_CHOICE';
            const correctLetter = normalizeLetter(q.correctAnswer) || (typeof q.correctAnswer === 'number' ? letterFromIndex(q.correctAnswer) : null);
            const studentLetter = isMC ? detectStudentLetter(ans.studentAnswer, q.options || []) : null;
            const isCorrect = ans.isCorrect;
            const edit = localEdits[ans.id];

            return (
              <div key={ans.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    {/* Question Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">
                        {idx+1}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium">
                        {q.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : 'Tự luận'}
                      </span>
                      {isMC && (
                        <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-bold ${
                          isCorrect === null ? 'bg-gray-100 text-gray-500' : 
                          isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {isCorrect === null ? '---' : isCorrect ? 'Đúng' : 'Sai'}
                        </span>
                      )}
                    </div>

                    {/* Question Content */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-relaxed whitespace-pre-wrap">
                        {q.content || '---'}
                      </h3>
                    </div>

                    {/* Multiple Choice Options */}
                    {isMC && (
                      <div className="mb-4">
                        <div className="grid gap-2">
                          {(q.options || []).map((opt,i) => {
                            const letter = letterFromIndex(i);
                            const selected = studentLetter === letter;
                            const isRight = correctLetter === letter;
                            return (
                              <div key={i} className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 transition-all duration-200 ${
                                isRight ? 'border-emerald-300 bg-emerald-50' : 
                                selected ? 'border-rose-300 bg-rose-50' : 
                                'border-gray-200 bg-white hover:bg-gray-50'
                              }`}>
                                <span className={`font-mono text-sm font-bold mt-0.5 ${
                                  isRight ? 'text-emerald-600' : 
                                  selected ? 'text-rose-600' : 'text-gray-500'
                                }`}>
                                  {letter}.
                                </span>
                                <span className="flex-1 text-gray-700">{opt}</span>
                                {isRight && (
                                  <span className="bg-emerald-200 text-emerald-800 text-xs font-bold px-2 py-1 rounded-lg">
                                    Đáp án đúng
                                  </span>
                                )}
                                {!isRight && selected && (
                                  <span className="bg-rose-200 text-rose-800 text-xs font-bold px-2 py-1 rounded-lg">
                                    Đã chọn
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Writing Answer */}
                    {!isMC && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Bài làm của học viên:</p>
                        <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-4">
                          <p className="text-gray-700 whitespace-pre-wrap min-h-[60px]">
                            {ans.studentAnswer || (
                              <span className="text-gray-400 italic">Học viên chưa trả lời câu hỏi này</span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Writing Grading Section */}
                    {!isMC && (
                      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-semibold text-gray-700">
                              Điểm (0 - {q.maxScore}):
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              min={0}
                              max={q.maxScore}
                              value={edit?.score ?? (ans.score ?? '')}
                              onChange={e => handleChangeEdit(ans.id, 'score', e.target.value)}
                              className="w-24 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-center font-bold"
                              disabled={isSaving(ans.id)}
                            />
                          </div>
                          <button
                            onClick={()=> handleSave(ans)}
                            disabled={isSaving(ans.id) || !localEdits[ans.id]}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors duration-200"
                          >
                            <FaSave className="w-3 h-3" />
                            {isSaving(ans.id) ? 'Đang lưu...' : 'Lưu điểm'}
                          </button>
                          {ans.score != null && !localEdits[ans.id] && (
                            <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold">
                              Đã chấm: {ans.score}/{q.maxScore}
                            </span>
                          )}
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">
                            Nhận xét của giáo viên:
                          </label>
                          <textarea
                            rows={3}
                            value={edit?.feedback ?? (ans.teacherFeedback ?? '')}
                            onChange={e => handleChangeEdit(ans.id, 'feedback', e.target.value)}
                            disabled={isSaving(ans.id)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-y"
                            placeholder="Nhập nhận xét cho học viên..."
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Score Display for Multiple Choice */}
                  {isMC && (
                    <div className="w-32 text-center">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Điểm tối đa</p>
                        <p className="text-lg font-bold text-gray-900 mb-2">{q.maxScore ?? 0}</p>
                        {isCorrect != null && (
                          <p className={`text-sm font-bold ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isCorrect ? `+${q.maxScore || 0}` : '+0'}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubmissionAnswers;
