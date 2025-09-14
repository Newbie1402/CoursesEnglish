import React, { useState, useEffect } from 'react';
import {
    FaUsers,
    FaGraduationCap,
    FaClipboardList,
    FaUserGraduate,
    FaChalkboardTeacher,
    FaArrowUp,
    FaArrowDown,
    FaEye,
    FaPlus,
    FaBell,
    FaClock,
    FaEdit,
    FaTrash,
    FaUserLock,
    FaUserCheck, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';
import { getNotificationUser } from '@/services/hooks/notificationService';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
// Services to populate stats
import { getAllUsers, getAllCourseActive, getAllExams } from '@/services/hooks/adminService';
import { getAllStudent } from '@/services/hooks/studentService';
import { getAllTeacher } from '@/services/hooks/teacherService';
import { getSubmissionsList, notAttempts } from '@/services/hooks/submissionService';
import AddUserModal from "@/pages/admin/user/AddUserModal.jsx";

const AdminDashboard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  // Stats state
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    activeCourses: 0,
    totalExams: 0,
    totalStudents: 0,
    totalTeachers: 0,
    completionRate: 0,
  });

  // Mapping notification types to icons and colors
  const notificationTypeConfig = {
    ADMIN_NEW_ACCOUNT: {
      icon: FaUserCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    ADMIN_ACCOUNT_LOCKED: {
      icon: FaUserLock,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    ADMIN_ACCOUNT_UNLOCKED: {
      icon: FaUserCheck,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    ADMIN_COURSE_CREATED: {
      icon: FaPlus,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    ADMIN_COURSE_UPDATED: {
      icon: FaEdit,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    ADMIN_COURSE_DELETED: {
      icon: FaTrash,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    ADMIN_EXAM_CREATED: {
      icon: FaClipboardList,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    ADMIN_EXAM_UPDATED: {
      icon: FaEdit,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    ADMIN_EXAM_DELETED: {
      icon: FaTrash,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    DEFAULT: {
      icon: FaBell,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50'
    }
  };

  // Format time function
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Vừa xong';
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays} ngày trước`;
      } else {
        return date.toLocaleDateString('vi-VN');
      }
    }
  };

  // Helper to normalize possibly-wrapped API arrays
  const toArray = (maybe) => {
    if (Array.isArray(maybe)) return maybe;
    if (maybe && Array.isArray(maybe.data)) return maybe.data;
    if (maybe && Array.isArray(maybe.content)) return maybe.content;
    return [];
  };

  // Compute completion rate across exams
  const computeCompletionRate = async (exams = []) => {
    if (!exams.length) return 0;
    try {
      // Limit to avoid heavy loads on very large datasets
      const list = exams.slice(0, 20); // compute on up to 20 exams
      const results = await Promise.all(
        list.map(async (ex) => {
          const examId = ex.examId ?? ex.id;
          if (!examId) return { completed: 0, total: 0 };
          try {
            const [subs, notTried] = await Promise.all([
              getSubmissionsList(examId),
              notAttempts(examId)
            ]);
            const submissions = Array.isArray(subs) ? subs : toArray(subs);
            const notAttempted = Array.isArray(notTried) ? notTried : toArray(notTried);
            const totalAssigned = submissions.length + notAttempted.length;
            // If submission object has a status, count only finished ones, else treat any submission as completed
            const finishedCount = submissions.filter((s) => {
              const st = (s.status || s.state || '').toString().toUpperCase();
              if (!st) return true;
              return st.includes('FINISH') || st.includes('COMPLET');
            }).length;
            return { completed: finishedCount, total: totalAssigned || submissions.length };
          } catch {
            return { completed: 0, total: 0 };
          }
        })
      );
      const agg = results.reduce(
        (acc, r) => ({ completed: acc.completed + r.completed, total: acc.total + r.total }),
        { completed: 0, total: 0 }
      );
      if (!agg.total) return 0;
      return Math.round((agg.completed / agg.total) * 100);
    } catch {
      return 0;
    }
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const [usersRes, coursesRes, examsRes, studentsRes, teachersRes] = await Promise.all([
        getAllUsers(),
        getAllCourseActive(),
        getAllExams(),
        getAllStudent(),
        getAllTeacher(),
      ]);

      const users = toArray(usersRes);
      const courses = toArray(coursesRes);
      const exams = toArray(examsRes);
      const students = toArray(studentsRes);
      const teachers = toArray(teachersRes);

      const rate = await computeCompletionRate(exams);

      setStatsData({
        totalUsers: users.length,
        activeCourses: courses.length,
        totalExams: exams.length,
        totalStudents: students.length,
        totalTeachers: teachers.length,
        completionRate: rate,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStatsData({
        totalUsers: 0,
        activeCourses: 0,
        totalExams: 0,
        totalStudents: 0,
        totalTeachers: 0,
        completionRate: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  };

    // Toast functions
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    // Handle add user success
    const handleAddUserSuccess = (message, type = 'success') => {
        showToast(message, type);
        setShowAddUserModal(false);
    };

  // Fetch recent activities from notifications
  const fetchRecentActivities = async () => {
    if (!token) return;

    try {
      setLoadingActivities(true);
      const response = await getNotificationUser(token);

      if (response?.data?.content) {
        // Sort by createdAt (newest first) and take first 5
        const sortedNotifications = response.data.content
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        // Map notifications to activity format
        const activities = sortedNotifications.map(notification => {
          const config = notificationTypeConfig[notification.type] || notificationTypeConfig.DEFAULT;

          return {
            id: notification.id,
            type: notification.type,
            message: notification.message,
            time: formatTime(notification.createdAt),
            icon: config.icon,
            color: config.color,
            bgColor: config.bgColor,
            isRead: notification.read
          };
        });

        setRecentActivities(activities);
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setRecentActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchRecentActivities();
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Build stats cards from state
  const stats = [
    {
      title: 'Tổng người dùng',
      value: statsLoading ? '—' : statsData.totalUsers,
      icon: FaUsers,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Khóa học hoạt động',
      value: statsLoading ? '—' : statsData.activeCourses,
      icon: FaGraduationCap,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Bài kiểm tra',
      value: statsLoading ? '—' : statsData.totalExams,
      icon: FaClipboardList,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Học viên đang học',
      value: statsLoading ? '—' : statsData.totalStudents,
      icon: FaUserGraduate,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'Giảng viên',
      value: statsLoading ? '—' : statsData.totalTeachers,
      icon: FaChalkboardTeacher,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600'
    },
    {
      title: 'Tỷ lệ hoàn thành',
      value: statsLoading ? '—' : `${statsData.completionRate}%`,
      icon: FaUserCheck,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600'
    }
  ];

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

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Quản trị
          </h1>
          <p className="text-gray-600">
            Tổng quan về hoạt động của hệ thống học tập
          </p>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            <FaClock className="inline mr-2" />
            {currentTime.toLocaleString('vi-VN')}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? FaArrowUp : FaArrowDown;

          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`text-2xl ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Hoạt động gần đây
            </h3>
            <button
              onClick={fetchRecentActivities}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center space-x-1"
            >
              <FaEye />
              <span>Làm mới</span>
            </button>
          </div>

          <div className="space-y-4">
            {loadingActivities ? (
              // Loading skeleton
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivities.length === 0 ? (
              // Empty state
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaBell className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Chưa có hoạt động nào</h4>
                <p className="text-gray-500 text-sm">Các hoạt động gần đây sẽ hiển thị ở đây</p>
              </div>
            ) : (
              // Activities list
              recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className={`flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                      !activity.isRead ? 'bg-blue-50/50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${activity.bgColor || 'bg-gray-100'}`}>
                      <Icon className={`${activity.color} text-lg`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${!activity.isRead ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                    {!activity.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Thao tác nhanh
          </h3>
          <div className="space-y-4">
            <button
                onClick={() => setShowAddUserModal(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg transition-colors flex items-center space-x-3">
              <FaPlus className="text-lg" />
              <span>Thêm người dùng mới</span>
            </button>
            <button
                onClick={() => navigate('/admin/courses/new')}
                className="w-full bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg transition-colors flex items-center space-x-3">
              <FaGraduationCap className="text-lg" />
              <span>Tạo khóa học mới</span>
            </button>
          </div>
        </div>
      </div>
        {/* Add User Modal */}
        <AddUserModal
            isOpen={showAddUserModal}
            onClose={() => setShowAddUserModal(false)}
            onSuccess={handleAddUserSuccess}
        />
    </div>
  );
};

export default AdminDashboard;
