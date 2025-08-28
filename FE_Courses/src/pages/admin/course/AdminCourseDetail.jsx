import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaEdit, FaTrash, FaUserGraduate, FaBook, FaClipboardList, FaUserPlus, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { countLessonsInCourse } from '@/services/hooks/lessonService';
import { countAssignmentsInCourse } from '@/services/hooks/assignmentService';
import { countStudentsInCourse, getStudentOfCourse } from '@/services/hooks/adminService';
import { getTeacherDetails } from '@/services/hooks/teacherService';
import { getLessonOfCourse } from '@/services/hooks/lessonService';
import { getAssignmentOfCourses, getAssignmentDetails } from '@/services/hooks/assignmentService';
import { getCourseDetails } from '@/services/hooks/courseService';
import { getProgress } from "@/lib/utils.js";
import AddStudentModal from '../student/AddStudentModal';
import LessonDetailModal from "@/pages/admin/lesson/LessonDetailModal.jsx";

const AdminCourseDetail = () => {
  const { courseId } = useParams();
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

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
      const fetchCourseDetails = async () => {
          const courseData = await getCourseDetails(courseId);
          setCourse(courseData);
      };

    const fetchStats = async () => {
      const lessonsCount = await countLessonsInCourse(courseId);
      const assignmentsCount = await countAssignmentsInCourse(courseId);
      const studentsCount = await countStudentsInCourse(courseId);
      setStats({ lessons: lessonsCount, assignments: assignmentsCount, students: studentsCount });
    };

    const fetchTeacher = async () => {
      const teacher = await getTeacherDetails(courseId);
      setTeacherName(teacher?.fullName || 'Không xác định');
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
    fetchCourseDetails();
    fetchStats();
    fetchTeacher();
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày sinh</th>
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
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{student.phoneNumber || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('vi-VN') : '-'}
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
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold">Danh sách bài tập</h2>
            <ul>
              {assignments.map((assignment) => (
                <li key={assignment.assignmentId} className="py-2 border-b">
                  {assignment.title}
                </li>
              ))}
            </ul>
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
    </div>
  );
};

export default AdminCourseDetail;