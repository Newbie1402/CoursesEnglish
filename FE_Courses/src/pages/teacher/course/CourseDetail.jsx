import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaUserGraduate,
  FaBook,
  FaClipboardList,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaChartLine,
  FaGraduationCap,
  FaTasks,
  FaEye,
  FaFileAlt,
  FaAward,
  FaLaptop,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaExclamationTriangle,
  FaCalendarWeek
} from 'react-icons/fa';
import {formatDate, getProgress} from "@/lib/utils.js";
import useCourseService from "@/services/hooks/useCourseService.js";
import CourseUpdate from './CourseUpdate.jsx';
import { useToast } from '@/components/ui/toast/Toast.jsx';
import Modal from '@/components/ui/modal/Modal.jsx';
import LessonCreate from '../lessons/LessonCreate.jsx';
import LessonDetail from '../lessons/LessonDetail.jsx';
import useLessonService from "@/services/hooks/useLessonService.js";
import useAssignmentService from '@/services/hooks/useAssignmentService';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('overview');
  const [showUpdateModal, setShowUpdateModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [showCreateLessonModal, setShowCreateLessonModal] = React.useState(false);
  const [selectedLesson, setSelectedLesson] = React.useState(null);

  const { getCourseDetail, deleteCourse, getStudentListByCourse } = useCourseService();
  const { getLessonList } = useLessonService();
  const { getExamsByCourse } = useAssignmentService();
  const { data: course, isLoading, isError, error, refetch } = getCourseDetail(courseId);
  const { mutate: handleDeleteCourse, isLoading: isDeleting } = deleteCourse;
  const { data: lessons = [], isLoading: isLoadingLessons, isError: isErrorLessons, refetch: refetchLessons } = getLessonList(courseId);
  const { data: students = [], isLoading: isLoadingStudents, isError: isErrorStudents } = getStudentListByCourse(courseId);
  const { data: examsByCourse = [] } = getExamsByCourse(courseId);
  const { addToast } = useToast();

  // Mapping functions for schedule data
  const getDayOfWeekText = (dayOfWeek) => {
    const dayMap = {
      'MONDAY': 'Thứ 2',
      'TUESDAY': 'Thứ 3',
      'WEDNESDAY': 'Thứ 4',
      'THURSDAY': 'Thứ 5',
      'FRIDAY': 'Thứ 6',
      'SATURDAY': 'Thứ 7',
      'SUNDAY': 'Chủ nhật'
    };
    return dayMap[dayOfWeek] || dayOfWeek;
  };

  const getTimeSlotText = (timeSlot) => {
    const timeSlotMap = {
      'SLOT_1': '06:45 - 09:15',
      'SLOT_2': '09:25 - 11:55',
      'SLOT_3': '12:10 - 13:00',
      'SLOT_4': '14:50 - 17:20',
      'SLOT_5': '17:30 - 20:00',
      'SLOT_6': '20:10 - 21:50'
    };
    return timeSlotMap[timeSlot] || timeSlot;
  };

  const getTimeSlotColor = (timeSlot) => {
    const colorMap = {
      'SLOT_1': 'bg-blue-50 text-blue-700 border-blue-200',
      'SLOT_2': 'bg-green-50 text-green-700 border-green-200',
      'SLOT_3': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'SLOT_4': 'bg-purple-50 text-purple-700 border-purple-200',
      'SLOT_5': 'bg-pink-50 text-pink-700 border-pink-200',
      'SLOT_6': 'bg-indigo-50 text-indigo-700 border-indigo-200'
    };
    return colorMap[timeSlot] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  // Enhanced stats with better calculations
  const stats = [
    {
      label: 'Tổng học viên',
      value: students?.length || 0,
      icon: <FaUsers className="w-6 h-6 text-blue-500" />,
      color: 'blue',
      bgColor: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Bài học',
      value: lessons?.length || 0,
      icon: <FaBook className="w-6 h-6 text-green-500" />,
      color: 'green',
      bgColor: 'from-green-500 to-green-600'
    },
    {
      label: 'Bài kiểm tra',
      value: examsByCourse?.length || 0,
      icon: <FaClipboardList className="w-6 h-6 text-purple-500" />,
      color: 'purple',
      bgColor: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Tiến độ',
      value: `${getProgress(course?.startDate, course?.endDate)}%`,
      icon: <FaChartLine className="w-6 h-6 text-orange-500" />,
      color: 'orange',
      bgColor: 'from-orange-500 to-orange-600'
    }
  ];

  // Tab configuration with icons
  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: FaEye },
    { id: 'lessons', label: 'Bài học', icon: FaBook },
    { id: 'assignments', label: 'Bài tập', icon: FaTasks },
    { id: 'students', label: 'Học viên', icon: FaUsers }
  ];

  // Hàm tính số ngày giữa 2 ngày (yyyy-MM-dd)
  const getDaysBetween = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.max(0, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1);
  };

  const handleEdit = () => setShowUpdateModal(true);
  const handleCloseUpdate = () => setShowUpdateModal(false);
  const handleUpdateSuccess = () => {
    refetch();
  };

  const handleDelete = () => setShowDeleteModal(true);
  const handleCloseDelete = () => setShowDeleteModal(false);
  const handleConfirmDelete = () => {
    handleDeleteCourse(course.courseId, {
      onSuccess: () => {
        addToast('Xóa khóa học thành công!', 'success');
        setShowDeleteModal(false);
        navigate('/teacher/courses');
      },
      onError: () => {
        addToast('Xóa khóa học thất bại!', 'error');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải thông tin khóa học...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h3>
          <p className="text-red-600 mb-4">{error?.message || 'Không thể tải thông tin khóa học.'}</p>
          <button
            onClick={() => navigate('/teacher/courses')}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBook className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy khóa học</h3>
          <p className="text-gray-600 mb-4">Khóa học này có thể đã bị xóa hoặc không tồn tại.</p>
          <button
            onClick={() => navigate('/teacher/courses')}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          {/* Back button and breadcrumb */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/teacher/courses')}
              className="flex items-center gap-2 text-white hover:text-blue-100 transition-colors duration-200"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span className="font-medium">Quay lại</span>
            </button>
            <div className="flex items-center gap-2 text-blue-100">
              <FaGraduationCap className="w-4 h-4" />
              <span>Khóa học</span>
              <span>/</span>
              <span className="text-white font-medium">Chi tiết</span>
            </div>
          </div>

          {/* Course header info */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <FaBook className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white">{course.title}</h1>
                  <div className="flex items-center gap-4 mt-2 text-blue-100">
                    <div className="flex items-center gap-1">
                      {course.online ? <FaLaptop className="w-4 h-4 text-blue-500" /> : <FaMapMarkerAlt className="w-4 h-4 text-green-500" />}
                      <span className="text-sm">{course.online ? 'Online' : 'Offline'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt className="w-4 h-4" />
                      <span className="text-sm">{formatDate(course.startDate)} - {formatDate(course.endDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-blue-100 text-lg leading-relaxed max-w-3xl">
                {course.description}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                className="flex items-center gap-2 px-6 py-3 bg-white bg-opacity-20 text-white rounded-xl hover:bg-opacity-30 transition-all duration-200 transform hover:scale-105 backdrop-blur-sm"
                onClick={handleEdit}
              >
                <FaEdit className="w-4 h-4" />
                Chỉnh sửa
              </button>
              <button
                className="flex items-center gap-2 px-6 py-3 bg-red-500 bg-opacity-80 text-white rounded-xl hover:bg-red-600 transition-all duration-200 transform hover:scale-105"
                onClick={handleDelete}
              >
                <FaTrash className="w-4 h-4" />
                Xóa khóa học
              </button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white bg-opacity-5 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 -mt-16 relative z-10 mb-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              <div className={`h-2 bg-gradient-to-r ${stat.bgColor}`}></div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex overflow-x-auto">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-3 py-4 px-6 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap relative overflow-hidden group ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className={`absolute inset-0 opacity-0 transition-opacity duration-300 bg-gradient-to-r from-blue-500 to-purple-600 ${
                    activeTab !== id && 'group-hover:opacity-5'
                  }`} />

                  <Icon className={`w-5 h-5 z-10 transition-transform duration-200 ${
                    activeTab === id && 'scale-110'
                  }`} />
                  <span className="z-10">{label}</span>

                  {activeTab === id && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-blue-500 rounded-full" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Course Progress */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaChartLine className="w-5 h-5 text-blue-600" />
                    Tiến độ khóa học
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {getDaysBetween(course.startDate, course.endDate)}
                      </div>
                      <p className="text-gray-600">Tổng số ngày</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {getProgress(course.startDate, course.endDate)}%
                      </div>
                      <p className="text-gray-600">Đã hoàn thành</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-1">
                        {Math.max(0, 100 - getProgress(course.startDate, course.endDate))}%
                      </div>
                      <p className="text-gray-600">Còn lại</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-700">Tiến độ tổng thể</span>
                      <span className="font-bold text-blue-600">{getProgress(course.startDate, course.endDate)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${getProgress(course.startDate, course.endDate)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Course Schedule Section */}
                {course?.schedules && course.schedules.length > 0 && (
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <FaCalendarWeek className="w-5 h-5 text-orange-600" />
                      Lịch học khóa học
                    </h3>

                    {/* Schedule Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {course.schedules.map((schedule, index) => (
                        <div
                          key={schedule.id || index}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${getTimeSlotColor(schedule.timeSlot)}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="w-4 h-4" />
                              <span className="font-bold text-sm">
                                {getDayOfWeekText(schedule.dayOfWeek)}
                              </span>
                            </div>
                            <div className="text-xs font-medium opacity-75">
                              Tiết {schedule.timeSlot.replace('SLOT_', '')}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <FaClock className="w-4 h-4" />
                            <span className="font-semibold text-sm">
                              {getTimeSlotText(schedule.timeSlot)}
                            </span>
                          </div>

                          {schedule.timeRange && schedule.timeRange !== getTimeSlotText(schedule.timeSlot) && (
                            <div className="text-xs opacity-75 mt-1 pl-6">
                              {schedule.timeRange}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Schedule Summary */}
                    <div className="mt-6 p-4 bg-white bg-opacity-50 rounded-xl">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">
                          Tổng số buổi học trong tuần:
                        </span>
                        <span className="font-bold text-orange-700">
                          {course.schedules.length} buổi
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="font-medium text-gray-700">
                          Các ngày trong tuần:
                        </span>
                        <span className="font-bold text-orange-700">
                          {course.schedules
                            .map(s => getDayOfWeekText(s.dayOfWeek))
                            .join(', ')
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Course Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Course Information */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <FaFileAlt className="w-5 h-5 text-green-600" />
                      Thông tin khóa học
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Hình thức học</span>
                        <div className="flex items-center gap-2">
                          {course.online ? <FaLaptop className="w-4 h-4 text-blue-500" /> : <FaMapMarkerAlt className="w-4 h-4 text-green-500" />}
                          <span className="font-semibold">{course.online ? 'Học Online' : 'Học Offline'}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Ngày bắt đầu</span>
                        <span className="font-semibold text-blue-600">{formatDate(course.startDate)}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Ngày kết thúc</span>
                        <span className="font-semibold text-red-600">{formatDate(course.endDate)}</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-gray-600 font-medium">Thời lượng</span>
                        <span className="font-semibold text-purple-600">{getDaysBetween(course.startDate, course.endDate)} ngày</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <FaAward className="w-5 h-5 text-purple-600" />
                      Thao tác nhanh
                    </h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowCreateLessonModal(true)}
                        className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <FaPlus className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-blue-900">Thêm bài học mới</p>
                          <p className="text-sm text-blue-600">Tạo nội dung học tập</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab('students')}
                        className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <FaUsers className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-green-900">Quản lý học viên</p>
                          <p className="text-sm text-green-600">Xem danh sách {students?.length || 0} học viên</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab('assignments')}
                        className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <FaTasks className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-purple-900">Tạo bài kiểm tra</p>
                          <p className="text-sm text-purple-600">Đánh giá tiến độ học viên</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'lessons' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <FaBook className="w-6 h-6 text-blue-600" />
                      Danh sách bài học
                    </h2>
                    <p className="text-gray-600 mt-1">Quản lý nội dung và tài liệu học tập</p>
                  </div>
                  <button
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    onClick={() => setShowCreateLessonModal(true)}
                  >
                    <FaPlus className="w-4 h-4" />
                    Thêm bài học mới
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  {isLoadingLessons ? (
                    <div className="p-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Đang tải danh sách bài học...</p>
                    </div>
                  ) : isErrorLessons ? (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaExclamationTriangle className="w-8 h-8 text-red-500" />
                      </div>
                      <p className="text-red-600 font-medium">Lỗi khi tải danh sách bài học</p>
                    </div>
                  ) : lessons.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaBook className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có bài học nào</h3>
                      <p className="text-gray-600 mb-4">Hãy tạo bài học đầu tiên cho khóa học này</p>
                      <button
                        onClick={() => setShowCreateLessonModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                      >
                        Tạo bài học đầu tiên
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tên bài học
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ngày tạo
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Trạng thái
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Thao tác
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {lessons.map((lesson) => (
                            <tr key={lesson.lessonId}
                                onClick={() => setSelectedLesson(lesson)}
                                className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                                    <FaFileAlt className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
                                    <div className="text-sm text-gray-500">Bài học #{lesson.lessonId}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {lesson.uploadedAt ? formatDate(lesson.uploadedAt) : 'Chưa rõ'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  lesson.active 
                                    ? 'bg-green-100 text-green-800 border border-green-200' 
                                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                }`}>
                                  {lesson.active ? 'Hoạt động' : 'Ẩn'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => setSelectedLesson(lesson)}
                                  className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                                >
                                  Xem chi tiết
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

        {activeTab === 'assignments' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <FaTasks className="w-6 h-6 text-purple-600" />
                      Danh sách bài kiểm tra
                    </h2>
                    <p className="text-gray-600 mt-1">Quản lý và theo dõi các bài kiểm tra của khóa học</p>
                  </div>
                  <button
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    onClick={() => navigate('/teacher/assignments/new')}
                  >
                    <FaPlus className="w-4 h-4" />
                    Thêm bài kiểm tra mới
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  {examsByCourse?.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaTasks className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có bài kiểm tra nào</h3>
                      <p className="text-gray-600 mb-4">Hãy tạo bài kiểm tra đầu tiên cho khóa học này</p>
                      <button
                        onClick={() => navigate('/teacher/assignments/new')}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
                      >
                        Tạo bài kiểm tra đầu tiên
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tên bài kiểm tra
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thời lượng
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Thời gian
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Trạng thái
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Thao tác
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {examsByCourse.map((exam)=> {
                            const now = new Date();
                            const startTime = new Date(exam.startTime);
                            const endTime = new Date(exam.endTime);

                            let status = 'upcoming';
                            let statusColor = 'gray';
                            let statusText = 'Sắp diễn ra';

                            if (now >= startTime && now <= endTime) {
                              status = 'active';
                              statusColor = 'green';
                              statusText = 'Đang diễn ra';
                            } else if (now > endTime) {
                              status = 'completed';
                              statusColor = 'blue';
                              statusText = 'Đã kết thúc';
                            }

                            return (
                              <tr key={exam.examId}
                                  onClick={() => navigate(`/teacher/assignments/${exam.examId}`)}
                                  className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
                                      <FaClipboardList className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                                      <div className="text-sm text-gray-500">
                                        {exam.type === "MULTIPLE_CHOICE" ? 'Trắc nghiệm' : 'Tự luận'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {exam.durationMinutes ? (exam.durationMinutes) : 'Chưa rõ'} phút
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-green-600">
                                      <FaCalendarAlt className="w-3 h-3" />
                                      <span className="text-xs font-medium">
                                        {new Date(exam.startTime).toLocaleDateString('vi-VN')} {new Date(exam.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-red-600">
                                      <FaClock className="w-3 h-3" />
                                      <span className="text-xs font-medium">
                                        {new Date(exam.endTime).toLocaleDateString('vi-VN')} {new Date(exam.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                    statusColor === 'green' 
                                      ? 'bg-green-100 text-green-800 border border-green-200' 
                                      : statusColor === 'blue'
                                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                                  }`}>
                                    {statusText}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex items-center gap-2">
                                      <button
                                          onClick={(e ) => {e.stopPropagation(); navigate(`/teacher/assignments/${exam.examId}/submissions`);}}
                                          className="text-green-600 hover:text-green-900 transition-colors duration-200"
                                          title="Xem bài nộp"
                                      >
                                          Xem bài nộp
                                      </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <FaUsers className="w-6 h-6 text-green-600" />
                      Danh sách học viên
                    </h2>
                    <p className="text-gray-600 mt-1">Quản lý và theo dõi tiến độ học viên</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaUserGraduate className="w-4 h-4" />
                    <span className="font-medium">{students?.length || 0} học viên đã đăng ký</span>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  {isLoadingStudents ? (
                    <div className="p-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Đang tải danh sách học viên...</p>
                    </div>
                  ) : students.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaUsers className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có học viên nào</h3>
                      <p className="text-gray-600">Các học viên sẽ xuất hiện ở đây khi họ đăng ký khóa học</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                      {students.map((student) => (
                        <div key={student.userId} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                              <FaUserGraduate className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {student.fullName || 'Chưa cập nhật tên'}
                              </p>
                              <p className="text-sm text-gray-500 truncate">{student.email}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showUpdateModal && (
        <CourseUpdate
          course={course}
          open={showUpdateModal}
          onClose={handleCloseUpdate}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {showCreateLessonModal && (
        <LessonCreate
          courseId={courseId}
          open={showCreateLessonModal}
          onClose={() => setShowCreateLessonModal(false)}
          onSuccess={refetchLessons}
        />
      )}

      {selectedLesson && (
        <LessonDetail
          lesson={selectedLesson}
          open={!!selectedLesson}
          onClose={() => setSelectedLesson(null)}
          onSuccess={refetchLessons}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal isOpen={showDeleteModal} onClose={handleCloseDelete} title="">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa khóa học</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa khóa học "<span className="font-semibold text-gray-900">{course.title}</span>"?
              <br />
              <span className="text-red-600 font-medium">Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.</span>
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleCloseDelete}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50"
              >
                {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CourseDetail;