import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaCheck,
  FaClock,
  FaPlus,
  FaTh,
  FaList,
  FaCalendarAlt,
  FaUsers,
  FaClipboardList,
  FaArrowRight,
  FaEye,
  FaEdit,
  FaExclamationTriangle,
  FaChartBar,
  FaTasks,
  FaBookOpen,
  FaGraduationCap,
  FaPlay,
  FaCheckCircle,
  FaHourglassHalf
} from 'react-icons/fa';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table/Table';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import { Select } from '@/components/ui/select/Select';
import useAssignmentService from '../../../services/hooks/useAssignmentService';
import { getCourseDetails } from "@/services/hooks/courseService.js";
import { cn } from '@/lib/utils';

const AssignmentList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [courseDetails, setCourseDetails] = useState({});
  const navigate = useNavigate();
  const { getActiveExamsByTeacher } = useAssignmentService();
  const teacherId = localStorage.getItem('teacherId');
  const { data: activeExams = [] } = getActiveExamsByTeacher(teacherId);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      const details = {};
      for (const exam of activeExams) {
        const courseDetail = await getCourseDetails(exam.courseId);
        details[exam.courseId] = {
          title: courseDetail?.title || `Khóa học ID: ${exam.courseId}`,
          id: exam.courseId
        };
      }
      setCourseDetails(details);
    };

    fetchCourseDetails();
  }, [activeExams, getCourseDetails]);

  const assignments = useMemo(() => {
    return activeExams.map((exam) => ({
      id: exam.examId,
      title: exam.title,
      description: exam.description || 'Không có mô tả',
      course: courseDetails[exam.courseId]?.title || `Khóa học ID: ${exam.courseId}`,
      courseId: exam.courseId,
      dueDate: exam.endTime,
      startDate: exam.startTime,
      duration: exam.durationMinutes || 60,
      submissions: Math.floor(Math.random() * 25), // Mock data
      totalStudents: Math.floor(Math.random() * 30) + 20, // Mock data
      status: exam.active ? 'active' : 'inactive',
      type: exam.type || 'MULTIPLE_CHOICE',
      priority: exam.endTime && new Date(exam.endTime) - new Date() < 24 * 60 * 60 * 1000 ? 'high' : 'normal'
    }));
  }, [activeExams, courseDetails]);

  // Get time remaining until deadline
  const getTimeRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;

    if (diff < 0) return 'Đã hết hạn';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} ngày ${hours} giờ`;
    if (hours > 0) return `${hours} giờ`;
    return 'Sắp hết hạn';
  };

  // Filter and sort assignments
  const filteredAndSortedAssignments = useMemo(() => {
    return assignments
      .filter(assignment => {
        const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
        const matchesCourse = filterCourse === 'all' || assignment.courseId.toString() === filterCourse;
        return matchesSearch && matchesStatus && matchesCourse;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.startDate) - new Date(a.startDate);
          case 'oldest':
            return new Date(a.startDate) - new Date(b.startDate);
          case 'deadline':
            return new Date(a.dueDate) - new Date(b.dueDate);
          case 'name':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
  }, [assignments, searchTerm, filterStatus, filterCourse, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = assignments.length;
    const active = assignments.filter(a => a.status === 'active').length;
    const completed = assignments.filter(a => a.status === 'inactive').length;
    const urgent = assignments.filter(a => a.priority === 'high').length;

    return { total, active, completed, urgent };
  }, [assignments]);

  // Get unique courses for filter
  const uniqueCourses = useMemo(() => {
    const courses = Object.values(courseDetails).filter(Boolean);
    return [...new Map(courses.map(course => [course.id, course])).values()];
  }, [courseDetails]);

  const handleViewDetails = (examId) => {
    navigate(`/teacher/assignments/${examId}`);
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

  // Assignment Card Component
  const AssignmentCard = ({ assignment }) => {
    const timeRemaining = getTimeRemaining(assignment.dueDate);
    const submissionRate = assignment.totalStudents > 0 ?
      Math.round((assignment.submissions / assignment.totalStudents) * 100) : 0;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {assignment.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {assignment.description}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <FaBookOpen className="text-xs" />
                <span>{assignment.course}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaClock className="text-xs" />
                <span>{assignment.duration} phút</span>
              </div>
            </div>
          </div>

          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-medium ml-4",
            assignment.status === 'active' && "bg-green-100 text-green-700",
            assignment.status === 'inactive' && "bg-gray-100 text-gray-700"
          )}>
            {assignment.status === 'active' ? 'Đang diễn ra' : 'Đã kết thúc'}
          </div>
        </div>

        {/* Deadline & Priority */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-400 text-sm" />
            <span className="text-sm text-gray-600">
              Hạn: {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            assignment.priority === 'high' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
          )}>
            {timeRemaining}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Tỷ lệ nộp bài</span>
            <span className="font-medium text-gray-900">
              {assignment.submissions}/{assignment.totalStudents} ({submissionRate}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                submissionRate >= 80 ? "bg-green-500" :
                submissionRate >= 50 ? "bg-yellow-500" : "bg-red-500"
              )}
              style={{ width: `${submissionRate}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <FaUsers className="text-blue-500 mx-auto mb-1 text-sm" />
            <p className="text-xs text-gray-600">Học viên</p>
            <p className="font-semibold text-gray-900 text-sm">{assignment.totalStudents}</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <FaClipboardList className="text-green-500 mx-auto mb-1 text-sm" />
            <p className="text-xs text-gray-600">Đã nộp</p>
            <p className="font-semibold text-gray-900 text-sm">{assignment.submissions}</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <FaChartBar className="text-purple-500 mx-auto mb-1 text-sm" />
            <p className="text-xs text-gray-600">Loại</p>
            <p className="font-semibold text-gray-900 text-sm text-xs">
              {assignment.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : 'Tự luận'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            onClick={() => handleViewDetails(assignment.id)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            <FaEye className="text-xs" />
            Xem chi tiết
          </button>
          <button
            onClick={() => navigate(`/teacher/assignments/${assignment.id}/edit`)}
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
                <span className="text-gray-700 font-medium">Bài tập</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Quản lý bài tập
              </h1>
              <p className="text-gray-600">
                Tạo và quản lý các bài tập, kiểm tra cho học viên
              </p>
            </div>

            {/* Create Button */}
            <button
              onClick={() => navigate('/teacher/assignments/new')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <FaPlus className="w-4 h-4" />
              <span>Tạo bài tập mới</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng bài tập</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaTasks className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đang diễn ra</p>
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
                <p className="text-sm font-medium text-gray-600">Đã kết thúc</p>
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
                <p className="text-sm font-medium text-gray-600">Cần chú ý</p>
                <p className="text-3xl font-bold text-red-600">{stats.urgent}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <FaHourglassHalf className="text-red-600 text-xl" />
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
                  placeholder="Tìm kiếm bài tập..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-lg"
                />
              </div>

              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="min-w-[150px]"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang diễn ra</option>
                <option value="inactive">Đã kết thúc</option>
              </Select>

              <Select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="min-w-[150px]"
              >
                <option value="all">Tất cả khóa học</option>
                {uniqueCourses.map(course => (
                  <option key={course.id} value={course.id.toString()}>
                    {course.title}
                  </option>
                ))}
              </Select>

              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="min-w-[120px]"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="deadline">Hạn nộp</option>
                <option value="name">Theo tên</option>
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
        {assignments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTasks className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có bài tập nào
            </h3>
            <p className="text-gray-600 mb-6">
              Hãy tạo bài tập đầu tiên để bắt đầu đánh giá học viên.
            </p>
            <button
              onClick={() => navigate('/teacher/assignments/new')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tạo bài tập đầu tiên
            </button>
          </div>
        ) : filteredAndSortedAssignments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSearch className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy bài tập
            </h3>
            <p className="text-gray-600">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedAssignments.map(assignment => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên bài tập</TableHead>
                      <TableHead>Khóa học</TableHead>
                      <TableHead>Hạn nộp</TableHead>
                      <TableHead>Số bài nộp</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedAssignments.map((assignment) => (
                      <TableRow key={assignment.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold text-gray-900">{assignment.title}</p>
                            <p className="text-sm text-gray-500 truncate">{assignment.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FaBookOpen className="text-blue-500 text-sm" />
                            <span className="text-sm">{assignment.course}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">
                              {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
                            </p>
                            <p className={cn(
                              "text-xs",
                              assignment.priority === 'high' ? "text-red-600" : "text-gray-500"
                            )}>
                              {getTimeRemaining(assignment.dueDate)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {assignment.submissions}/{assignment.totalStudents}
                            </span>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className={cn(
                                  "h-2 rounded-full",
                                  assignment.totalStudents > 0 && (assignment.submissions / assignment.totalStudents) >= 0.8 ? "bg-green-500" :
                                  assignment.totalStudents > 0 && (assignment.submissions / assignment.totalStudents) >= 0.5 ? "bg-yellow-500" : "bg-red-500"
                                )}
                                style={{
                                  width: `${assignment.totalStudents > 0 ? (assignment.submissions / assignment.totalStudents) * 100 : 0}%`
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
                            assignment.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          )}>
                            {assignment.status === 'active' ? (
                              <>
                                <FaPlay className="w-3 h-3" />
                                Đang diễn ra
                              </>
                            ) : (
                              <>
                                <FaCheck className="w-3 h-3" />
                                Đã kết thúc
                              </>
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(assignment.id)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Xem chi tiết"
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/teacher/assignments/${assignment.id}/edit`)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Chỉnh sửa"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AssignmentList;