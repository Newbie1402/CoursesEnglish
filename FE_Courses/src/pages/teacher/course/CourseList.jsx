import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaTh,
  FaList,
  FaCalendarAlt,
  FaUsers,
  FaBook,
  FaClock,
  FaChartLine,
  FaEye,
  FaEdit,
  FaGraduationCap,
  FaArrowRight,
  FaPlay,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table/Table.jsx';
import { Input } from '@/components/ui/input/Input.jsx';
import { Select, SelectItem } from '@/components/ui/select/Select.jsx';
import useCourseService from '@/services/hooks/useCourseService';
import { formatDate, cn } from "@/lib/utils.js";

const CourseList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [sortBy, setSortBy] = useState('newest');
  const { getCourseList } = useCourseService();
  const teacherId = localStorage.getItem('teacherId');
  const { data: courses = [], isLoading, isError, error, refetch } = getCourseList(teacherId);

  // Tự động refetch mỗi 10 giây để kiểm tra có khóa học mới
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);
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

  // Calculate progress percentage
  const getProgress = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (now < start) return 0;
    if (now >= end) return 100;
    const total = end - start;
    const current = now - start;
    return Math.round((current / total) * 100);
  };

  // Xử lý filter và search theo trạng thái động
  const filteredAndSortedCourses = courses
    .filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterStatus === 'all' ||
        (filterStatus === 'active' && getCourseStatus(course.startDate, course.endDate) === 'Đang hoạt động') ||
        (filterStatus === 'inactive' && getCourseStatus(course.startDate, course.endDate) === 'Đã kết thúc') ||
        (filterStatus === 'upcoming' && getCourseStatus(course.startDate, course.endDate) === 'Chưa bắt đầu'))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.startDate) - new Date(a.startDate);
        case 'oldest':
          return new Date(a.startDate) - new Date(b.startDate);
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const handleRowClick = (courseId) => {
    navigate(`/teacher/courses/${courseId}`);
  };

  // Stats calculation
  const stats = {
    total: courses.length,
    active: courses.filter(c => getCourseStatus(c.startDate, c.endDate) === 'Đang hoạt động').length,
    completed: courses.filter(c => getCourseStatus(c.startDate, c.endDate) === 'Đã kết thúc').length,
    upcoming: courses.filter(c => getCourseStatus(c.startDate, c.endDate) === 'Chưa bắt đầu').length
  };

  // Loading skeleton component
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-6 bg-gray-300 rounded-full w-20"></div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        <div className="h-3 bg-gray-300 rounded w-1/3"></div>
        <div className="h-2 bg-gray-300 rounded w-full"></div>
      </div>
    </div>
  );

  // Course Card Component
  const CourseCard = ({ course }) => {
    const status = getCourseStatus(course.startDate, course.endDate);
    const progress = getProgress(course.startDate, course.endDate);

    return (
      <div
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group transform hover:scale-[1.02]"
        onClick={() => handleRowClick(course.courseId)}
      >
        {/* Course Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {course.title}
            </h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <FaCalendarAlt className="text-xs" />
                <span>{formatDate(course.startDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaClock className="text-xs" />
                <span>{course.online ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-medium",
            status === 'Đang hoạt động' && "bg-green-100 text-green-700",
            status === 'Đã kết thúc' && "bg-blue-100 text-blue-700",
            status === 'Chưa bắt đầu' && "bg-yellow-100 text-yellow-700"
          )}>
            {status}
          </div>
        </div>

        {/* Progress Bar */}
        {status === 'Đang hoạt động' && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Tiến độ</span>
              <span className="font-medium text-gray-900">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Course Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <FaUsers className="text-blue-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Học viên</p>
            <p className="font-semibold text-gray-900">--</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <FaBook className="text-green-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Bài học</p>
            <p className="font-semibold text-gray-900">--</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <FaChartLine className="text-purple-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Đánh giá</p>
            <p className="font-semibold text-gray-900">--</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/teacher/courses/${course.courseId}`);
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            <FaEye className="text-xs" />
            Xem chi tiết
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/teacher/courses/${course.courseId}/edit`);
            }}
            className="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            <FaEdit className="text-xs" />
            Chỉnh sửa
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title & Breadcrumb */}
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span>Dashboard</span>
                <FaArrowRight className="text-xs" />
                <span className="text-gray-700 font-medium">Khóa học</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Khóa học của tôi
              </h1>
              <p className="text-gray-600">
                Quản lý và theo dõi tất cả khóa học bạn đang giảng dạy
              </p>
            </div>

            {/* Create Button */}
            <button
              onClick={() => navigate('/teacher/courses/new')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <FaPlus className="w-4 h-4" />
              <span>Tạo khóa học mới</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng khóa học</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaGraduationCap className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FaPlay className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã hoàn thành</p>
                <p className="text-3xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaCheckCircle className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sắp diễn ra</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.upcoming}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm khóa học..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-lg"
                />
              </div>

              <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
                <SelectItem value="inactive">Đã kết thúc</SelectItem>
              </Select>

              <Select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
                <SelectItem value="name">Theo tên</SelectItem>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-md transition-all duration-200",
                  viewMode === 'grid'
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <FaTh className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  "p-2 rounded-md transition-all duration-200",
                  viewMode === 'table'
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <FaList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {isError && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle className="text-red-500 text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Lỗi tải dữ liệu</h3>
            <p className="text-gray-600 mb-4">{error?.message || 'Không thể tải danh sách khóa học.'}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {filteredAndSortedCourses.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaGraduationCap className="text-gray-400 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm || filterStatus !== 'all' ? 'Không tìm thấy khóa học' : 'Chưa có khóa học nào'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterStatus !== 'all'
                    ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                    : 'Hãy tạo khóa học đầu tiên để bắt đầu giảng dạy.'
                  }
                </p>
                {(!searchTerm && filterStatus === 'all') && (
                  <button
                    onClick={() => navigate('/teacher/courses/new')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Tạo khóa học đầu tiên
                  </button>
                )}
              </div>
            ) : (
              <div className={cn(
                "grid gap-6",
                viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "w-full"
              )}>
                {filteredAndSortedCourses.map(course => (
                  viewMode === 'grid' ? (
                    <CourseCard key={course.courseId} course={course} />
                  ) : (
                    <TableRow
                      key={course.courseId}
                      onClick={() => handleRowClick(course.courseId)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <div className={cn(
                              "w-12 h-12 rounded-full flex items-center justify-center",
                              status === 'Đang hoạt động' && "bg-green-100",
                              status === 'Đã kết thúc' && "bg-blue-100",
                              status === 'Chưa bắt đầu' && "bg-yellow-100"
                            )}>
                              {status === 'Đang hoạt động' && <FaPlay className="text-green-600" />}
                              {status === 'Đã kết thúc' && <FaCheckCircle className="text-blue-600" />}
                              {status === 'Chưa bắt đầu' && <FaClock className="text-yellow-600" />}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{course.title}</p>
                            <p className="text-xs text-gray-500">
                              <span className="mr-2">
                                <FaCalendarAlt className="inline-block" />
                                {formatDate(course.startDate)}
                              </span>
                              <span>
                                <FaClock className="inline-block" />
                                {course.online ? 'Online' : 'Offline'}
                              </span>
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-4 text-center">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">Học viên</span>
                          <span className="font-semibold text-gray-900">--</span>
                        </div>
                      </TableCell>
                      <TableCell className="p-4 text-center">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">Bài học</span>
                          <span className="font-semibold text-gray-900">--</span>
                        </div>
                      </TableCell>
                      <TableCell className="p-4 text-center">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">Đánh giá</span>
                          <span className="font-semibold text-gray-900">--</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CourseList;
