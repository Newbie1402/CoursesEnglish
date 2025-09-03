import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubmissionDetail } from '@/services/hooks/submissionService';
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
  return Math.round((e - s)/60000) + ' phút';
};

const SubmissionDetail = () => {
  const { examId, submissionId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await getSubmissionDetail(submissionId);
      setData(res || null);
    } catch (e) {
      setError('Không tải được chi tiết bài nộp.');
    } finally { setLoading(false); }
  }, [submissionId]);

  useEffect(()=> { fetchDetail(); }, [fetchDetail]);

  const statusInfo = useMemo(()=> {
    if (!data) return { label: '-', color: 'bg-gray-100 text-gray-600 ring-gray-300/50' };
    const { submittedAt, deadline, score } = data;
    if (!submittedAt) return { label: 'Chưa nộp', color: 'bg-gray-50 text-gray-600 ring-gray-400/30' };
    const submitted = new Date(submittedAt).getTime();
    const dead = deadline ? new Date(deadline).getTime() : null;
    let label = 'Đã nộp';
    if (dead) label = submitted <= dead ? 'Đúng hạn' : 'Trễ hạn';
    if (typeof score === 'number' && !Number.isNaN(score)) label = 'Đã chấm';
    const mapping = {
      'Đúng hạn': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
      'Trễ hạn': 'bg-rose-50 text-rose-700 ring-rose-600/20',
      'Đã chấm': 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
      'Chưa nộp': 'bg-gray-50 text-gray-600 ring-gray-400/30',
      'Đã nộp': 'bg-slate-50 text-slate-700 ring-slate-600/20'
    };
    return { label, color: mapping[label] || mapping['Đã nộp'] };
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Chi tiết bài nộp</h1>
          <p className="text-sm text-gray-500 mt-1">Submission #{submissionId} - Exam #{examId}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchDetail} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50">Làm mới</button>
          <Link to={`/teacher/assignments/${examId}/submissions`} className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500">Quay lại danh sách</Link>
        </div>
      </div>

      {loading && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Đang tải...</div>
      )}
      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}
      {!loading && !error && !data && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Không có dữ liệu.</div>
      )}
      {!loading && !error && data && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-800">Thông tin chung</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Trạng thái & thời gian</p>
                </div>
                <span className={cn('inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset', statusInfo.color)}>{statusInfo.label}</span>
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-gray-500 text-xs uppercase tracking-wide">Submission ID</dt>
                  <dd className="font-medium">{data.id}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-xs uppercase tracking-wide">Student ID</dt>
                  <dd className="font-medium">{data.studentId}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-xs uppercase tracking-wide">Exam ID</dt>
                  <dd className="font-medium">{data.examId}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-xs uppercase tracking-wide">Max Score</dt>
                  <dd className="font-medium">{data.maxScore}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-xs uppercase tracking-wide">Bắt đầu</dt>
                  <dd className="font-mono text-xs">{formatDateTime(data.startedAt)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-xs uppercase tracking-wide">Nộp lúc</dt>
                  <dd className="font-mono text-xs">{formatDateTime(data.submittedAt)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-xs uppercase tracking-wide">Deadline</dt>
                  <dd className="font-mono text-xs">{formatDateTime(data.deadline)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-xs uppercase tracking-wide">Thời lượng làm bài</dt>
                  <dd className="font-medium text-xs">{diffMinutes(data.startedAt, data.submittedAt)}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-800">Điểm & Feedback</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Kết quả chấm hiện tại</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Điểm</p>
                  <p className="mt-1 text-lg font-semibold">{(typeof data.score === 'number' && !Number.isNaN(data.score)) ? data.score : <span className="text-gray-400">Chưa chấm</span>} <span className="text-sm text-gray-400">/ {data.maxScore}</span></p>
                </div>
                <div className="flex-1 min-w-[240px]">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Feedback giáo viên</p>
                  <div className="mt-1 rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 min-h-[60px] whitespace-pre-wrap">
                    {data.teacherFeedback || <span className="text-gray-400">(Chưa có)</span>}
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-dashed border-gray-200 text-xs text-gray-500">
                So sánh deadline: {data.submittedAt ? (new Date(data.submittedAt) <= new Date(data.deadline) ? 'Nộp đúng hạn' : 'Nộp trễ') : 'Chưa nộp'}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Hành động</h3>
              <div className="flex flex-col gap-2">
                <Link to={`/teacher/assignments/${examId}/submissions/${submissionId}/answers`} className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500">Xem câu trả lời</Link>
                <Link to={`/teacher/assignments/${examId}/submissions`} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 text-gray-700">Quay lại danh sách</Link>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-5 text-xs text-gray-500">
              <p className="font-medium text-gray-700 mb-2">Thông tin thêm</p>
              <p>Trạng thái hiển thị dựa trên submittedAt so với deadline. Nếu đã có điểm sẽ hiển thị "Đã chấm".</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionDetail;