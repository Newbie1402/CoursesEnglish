import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTrash, FaUserGraduate, FaBook, FaClipboardList, FaUserPlus, FaCheckCircle, FaTimesCircle, FaClock, FaCalendarAlt } from 'react-icons/fa';
import { countLessonsInCourse } from '@/services/hooks/lessonService';
import { countAssignmentsInCourse } from '@/services/hooks/assignmentService';
import { countStudentsInCourse, getStudentOfCourse } from '@/services/hooks/adminService';
import { getTeacherDetails } from '@/services/hooks/teacherService';
import { getLessonOfCourse } from '@/services/hooks/lessonService';
import { getAssignmentOfCourses } from '@/services/hooks/assignmentService';
import { getCourseDetails, deleteCourse } from '@/services/hooks/courseService';
import { getProgress } from "@/lib/utils.js";
import AddStudentModal from '../student/AddStudentModal';
import LessonDetailModal from "@/pages/admin/lesson/LessonDetailModal.jsx";

const AdminCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ lessons: 0, assignments: 0, students: 0 });
  const [teacherName, setTeacherName] = useState('');
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [course, setCourse] = useState(null);

  // Modal states
  const [showLessonDetailModal, setShowLessonDetailModal] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
      const fetchCourseDetails = async () => {
          const courseData = await getCourseDetails(courseId);
          setCourse(courseData);
      };

    fetchCourseDetails();
  }, [courseId]);

  useEffect(() => {
    if (!course) return; // Chỉ chạy khi course đã có dữ liệu

    const fetchTeacher = async () => {
      if (!course.teacherId) {
        setTeacherName('Không xác định');
        return;
      }

      const teacher = await getTeacherDetails(course.teacherId);
      setTeacherName(teacher?.fullName || 'Không xác định');
    };

    fetchTeacher();
  }, [course]);

  useEffect(() => {
    const fetchStats = async () => {
      const lessonsCount = await countLessonsInCourse(courseId);
      const assignmentsCount = await countAssignmentsInCourse(courseId);
      const studentsCount = await countStudentsInCourse(courseId);
      setStats({ lessons: lessonsCount, assignments: assignmentsCount, students: studentsCount });
    };

    const fetchLessons = async () => {
      const lessonList = await getLessonOfCourse(courseId);
      setLessons(lessonList);
    };

    const fetchAssignments = async () => {
      const assignmentList = await getAssignmentOfCourses(courseId);
      setAssignments(assignmentList);
    };

    const fetchStudents = async () => {
      const studentList = await getStudentOfCourse(courseId);
      setStudents(studentList);
    };
    fetchStats();
    fetchLessons();
    fetchAssignments();
    fetchStudents();
  }, [courseId]);

  // Toast functions
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Fetch functions - tách ra để có thể sử dụng lại
  const fetchStats = async () => {
    const lessonsCount = await countLessonsInCourse(courseId);
    const assignmentsCount = await countAssignmentsInCourse(courseId);
    const studentsCount = await countStudentsInCourse(courseId);
    setStats({ lessons: lessonsCount, assignments: assignmentsCount, students: studentsCount });
  };

  const fetchStudents = async () => {
    const studentList = await getStudentOfCourse(courseId);
    setStudents(studentList);
  };

  // Handle add student success
  const handleAddStudentSuccess = (message, type = 'success') => {
    showToast(message, type);
    if (type === 'success') {
      // Refresh students list
      fetchStudents();
      // Refresh stats
      fetchStats();
    }
  };

  // Handle lesson click
  const handleLessonClick = (lessonId) => {
    setSelectedLessonId(lessonId);
    setShowLessonDetailModal(true);
  };

  // Handle close lesson modal
  const handleCloseLessonDetailModal = () => {
    setShowLessonDetailModal(false);
    setSelectedLessonId(null);
  };

  // Handle delete course
  const handleDeleteCourse = () => {
    setShowDeleteConfirmModal(true);
  };

  // Confirm delete course
  const handleConfirmDelete = async () => {
    try {
      await deleteCourse(courseId);
      setShowDeleteConfirmModal(false);
      showToast('Xóa khóa học thành công', 'success');
      navigate('/admin/courses');
    } catch (error) {
      setShowDeleteConfirmModal(false);
      showToast('Xóa khóa học thất bại', 'error');
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setShowDeleteConfirmModal(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="flex items-center space-x-2">
                    {course.active ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <FaCheckCircle className="w-4 h-4 mr-1" />
                        Đang hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        <FaTimesCircle className="w-4 h-4 mr-1" />
                        Đã tạm dừng
                      </span>
                    )}
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      ID: {course.courseId}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={handleDeleteCourse}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-200 space-x-2 shadow-lg"
                  >
                    <FaTrash className="w-4 h-4" />
                    <span>Xóa khóa học</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <FaBook className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900">Hình thức học</h3>
                  </div>
                  <p className="text-blue-800 font-medium">{course.online ? 'Học Online' : 'Học Offline'}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <FaClipboardList className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-purple-900">Thời gian học</h3>
                  </div>
                  <p className="text-purple-800 font-medium">{course.startDate} - {course.endDate}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{Math.round(getProgress(course.startDate, course.endDate))}%</span>
                    </div>
                    <h3 className="text-lg font-semibold text-green-900">Tiến độ hoàn thành</h3>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-green-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${getProgress(course.startDate, course.endDate)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaBook className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-500">Số lượng bài học</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600">{stats.lessons}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaClipboardList className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-500">Số lượng bài tập</h3>
                </div>
                <p className="text-3xl font-bold text-green-600">{stats.assignments}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FaUserGraduate className="w-4 h-4 text-yellow-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-500">Số lượng học viên</h3>
                </div>
                <p className="text-3xl font-bold text-yellow-600">{stats.students}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin giảng viên</h3>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {teacherName?.charAt(0) || 'T'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{teacherName}</p>
                  <p className="text-sm text-gray-500">Giảng viên chính</p>
                </div>
              </div>
            </div>

            {/* Lịch học */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FaCalendarAlt className="w-4 h-4 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Lịch học</h3>
              </div>

              {course.schedules && course.schedules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {course.schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                          <FaClock className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-orange-900">
                            {schedule.dayOfWeek === 'MONDAY' && 'Thứ 2'}
                            {schedule.dayOfWeek === 'TUESDAY' && 'Thứ 3'}
                            {schedule.dayOfWeek === 'WEDNESDAY' && 'Thứ 4'}
                            {schedule.dayOfWeek === 'THURSDAY' && 'Thứ 5'}
                            {schedule.dayOfWeek === 'FRIDAY' && 'Thứ 6'}
                            {schedule.dayOfWeek === 'SATURDAY' && 'Thứ 7'}
                            {schedule.dayOfWeek === 'SUNDAY' && 'Chủ nhật'}
                          </h4>
                          <p className="text-sm text-orange-700">
                            {schedule.timeSlot === 'SLOT_1' && 'Ca 1'}
                            {schedule.timeSlot === 'SLOT_2' && 'Ca 2'}
                            {schedule.timeSlot === 'SLOT_3' && 'Ca 3'}
                            {schedule.timeSlot === 'SLOT_4' && 'Ca 4'}
                            {schedule.timeSlot === 'SLOT_5' && 'Ca 5'}
                          </p>
                        </div>
                      </div>
                      {schedule.timeRange && (
                        <p className="text-orange-800 font-medium mt-2">
                          {schedule.timeRange}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCalendarAlt className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Chưa có lịch học nào được thiết lập</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'students':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Danh sách học viên</h2>
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 space-x-2 shadow-lg"
              >
                <FaUserPlus className="w-4 h-4" />
                <span>Thêm học viên</span>
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {students.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUserGraduate className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">Chưa có học viên nào trong khóa học này</p>
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors space-x-2"
                  >
                    <FaUserPlus className="w-4 h-4" />
                    <span>Thêm học viên đầu tiên</span>
                  </button>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Học viên</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tham gia vào</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.studentId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                              {student.fullName?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{student.fullName}</p>
                              <p className="text-sm text-gray-500">ID: {student.studentId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{student.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{student.phone || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {student.enrolledAt ? new Date(student.enrolledAt).toLocaleDateString('vi-VN') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );

      case 'lessons':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Danh sách bài học</h2>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {lessons.length === 0 ? (
                <div className="p-6 text-center text-gray-400">Chưa có bài học nào cho khóa học này.</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên bài học</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tải lên</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lessons.map((lesson) => (
                      <tr
                        key={lesson.lessonId}
                        onClick={() => handleLessonClick(lesson.lessonId)}
                        className="cursor-pointer hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{lesson.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {lesson.uploadedAt ? new Date(lesson.uploadedAt).toLocaleDateString('vi-VN') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            lesson.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {lesson.active ? 'Đang hoạt động' : 'Đã ẩn'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );
      case 'assignments':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Danh sách bài tập</h2>
              <button
                onClick={() => {
                  // TODO: Implement add assignment functionality
                  showToast('Tính năng thêm bài tập sẽ được cập nhật sớm', 'info');
                }}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 space-x-2 shadow-lg"
              >
                <FaClipboardList className="w-4 h-4" />
                <span>Thêm bài tập</span>
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {assignments.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaClipboardList className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">Chưa có bài tập nào trong khóa học này</p>
                  <button
                    onClick={() => {
                      // TODO: Implement add assignment functionality
                      showToast('Tính năng thêm bài tập sẽ được cập nhật sớm', 'info');
                    }}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors space-x-2"
                  >
                    <FaClipboardList className="w-4 h-4" />
                    <span>Thêm bài tập đầu tiên</span>
                  </button>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề bài tập</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hạn nộp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm tối đa</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignments.map((assignment) => (
                      <tr
                        key={assignment.examId}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                          navigate(`/admin/exams/${assignment.examId}`)
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                              <FaClipboardList className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{assignment.title}</p>
                              <p className="text-sm text-gray-500">ID: {assignment.examId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString('vi-VN') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('vi-VN') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            assignment.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {assignment.active ? (
                              <>
                                <FaCheckCircle className="w-3 h-3 mr-1" />
                                Đang hoạt động
                              </>
                            ) : (
                              <>
                                <FaTimesCircle className="w-3 h-3 mr-1" />
                                Đã ẩn
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {assignment.maxScore ? `${assignment.maxScore} điểm` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!course) {
    return <div className="p-6 text-center">Đang tải thông tin khóa học...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {toast.type === 'success' ? (
              <FaCheckCircle className="w-5 h-5" />
            ) : (
              <FaTimesCircle className="w-5 h-5" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4">Chi tiết khóa học</h1>
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {['overview', 'lessons' ,'assignments', 'students'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">{renderTabContent()}</div>

      {/* Lesson Modal */}
      <LessonDetailModal
        isOpen={showLessonDetailModal}
        onClose={handleCloseLessonDetailModal}
        lessonId={selectedLessonId}
      />

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        courseId={courseId}
        onSuccess={handleAddStudentSuccess}
      />

      {/* Delete Confirm Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleCancelDelete}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 transform transition-all">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FaTrash className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa khóa học</h3>
                <p className="text-sm text-gray-500">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">
                Bạn có chắc chắn muốn xóa khóa học <span className="font-semibold text-gray-900">"{course?.title}"</span>?
              </p>
              <p className="text-sm text-red-600 mt-2">
                ⚠️ Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <FaTrash className="w-4 h-4" />
                <span>Xóa khóa học</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourseDetail;
