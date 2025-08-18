import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table/Table';
import { Input } from '@/components/ui/input/Input';
import { Select, SelectItem } from '@/components/ui/select/Select';

const CourseList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('all');

  const courses = [
    {
      id: 1,
      name: 'Tiếng Anh Giao Tiếp Cơ Bản',
      totalLessons: 24,
      totalStudents: 45,
      progress: 75,
      status: 'active',
      lastUpdated: '2024-03-15'
    },
    {
      id: 2,
      name: 'Luyện Thi IELTS 6.5+',
      totalLessons: 36,
      totalStudents: 30,
      progress: 45,
      status: 'active',
      lastUpdated: '2024-03-14'
    },
    {
      id: 3,
      name: 'Tiếng Anh Cho Người Mất Gốc',
      totalLessons: 20,
      totalStudents: 50,
      progress: 90,
      status: 'completed',
      lastUpdated: '2024-03-10'
    }
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Đang diễn ra';
      case 'completed':
        return 'Đã hoàn thành';
      default:
        return 'Chưa bắt đầu';
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleRowClick = (courseId) => {
    navigate(`/teacher/courses/${courseId}`);
  };

  const filteredCourses = courses
    .filter(course =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterStatus === 'all' || course.status === filterStatus)
    );

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
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={filterStatus} onChange={handleFilterChange}>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Đang diễn ra</SelectItem>
            <SelectItem value="completed">Đã hoàn thành</SelectItem>
          </Select>
        </div>
      </div>

      {/* Course Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên khóa học</TableHead>
              <TableHead>Số bài học</TableHead>
              <TableHead>Học viên</TableHead>
              <TableHead>Tiến độ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Cập nhật</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.map((course) => (
              <TableRow
                key={course.id}
                onClick={() => handleRowClick(course.id)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <TableCell className="font-medium">{course.name}</TableCell>
                <TableCell>{course.totalLessons}</TableCell>
                <TableCell>{course.totalStudents}</TableCell>
                <TableCell>
                  <div className="w-full max-w-xs">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(course.status)}`}>
                    {getStatusText(course.status)}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {new Date(course.lastUpdated).toLocaleDateString('vi-VN')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CourseList;
