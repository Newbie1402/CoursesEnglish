import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubmissionsList } from '@/services/hooks/submissionService';
import { getStudentDetail } from '@/services/hooks/studentService';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table/Table';
import { FaRedoAlt, FaArrowLeft, FaUser, FaClipboardList, FaCheckCircle, FaClock, FaSearch, FaTimes } from 'react-icons/fa';
import { cn } from '@/lib/utils';

// Utils format ngày giờ
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

  // Tính toán phút và giây
  const totalSeconds = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Hiển thị theo format phù hợp
  if (minutes === 0) {
    return `${seconds} giây`;
  } else if (minutes < 60) {
    return seconds > 0 ? `${minutes} phút ${seconds} giây` : `${minutes} phút`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} giờ ${remainingMinutes} phút`;
  }
};

// Cập nhật logic status theo yêu cầu
const getSubmissionStatus = (submittedAt, score, deadline) => {
  // Đang làm: submittedAt = null
  if (!submittedAt) {
    return { status: 'Đang làm', color: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' };
  }

  // Đã chấm: score != 0
  if (typeof score === 'number' && !Number.isNaN(score) && score !== 0) {
    return { status: 'Đã chấm', color: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20' };
  }

  // Đã nộp: submittedAt != null && score == null
  if (!deadline) {
    return { status: 'Đã nộp', color: 'bg-blue-50 text-blue-700 ring-blue-600/20' };
  }

  const dl = new Date(deadline).getTime();
  const sub = new Date(submittedAt).getTime();

  if (sub <= dl) {
    return { status: 'Đúng hạn', color: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' };
  }

  return { status: 'Trễ hạn', color: 'bg-rose-50 text-rose-700 ring-rose-600/20' };
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
  const [studentsCache, setStudentsCache] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSubmissionsList(examId);
      setData(Array.isArray(res) ? res : []);
    } catch (e) {
      setError('Không tải được danh sách bài nộp.');
    } finally {
      setLoading(false);
    }
  }, [examId]);

  // Fetch student details
  const fetchStudentDetail = useCallback(async (studentId) => {
    if (studentsCache[studentId] || loadingStudents.has(studentId)) {
      return;
    }

    setLoadingStudents(prev => new Set([...prev, studentId]));
    try {
      const studentDetail = await getStudentDetail(studentId);
      setStudentsCache(prev => ({
        ...prev,
        [studentId]: studentDetail
      }));
    } catch (error) {
      console.error(`Failed to fetch student ${studentId}:`, error);
      setStudentsCache(prev => ({
        ...prev,
        [studentId]: { fullName: `Student #${studentId}`, error: true }
      }));
    } finally {
      setLoadingStudents(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
    }
  }, [studentsCache, loadingStudents]);

  // Fetch student details for all submissions
  useEffect(() => {
    const uniqueStudentIds = [...new Set(data.map(item => item.studentId))];
    uniqueStudentIds.forEach(studentId => {
      if (studentId && !studentsCache[studentId]) {
        fetchStudentDetail(studentId);
      }
    });
  }, [data, fetchStudentDetail, studentsCache]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTick]);

  // Filter + sort
  useEffect(() => {
    let rows = [...data];
    if (search.trim()) {
      const kw = search.toLowerCase();
      rows = rows.filter(r => {
        const student = studentsCache[r.studentId];
        const studentName = student?.fullName || '';
        return (
          String(r.studentId).toLowerCase().includes(kw) ||
          String(r.id).toLowerCase().includes(kw) ||
          studentName.toLowerCase().includes(kw)
        );
      });
    }
    if (sort.key) {
      rows.sort((a, b) => {
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
  }, [data, search, sort, studentsCache]);

  const handleSort = (key) => {
    setSort(prev => {
      if (prev.key === key) {
        return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      }
      return { key, dir: 'asc' };
    });
  };

  // Tổng hợp thống kê cải thiện
  const summary = useMemo(() => {
    const total = data.length;
    const submitted = data.filter(d => d.submittedAt).length; // Đã nộp bài
    const graded = data.filter(d => typeof d.score === 'number' && !Number.isNaN(d.score)).length;
    const inProgress = data.filter(d => !d.submittedAt).length; // Đang làm

    const gradedItems = data.filter(d => typeof d.score === 'number' && !Number.isNaN(d.score));
    const avgScore = gradedItems.length ? (gradedItems.reduce((s, c) => s + c.score, 0) / gradedItems.length).toFixed(1) : '-';

    return {
      total,
      submitted,
      graded,
      inProgress,
      avgScore,
      submissionRate: total > 0 ? ((submitted / total) * 100).toFixed(1) : '0'
    };
  }, [data]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaClipboardList className="w-8 h-8 text-blue-600" />
                Danh sách bài nộp
              </h1>
              <p className="text-gray-600 mt-2">Quản lý và theo dõi tiến độ làm bài của học viên</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRefreshTick(t => t + 1)}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
              >
                <FaRedoAlt className="w-4 h-4" />
                Tải lại
              </button>
              <Link
                to={-1}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg"
              >
                <FaArrowLeft className="w-4 h-4" />
                Quay lại
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaUser className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Tổng học viên</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FaCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Đã nộp bài</p>
                <p className="text-2xl font-bold text-gray-900">{summary.submitted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FaClipboardList className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Đã chấm</p>
                <p className="text-2xl font-bold text-gray-900">{summary.graded}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <FaClock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Đang làm</p>
                <p className="text-2xl font-bold text-gray-900">{summary.inProgress}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <span className="text-indigo-600 font-bold">%</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Tỷ lệ nộp</p>
                <p className="text-2xl font-bold text-gray-900">{summary.submissionRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-emerald-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span className="text-emerald-600 font-bold text-lg">★</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Điểm TB</p>
                <p className="text-2xl font-bold text-gray-900">{summary.avgScore}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm theo tên, studentId hoặc ID bài nộp..."
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all duration-200"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 font-medium">Sắp xếp:</span>
              {[
                { key: 'submittedAt', label: 'Thời gian nộp' },
                { key: 'score', label: 'Điểm' },
                { key: 'studentId', label: 'Student ID' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleSort(key)}
                  className={cn(
                    'px-3 py-2 rounded-lg border-2 font-medium transition-all duration-200',
                    sort.key === key
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                  )}
                >
                  {label} {sort.key === key && (sort.dir === 'asc' ? '↑' : '↓')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-bold text-gray-900">#</TableHead>
                <TableHead className="font-bold text-gray-900">Học viên</TableHead>
                <TableHead className="font-bold text-gray-900">Bắt đầu</TableHead>
                <TableHead className="font-bold text-gray-900">Nộp bài</TableHead>
                <TableHead className="font-bold text-gray-900">Deadline</TableHead>
                <TableHead className="font-bold text-gray-900">Thời gian làm</TableHead>
                <TableHead className="font-bold text-gray-900">Điểm</TableHead>
                <TableHead className="font-bold text-gray-900">Trạng thái</TableHead>
                <TableHead className="text-right font-bold text-gray-900">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={10} className="py-12 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-gray-600">Đang tải dữ liệu...</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!loading && error && (
                <TableRow>
                  <TableCell colSpan={10} className="py-12 text-center text-red-500 font-medium">{error}</TableCell>
                </TableRow>
              )}
              {!loading && !error && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="py-12 text-center text-gray-500">
                    {search ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có bài nộp nào'}
                  </TableCell>
                </TableRow>
              )}
              {!loading && !error && filtered.map((row, idx) => {
                const statusInfo = getSubmissionStatus(row.submittedAt, row.score, row.deadline);
                const student = studentsCache[row.studentId];
                const isInProgress = !row.submittedAt; // Đang làm bài

                return (
                  <TableRow key={row.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <TableCell className="font-mono text-sm font-medium text-gray-600">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {student?.fullName || `Student #${row.studentId}`}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{formatDateTime(row.startedAt)}</TableCell>
                    <TableCell className="text-sm text-gray-600">{formatDateTime(row.submittedAt)}</TableCell>
                    <TableCell className="text-sm text-gray-600">{formatDateTime(row.deadline)}</TableCell>
                    <TableCell className="text-sm font-medium text-gray-900">{calcDurationMinutes(row.startedAt, row.submittedAt)}</TableCell>
                    <TableCell>
                      {typeof row.score === 'number' && !Number.isNaN(row.score) ? (
                        <span className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 ring-2 ring-emerald-600/20">
                          {row.score} / {row.maxScore}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium text-gray-500 ring-2 ring-gray-300/50">
                          - / {row.maxScore}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={cn('inline-flex items-center rounded-lg px-3 py-1 text-sm font-medium ring-2 ring-inset', statusInfo.color)}>
                        {statusInfo.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        to={`/teacher/assignments/${examId}/submissions/${row.id}`}
                        className={cn(
                          'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                          isInProgress
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                        )}
                        onClick={isInProgress ? (e) => e.preventDefault() : undefined}
                        title={isInProgress ? 'Học viên chưa nộp bài' : 'Xem chi tiết bài nộp'}
                      >
                        Chi tiết
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default SubmissionList;
