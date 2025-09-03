import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubmissionsList } from '@/services/hooks/submissionService';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table/Table';
import { cn } from '@/lib/utils';

// Utils đơn giản format ngày giờ
const formatDateTime = (iso) => {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', {
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return iso;
  }
};

const calcDurationMinutes = (start, end) => {
  if (!start || !end) return '-';
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (Number.isNaN(s) || Number.isNaN(e)) return '-';
  const diff = Math.max(0, e - s);
  return Math.round(diff / 60000) + 'p';
};

const statusBadge = (deadline, submittedAt) => {
  if (!submittedAt) return 'Chưa nộp';
  if (!deadline) return 'Đã nộp';
  const dl = new Date(deadline).getTime();
  const sub = new Date(submittedAt).getTime();
  if (sub <= dl) return 'Đúng hạn';
  return 'Trễ hạn';
};

const statusColor = (status) => {
  switch (status) {
    case 'Đúng hạn':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
    case 'Trễ hạn':
      return 'bg-rose-50 text-rose-700 ring-rose-600/20';
    case 'Đã chấm':
      return 'bg-indigo-50 text-indigo-700 ring-indigo-600/20';
    case 'Chưa nộp':
      return 'bg-gray-50 text-gray-600 ring-gray-500/20';
    default:
      return 'bg-slate-50 text-slate-700 ring-slate-600/20';
  }
};

const SubmissionList = () => {
  const { examId } = useParams();
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'submittedAt', dir: 'desc' });
  const [refreshTick, setRefreshTick] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await getSubmissionsList(examId);
      setData(Array.isArray(res) ? res : []);
    } catch (e) {
      setError('Không tải được danh sách bài nộp.');
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => { fetchData(); }, [fetchData, refreshTick]);

  // Filter + sort
  useEffect(() => {
    let rows = [...data];
    if (search.trim()) {
      const kw = search.toLowerCase();
      rows = rows.filter(r => (
        String(r.studentId).toLowerCase().includes(kw) ||
        String(r.id).toLowerCase().includes(kw)
      ));
    }
    if (sort.key) {
      rows.sort((a,b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        if (av == null) return 1;
        if (bv == null) return -1;
        if (av === bv) return 0;
        if (sort.dir === 'asc') return av > bv ? 1 : -1;
        return av < bv ? 1 : -1;
      });
    }
    setFiltered(rows);
  }, [data, search, sort]);

  const handleSort = (key) => {
    setSort(prev => {
      if (prev.key === key) {
        return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      }
      return { key, dir: 'asc' };
    });
  };

  const summary = useMemo(() => {
    const graded = data.filter(d => typeof d.score === 'number' && !Number.isNaN(d.score));
    return {
      total: data.length,
      graded: graded.length,
      avg: graded.length ? (graded.reduce((s,c)=> s + c.score, 0) / graded.length).toFixed(2) : '-'
    };
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Bài nộp kỳ thi #{examId}</h1>
          <p className="text-sm text-gray-500 mt-1">Tổng quan bài nộp sinh viên và trạng thái chấm điểm.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRefreshTick(t => t + 1)}
            className="inline-flex items-center gap-1 rounded-md bg-white border border-gray-200 px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <span className="i-lucide-refresh-cw" />Tải lại
          </button>
          <Link
            to={-1}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >Quay lại</Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Tổng số bài nộp</p>
            <p className="mt-1 text-2xl font-semibold">{summary.total}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Đã chấm</p>
          <p className="mt-1 text-2xl font-semibold">{summary.graded}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Điểm TB</p>
          <p className="mt-1 text-2xl font-semibold">{summary.avg}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo studentId hoặc ID bài nộp..."
            className="w-72 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none"
          />
          {search && (
            <button onClick={()=> setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">✕</button>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Sắp xếp:</span>
          {['submittedAt','score','studentId'].map(k => (
            <button
              key={k}
              onClick={()=> handleSort(k)}
              className={cn('rounded px-2 py-1 border text-gray-600 hover:bg-gray-50', sort.key===k ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-gray-200')}
            >{k}</button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/60">
              <TableHead className="w-16">#</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Sinh viên</TableHead>
              <TableHead>Bắt đầu</TableHead>
              <TableHead>Nộp</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Thời gian làm</TableHead>
              <TableHead>Điểm</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Feedback</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={11} className="py-10 text-center text-sm text-gray-500">Đang tải dữ liệu...</TableCell>
              </TableRow>
            )}
            {!loading && error && (
              <TableRow>
                <TableCell colSpan={11} className="py-10 text-center text-sm text-red-500">{error}</TableCell>
              </TableRow>
            )}
            {!loading && !error && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} className="py-10 text-center text-sm text-gray-500">Không có bài nộp.</TableCell>
              </TableRow>
            )}
            {!loading && !error && filtered.map((row, idx) => {
              const st = statusBadge(row.deadline, row.submittedAt);
              const graded = typeof row.score === 'number' && !Number.isNaN(row.score);
              const finalStatus = graded ? 'Đã chấm' : st;
              return (
                <TableRow key={row.id} className="hover:bg-blue-50/30">
                  <TableCell className="font-mono text-xs text-gray-500">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{row.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">Student #{row.studentId}</span>
                      <span className="text-[10px] text-gray-400">exam: {row.examId}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{formatDateTime(row.startedAt)}</TableCell>
                  <TableCell className="text-xs">{formatDateTime(row.submittedAt)}</TableCell>
                  <TableCell className="text-xs">{formatDateTime(row.deadline)}</TableCell>
                  <TableCell className="text-xs">{calcDurationMinutes(row.startedAt, row.submittedAt)}</TableCell>
                  <TableCell>
                    {graded ? (
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        {row.score} / {row.maxScore}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 ring-1 ring-inset ring-gray-300/50">- / {row.maxScore}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset', statusColor(finalStatus))}>{finalStatus}</span>
                  </TableCell>
                  <TableCell className="max-w-[180px] text-xs truncate" title={row.teacherFeedback || ''}>{row.teacherFeedback || <span className="text-gray-400">(Chưa có)</span>}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/teacher/assignments/${examId}/submissions/${row.id}`} className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">Xem</Link>
                      <button className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50" disabled={graded}>Chấm</button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SubmissionList;
