import React, { useEffect, useState, useMemo } from 'react';
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
import { getStudentsCourse } from '@/services/hooks/courseService';
import { getLessonOfCourse } from '@/services/hooks/lessonService';

const CourseList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [sortBy, setSortBy] = useState('newest');
  const { getCourseList } = useCourseService();
  const teacherId = localStorage.getItem('teacherId');
  const [studentsCountMap, setStudentsCountMap] = useState({}); // { courseId: count }
  const [lessonsCountMap, setLessonsCountMap] = useState({}); // { courseId: count }
  const [loadingCounts, setLoadingCounts] = useState(false);
  const { data: courses = [], isLoading, isError, error, refetch } = getCourseList(teacherId);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 6; // số khóa học mỗi trang (grid: 3 cột * 2 hàng)

  // Tự động refetch mỗi 10 giây để kiểm tra có khóa học mới
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Fetch counts (students & lessons) cho các course chưa có trong cache
  useEffect(() => {
    if (!courses || courses.length === 0) return;
    // Xác định những khóa học chưa có dữ liệu đếm
    const missing = courses.filter(c => studentsCountMap[c.courseId] == null || lessonsCountMap[c.courseId] == null);
    if (missing.length === 0) return; // Không cần fetch
    let cancelled = false;
    const fetchCounts = async () => {
      try {
        setLoadingCounts(true);
        const newStudents = {};
        const newLessons = {};
        await Promise.all(
          missing.map(async (course) => {
            const id = course.courseId;
            if (studentsCountMap[id] == null) {
              try {
                const students = await getStudentsCourse(id);
                newStudents[id] = Array.isArray(students) ? students.length : 0;
              } catch {
                newStudents[id] = 0;
              }
            }
            if (lessonsCountMap[id] == null) {
              try {
                const lessons = await getLessonOfCourse(id);
                const list = Array.isArray(lessons?.data) ? lessons.data : Array.isArray(lessons) ? lessons : [];
                newLessons[id] = list.length;
              } catch {
                newLessons[id] = 0;
              }
            }
          })
        );
        if (!cancelled) {
          // Hợp nhất vào state hiện tại (tránh ghi đè dữ liệu cũ vừa được cập nhật ở nơi khác)
          if (Object.keys(newStudents).length) {
            setStudentsCountMap(prev => ({ ...prev, ...newStudents }));
          }
          if (Object.keys(newLessons).length) {
            setLessonsCountMap(prev => ({ ...prev, ...newLessons }));
          }
        }
      } finally {
        if (!cancelled) setLoadingCounts(false);
      }
    };
    fetchCounts();
    return () => { cancelled = true; };
  }, [courses]);

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

  // Danh sách sau filter + sort (memo)
  const filteredAndSortedCourses = useMemo(() => {
    return courses
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
  }, [courses, searchTerm, filterStatus, sortBy]);

  // Reset trang khi filter/search thay đổi
  useEffect(() => { setCurrentPage(0); }, [searchTerm, filterStatus, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedCourses.length / pageSize));
  const paginatedCourses = filteredAndSortedCourses.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  useEffect(() => {
    if (currentPage >= totalPages) setCurrentPage(totalPages - 1);
  }, [totalPages, currentPage]);

  // Xử lý filter và search theo trạng thái động
  const filteredCourses = courses
    .filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterStatus === 'all' ||
        (filterStatus === 'active' && getCourseStatus(course.startDate, course.endDate) === 'Đang hoạt động') ||
        (filterStatus === 'inactive' && getCourseStatus(course.startDate, course.endDate) === 'Đã kết thúc') ||
        (filterStatus === 'upcoming' && getCourseStatus(course.startDate, course.endDate) === 'Chưa bắt đầu'))
    );

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
    const studentsCount = studentsCountMap[course.courseId];
    const lessonsCount = lessonsCountMap[course.courseId];

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group transform hover:scale-[1.02] relative overflow-hidden">
        {/* Decorative gradient bar */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1",
          status === 'Đang hoạt động' && "bg-gradient-to-r from-green-400 to-green-600",
          status === 'Đã kết thúc' && "bg-gradient-to-r from-blue-400 to-blue-600",
          status === 'Chưa bắt đầu' && "bg-gradient-to-r from-yellow-400 to-yellow-600"
        )} />

        {/* Course Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
              {course.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-500">
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
            "px-3 py-1 rounded-full text-xs font-medium shadow-sm",
            status === 'Đang hoạt động' && "bg-green-100 text-green-700 border border-green-200",
            status === 'Đã kết thúc' && "bg-blue-100 text-blue-700 border border-blue-200",
            status === 'Chưa bắt đầu' && "bg-yellow-100 text-yellow-700 border border-yellow-200"
          )}>
            {status}
          </div>
        </div>

        {/* Progress Bar */}
        {(status === 'Đang hoạt động' || status === 'Đã kết thúc') && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Tiến độ</span>
              <span className="font-medium text-gray-900">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-300 relative ${
                  status === 'Đã kết thúc' 
                    ? 'bg-gradient-to-r from-green-500 to-green-600' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
                }`}
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        {/* Course Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 group-hover:shadow-sm transition-shadow">
            <FaUsers className="text-blue-500 mx-auto mb-1 text-lg" />
            <p className="text-xs text-blue-600 font-medium">Học viên</p>
            <p className="font-bold text-blue-900 text-sm">{studentsCount == null ? '...' : studentsCount}</p>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 group-hover:shadow-sm transition-shadow">
            <FaBook className="text-green-500 mx-auto mb-1 text-lg" />
            <p className="text-xs text-green-600 font-medium">Bài học</p>
            <p className="font-bold text-green-900 text-sm">{lessonsCount == null ? '...' : lessonsCount}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/teacher/courses/${course.courseId}`);
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-[1.02]"
          >
            <FaEye className="text-xs" />
            Xem chi tiết
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative">
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
                    ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.' : 'Bạn chưa tạo khóa học nào. Hãy bắt đầu tạo khóa học ngay!'
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
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedCourses.map(course => (
                    <CourseCard key={course.courseId} course={course} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Trang {currentPage + 1} / {totalPages} · Tổng {filteredAndSortedCourses.length} khóa học
                      {loadingCounts && <span className="ml-2 text-blue-500">(đang tải thống kê)</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
                      >
                        <FaArrowLeft className="w-3 h-3" />
                        Trước
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                          let pageNumber;
                          if (totalPages <= 5) {
                            pageNumber = i;
                          } else {
                            const start = Math.max(0, currentPage - 2);
                            pageNumber = start + i;
                            if (pageNumber >= totalPages) return null;
                          }
                          const isActive = pageNumber === currentPage;
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => setCurrentPage(pageNumber)}
                              className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive 
                                  ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {pageNumber + 1}
                            </button>
                          );
                        })}
                        {totalPages > 5 && <span className="px-2 text-gray-500">...</span>}
                      </div>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage === totalPages - 1}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
                      >
                        Tiếp
                        <FaArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CourseList;

