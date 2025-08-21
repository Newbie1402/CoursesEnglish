import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table/Table.jsx';
import { Input } from '@/components/ui/input/Input.jsx';
import { Select, SelectItem } from '@/components/ui/select/Select.jsx';
import useCourseService from '@/services/hooks/useCourseService';
import { formatDate } from "@/lib/utils.js";

const CourseList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const { getCourseList } = useCourseService();
  const teacherId = localStorage.getItem('teacherId');
  const { data: courses = [], isLoading, isError, error, refetch } = getCourseList(teacherId);

  // Tự động refetch mỗi 10 giây để kiểm tra có khóa học mới
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000); // 10 giây
    return () => clearInterval(interval);
  }, [refetch]);

  // Hàm xác định trạng thái khóa học dựa vào ngày bắt đầu, ngày kết thúc và ngày hiện tại
  const getCourseStatus = (startDate, endDate) => {
    if (!startDate || !endDate) return 'Chưa bắt đầu';
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (now < start) return 'Chưa bắt đầu';
    if (now > end) return 'Đã kết thúc';
    return 'Đang hoạt động';
  };

  // Xử lý filter và search theo trạng thái động
  const filteredCourses = courses
    .filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterStatus === 'all' ||
        (filterStatus === 'active' && getCourseStatus(course.startDate, course.endDate) === 'Đang hoạt động') ||
        (filterStatus === 'inactive' && getCourseStatus(course.startDate, course.endDate) === 'Đã kết thúc'))
    );

  const handleRowClick = (courseId) => {
    navigate(`/teacher/courses/${courseId}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Khóa học của tôi</h1>
        <button
          onClick={() => navigate('/teacher/courses/new')}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="mr-2" />
          Tạo khóa học
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm khóa học..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="active">Đang hoạt động</SelectItem>
          <SelectItem value="inactive">Đã kết thúc</SelectItem>
        </Select>
      </div>

      {/* Loading/Error */}
      {isLoading && <div className="text-center py-8 text-blue-600">Đang tải danh sách khóa học...</div>}
      {isError && <div className="text-center py-8 text-red-500">Lỗi tải dữ liệu: {error?.message || 'Không thể tải danh sách khóa học.'}</div>}

      {/* Table */}
      {!isLoading && !isError && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên khóa học</TableHead>
              <TableHead>Hình thức</TableHead>
              <TableHead>Ngày bắt đầu</TableHead>
              <TableHead>Ngày kết thúc</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Không có khóa học nào phù hợp.</TableCell>
              </TableRow>
            ) : (
              filteredCourses.map(course => (
                <TableRow
                  key={course.courseId}
                  className="cursor-pointer hover:bg-blue-50"
                  onClick={() => handleRowClick(course.courseId)}
                >
                  <TableCell>{course.title}</TableCell>
                  <TableCell>{course.online ? 'Online' : 'Offline'}</TableCell>
                  <TableCell>{formatDate(course.startDate)}</TableCell>
                  <TableCell>{formatDate(course.endDate)}</TableCell>
                  <TableCell>
                    {(() => {
                      const status = getCourseStatus(course.startDate, course.endDate);
                      if (status === 'Đang hoạt động') {
                        return <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs">{status}</span>;
                      }
                      if (status === 'Đã kết thúc') {
                        return <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">{status}</span>;
                      }
                      return <span className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs">{status}</span>;
                    })()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default CourseList;
