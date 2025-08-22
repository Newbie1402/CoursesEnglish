import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaUserGraduate, FaBook, FaClipboardList } from 'react-icons/fa';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/Card.jsx';
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

  // Thống kê mẫu (có thể lấy từ API nếu backend trả về)
  const stats = [
    {
      label: 'Bắt đầu',
      value: formatDate(course?.startDate) || '-',
      icon: <FaBook className="w-5 h-5 text-blue-500" />
    },
    {
      label: 'Kết thúc',
      value: formatDate(course?.endDate) || '-',
      icon: <FaClipboardList className="w-5 h-5 text-yellow-500" />
    },
    {
      label: 'Giảng viên',
      value: course?.teacherId ? `ID: ${course.teacherId}` : '-',
      icon: <FaUserGraduate className="w-5 h-5 text-green-500" />
    }
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
    return <div className="p-6 text-center text-blue-600">Đang tải thông tin khóa học...</div>;
  }

  if (isError) {
    return <div className="p-6 text-center text-red-500">Lỗi tải dữ liệu: {error?.message || 'Không thể tải thông tin khóa học.'}</div>;
  }

  if (!course) {
    return <div className="p-6 text-center text-gray-500">Không tìm thấy thông tin khóa học.</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Course Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
          <p className="mt-2 text-gray-600">{course.description}</p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center px-4 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors" onClick={() => setShowCreateLessonModal(true)}>
            <FaPlus className="mr-2" />
            Thêm bài học
          </button>
          {!showUpdateModal && (
            <button className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" onClick={handleEdit}>
              <FaEdit className="mr-2" />
              Chỉnh sửa
            </button>
          )}
          <button className="inline-flex items-center px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" onClick={handleDelete}>
            <FaTrash className="mr-2" />
            Xóa
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center gap-3">
              {stat.icon}
              <CardTitle className="text-base font-medium">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-xl font-bold text-gray-800">{stat.value}</CardContent>
          </Card>
        ))}
      </div>

      {/* Course Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {['overview', 'lessons', 'assignments', 'students'].map((tab) => (
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

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin chung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Hình thức</p>
                  <p className="mt-1">{course.online ? 'Học Online' : 'Học Offline'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Thời lượng</p>
                  <p className="mt-1">{getDaysBetween(course.startDate, course.endDate)} ngày</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tiến độ</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{getProgress(course.startDate, course.endDate)}% hoàn thành</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getProgress(course.startDate, course.endDate)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Giảng viên</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <img
                    src={`https://ui-avatars.com/api/?name=Teacher+${course.teacherId}`}
                    alt={`Giảng viên ID: ${course.teacherId}`}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">Giảng viên: {course.teacherId}</h3>
                    <p className="text-sm text-gray-500">Giảng viên chính</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Danh sách bài học</h2>
              <button
                className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                onClick={() => setShowCreateLessonModal(true)}
              >
                <FaPlus className="mr-2" />
                Thêm bài học
              </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              {isLoadingLessons ? (
                <div className="p-6 text-center text-gray-500">Đang tải danh sách bài học...</div>
              ) : isErrorLessons ? (
                <div className="p-6 text-center text-red-500">Lỗi khi tải danh sách bài học.</div>
              ) : lessons.length === 0 ? (
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
                        onClick={() => setSelectedLesson(lesson)}
                        className="cursor-pointer hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{lesson.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{lesson.uploadedAt ? new Date(lesson.uploadedAt).toLocaleDateString('vi-VN') : '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${lesson.active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {lesson.active ? 'Đang hoạt động' : 'Ẩn'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Danh sách bài tập</h2>
              <button
                className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                onClick={() => navigate('/teacher/assignments/new')}
              >
                <FaPlus className="mr-2" />
                Thêm bài tập
              </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên bài kiểm tra</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian bắt đầu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian kết thúc</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {examsByCourse.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">Chưa có bài kiểm tra nào cho khóa học này.</div>
                  ) : (
                    examsByCourse.map((exam) => (
                      <tr
                        key={exam.examId}
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => navigate(`/teacher/assignments/${exam.examId}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{exam.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{exam.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(exam.startTime).toLocaleString('vi-VN')}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(exam.endTime).toLocaleString('vi-VN')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Danh sách học viên</h2>
              <button className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                <FaPlus className="mr-2" />
                Thêm học viên
              </button>
            </div>
            {/* Danh sách học viên */}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              {isLoadingStudents ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-500">Đang tải danh sách học viên...</span>
                </div>
              ) : isErrorStudents ? (
                <div className="text-red-500 py-4 text-center">Không thể tải danh sách học viên.</div>
              ) : students.length === 0 ? (
                <div className="text-gray-500 py-4 text-center">Chưa có học viên nào trong khóa học này.</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày ghi danh</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student, idx) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{idx + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{student.fullName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{student.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{student.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{student.enrolledAt ? new Date(student.enrolledAt).toLocaleDateString('vi-VN') : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        <CourseUpdate
          open={showUpdateModal}
          onClose={handleCloseUpdate}
          course={course}
          onSuccess={handleUpdateSuccess}
        />

        <Modal isOpen={showDeleteModal} onClose={handleCloseDelete} title="Xác nhận xóa khóa học">
          <div className="p-4">
            <p className="mb-4 text-gray-700">Bạn có chắc chắn muốn xóa khóa học này không?</p>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={handleCloseDelete} className="px-4 py-2 rounded bg-gray-200 text-gray-700">Hủy</button>
              <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">
                {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </Modal>

        <LessonCreate
          open={showCreateLessonModal}
          onClose={() => setShowCreateLessonModal(false)}
          courseId={courseId}
          onSuccess={() => {
            setShowCreateLessonModal(false);
            refetchLessons();
          }}
        />

        {selectedLesson && (
            <LessonDetail
                open={!!selectedLesson}
                onClose={() => setSelectedLesson(null)}
                lesson={selectedLesson}
                onSuccess={() => {
                    setSelectedLesson(null);
                    refetch();
                }}
            />
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
