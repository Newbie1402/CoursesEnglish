import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaBook,
  FaClipboardList,
  FaUserGraduate,
  FaChartLine,
  FaCalendarAlt,
  FaClock,
  FaEye,
  FaUsers,
  FaTrophy,
  FaArrowUp,
  FaArrowDown,
  FaCheckCircle,
  FaStar,
  FaGraduationCap,
  FaLightbulb,
  FaRocket,
  FaHeart,
  FaPlus
} from "react-icons/fa";
import useTeacherService from '@/services/hooks/useTeacherService.js';
import useCourseService, { fetchStudentsByCourse } from '@/services/hooks/useCourseService';
import { fetchLessons } from '@/services/hooks/useLessonService';
import useAssignmentService from '@/services/hooks/useAssignmentService';
import { getProgress } from "@/lib/utils.js";
import { getNotificationUser } from '@/services/hooks/notificationService';
import { NOTIFICATION_TYPES } from './notifications/NotificaitonsTypes.jsx';
import { useAuth } from '../../contexts/AuthContext';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const teacherId = localStorage.getItem('teacherId');
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { getTeacherInfo } = useTeacherService(BASE_URL);
  const { getCourseList } = useCourseService();
  const { getActiveExamsByTeacher } = useAssignmentService();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    specialization: ''
  });
  const [totalLessons, setTotalLessons] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [recentCoursesWithDetails, setRecentCoursesWithDetails] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  // Thêm state cho recent notifications
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const { data: courses = [] } = getCourseList(teacherId);
  const { data: activeExams = [] } = getActiveExamsByTeacher(teacherId);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (teacherId) {
      getTeacherInfo(teacherId).then((data) => {
        if (data) {
          setProfile({
            fullName: data.fullName || '',
          });
        }
      });
    }
  }, [teacherId]);

  useEffect(() => {
    if (courses.length > 0) {
      const fetchLessonsForCourses = async () => {
        try {
          const allLessons = await Promise.all(
            courses.map(async (course) => {
              return await fetchLessons({ courseId: course.courseId });
            })
          );

          const uniqueLessons = new Set();
          allLessons.flat().forEach((lesson) => {
            if (lesson.lessonId) {
              uniqueLessons.add(lesson.lessonId);
            } else {
              console.warn("Lesson without ID detected:", lesson);
            }
          });

          setTotalLessons(uniqueLessons.size);
        } catch (error) {
          console.error("Error fetching lessons for courses:", error);
        }
      };
      fetchLessonsForCourses();
    }
  }, [courses]);

  useEffect(() => {
    if (courses.length > 0) {
      const fetchStudentsForCourses = async () => {
        try {
          const studentCounts = await Promise.all(
            courses.map(async (course) => {
              const students = await fetchStudentsByCourse(course.courseId);
              return students.length;
            })
          );
          setTotalStudents(studentCounts.reduce((acc, count) => acc + count, 0));
        } catch (error) {
          console.error("Error fetching students for courses:", error);
        }
      };
      fetchStudentsForCourses();
    }
  }, [courses]);

  useEffect(() => {
    if (courses.length > 0) {
      const fetchDetailsForCourses = async () => {
        try {
          const updatedCourses = await Promise.all(
            courses.map(async (course) => {
              const students = await fetchStudentsByCourse(course.courseId).then((data) => data.length).catch(() => 0);
              const lessons = await fetchLessons({ courseId: course.courseId }).then((data) => data.length).catch(() => 0);
              return {
                ...course,
                students,
                lessons,
              };
            })
          );
          setRecentCoursesWithDetails(updatedCourses);
        } catch (error) {
          console.error("Error fetching details for courses:", error);
        }
      };
      fetchDetailsForCourses();
    }
  }, [courses]);

  const stats = useMemo(() => {
    return [
      {
        label: "Khóa học",
        value: courses.length,
        icon: FaBook,
        color: "from-blue-500 to-blue-600",
        bgColor: "bg-blue-50",
        textColor: "text-blue-600"
      },
      {
        label: "Bài học",
        value: totalLessons,
        icon: FaClipboardList,
        color: "from-green-500 to-green-600",
        bgColor: "bg-green-50",
        textColor: "text-green-600"
      },
      {
        label: "Bài tập",
        value: activeExams.length,
        icon: FaTrophy,
        color: "from-yellow-500 to-yellow-600",
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-600"
      },
      {
        label: "Học viên",
        value: totalStudents,
        icon: FaUserGraduate,
        color: "from-purple-500 to-purple-600",
        bgColor: "bg-purple-50",
        textColor: "text-purple-600"
      },
    ];
  }, [courses, totalLessons, activeExams, totalStudents]);

  const recentCourses = useMemo(() => {
    return recentCoursesWithDetails
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((course) => ({
        id: course.courseId,
        name: course.title,
        lessons: course.lessons || 0,
        students: course.students || 0,
        progress: getProgress(course.startDate, course.endDate),
        status: course.status || "Đang diễn ra",
      }));
  }, [recentCoursesWithDetails]);

  const quickActions = [
    {
      title: 'Tạo bài học',
      description: 'Thêm bài học mới',
      icon: FaPlus,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => navigate('/teacher/lessons/new')
    },
    {
      title: 'Xem điểm số',
      description: 'Quản lý điểm',
      icon: FaChartLine,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => navigate('/teacher/grades')
    },
    {
      title: 'Lập lịch',
      description: 'Quản lý thời khóa biểu',
      icon: FaCalendarAlt,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => navigate('/teacher/schedule')
    },
    {
      title: 'Báo cáo',
      description: 'Xem thống kê',
      icon: FaChartLine,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => navigate('/teacher/reports')
    }
  ];

  // Fetch 5 notifications gần nhất từ API
  const fetchRecentNotifications = async () => {
    if (!token) return;

    try {
      setLoadingNotifications(true);
      const response = await getNotificationUser(token);

      if (response?.data?.content) {
        // Lấy 5 notifications gần nhất
        const recent5Notifications = response.data.content.slice(0, 5);

        // Transform notifications để có format phù hợp với UI
        const transformedNotifications = recent5Notifications.map((notification) => {
          const typeConfig = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.COURSE_CREATED;

          return {
            id: notification.id,
            type: notification.type,
            message: notification.message,
            time: formatTimeAgo(notification.createdAt),
            icon: typeConfig.icon,
            color: typeConfig.color,
            read: notification.read
          };
        });

        setRecentNotifications(transformedNotifications);
      } else {
        setRecentNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
      setRecentNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Format thời gian thành "X phút trước", "X giờ trước", etc.
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInDays < 7) return `${diffInDays} ngày trước`;

    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Fetch recent notifications khi component mount
  useEffect(() => {
    fetchRecentNotifications();
  }, [token]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 17) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Welcome Section */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <FaGraduationCap className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {getGreeting()}, {profile.fullName || 'Giảng viên'}! 👋
                </h1>
                <p className="text-gray-600 flex items-center space-x-2">
                  <FaClock className="text-sm" />
                  <span>{currentTime.toLocaleString('vi-VN')}</span>
                  <span className="text-green-500">●</span>
                  <span>Đang hoạt động</span>
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                >
                  <FaBell className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {recentNotifications.filter(notification => !notification.read).length}
                  </span>
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">Thông báo</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {recentNotifications.map((notification) => (
                        <div key={notification.id} className="p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${
                              notification.priority === 'high' ? 'bg-red-100' :
                              notification.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                            }`}>
                              <FaBell className={`text-sm ${
                                notification.priority === 'high' ? 'text-red-500' :
                                notification.priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-gray-100">
                      <button className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Xem tất cả thông báo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`text-2xl ${stat.textColor}`} />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Recent Activities & Quick Actions */}
          <div className="xl:col-span-2 space-y-8">
            {/* Recent Activities */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <FaLightbulb className="text-yellow-500" />
                  <span>Hoạt động gần đây</span>
                </h3>
                <button
                  onClick={() => navigate('/teacher/notifications')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                >
                  <FaEye />
                  <span>Xem tất cả</span>
                </button>
              </div>

              {/* Loading State */}
              {loadingNotifications ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 rounded-xl animate-pulse">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentNotifications.length > 0 ? (
                    recentNotifications.map((notification, index) => {
                      const Icon = notification.icon;
                      return (
                        <div
                          key={notification.id}
                          className={`flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer ${
                            !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                          }`}
                          onClick={() => navigate('/teacher/notifications')}
                        >
                          <div className="relative">
                            <div className={`p-3 rounded-xl ${!notification.read ? 'bg-blue-100' : 'bg-gray-100'}`}>
                              <Icon className={`${notification.color} text-lg`} />
                            </div>
                            {index !== recentNotifications.length - 1 && (
                              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-px h-8 bg-gray-200"></div>
                            )}
                            {!notification.read && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500">{notification.time}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // Empty State
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <FaBell className="text-gray-400 text-2xl" />
                      </div>
                      <h4 className="text-gray-600 font-medium mb-2">Chưa có hoạt động nào</h4>
                      <p className="text-gray-500 text-sm">Các thông báo và hoạt động mới sẽ hiển thị ở đây</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Enhanced Recent Courses */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <FaRocket className="text-purple-500" />
                  <span>Khóa học gần đây</span>
                </h3>
                <button
                  onClick={() => navigate('/teacher/courses')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                >
                  <FaEye />
                  <span>Xem tất cả</span>
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {recentCourses.slice(0, 4).map((course) => (
                  <div key={course.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 group cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {course.name}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        course.progress >= 80 ? 'bg-green-100 text-green-600' :
                        course.progress >= 50 ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {course.progress}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <FaBook className="text-xs" />
                        <span>{course.lessons} bài học</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FaUsers className="text-xs" />
                        <span>{course.students} học viên</span>
                      </span>
                    </div>
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Performance Insights */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <FaHeart className="text-red-500" />
                <span>Hiệu suất tuần này</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <FaCheckCircle className="text-green-500" />
                    <span className="text-sm font-medium text-gray-900">Tỷ lệ hoàn thành</span>
                  </div>
                  <span className="text-green-600 font-semibold">87%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <FaStar className="text-blue-500" />
                    <span className="text-sm font-medium text-gray-900">Đánh giá trung bình</span>
                  </div>
                  <span className="text-blue-600 font-semibold">4.8/5</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <FaUsers className="text-purple-500" />
                    <span className="text-sm font-medium text-gray-900">Tương tác học viên</span>
                  </div>
                  <span className="text-purple-600 font-semibold">92%</span>
                </div>
              </div>
            </div>

            {/* Motivational Quote */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
              <div className="text-center">
                <FaLightbulb className="text-3xl mb-4 mx-auto opacity-80" />
                <p className="text-sm mb-2 opacity-90">Câu nói truyền cảm hứng hôm nay</p>
                <p className="font-medium mb-3">
                  "Giáo dục là vũ khí mạnh nhất bạn có thể sử dụng để thay đổi thế giới."
                </p>
                <p className="text-xs opacity-75">- Nelson Mandela</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
