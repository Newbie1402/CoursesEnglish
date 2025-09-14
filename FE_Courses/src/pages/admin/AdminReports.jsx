import React, { useState, useEffect } from 'react';
import {
  FaUsers,
  FaGraduationCap,
  FaClipboardList,
  FaChartBar,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaChevronUp,
  FaUserGraduate,
  FaChalkboardTeacher
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../../contexts/AuthContext';
import { getAllUsers, getAllCourses, getAllExams } from '@/services/hooks/adminService.js';

// Đăng ký các thành phần Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminReports = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalExams: 0,
    activeStudents: 0,
    newUsersThisMonth: 0,
    completedCourses: 0
  });

  const [chartsData, setChartsData] = useState({
    usersByRole: { labels: [], datasets: [] },
    coursesByStatus: { labels: [], datasets: [] },
    enrollmentTrend: { labels: [], datasets: [] },
    examsByMonth: { labels: [], datasets: [] }
  });

  // Helpers: normalize roles, status, timestamps
  const normalizeRoles = (user) => {
    const raw = user?.roles ?? user?.authorities ?? user?.role ?? user?.userRole ?? [];
    const list = Array.isArray(raw) ? raw : [raw];
    return list
      .map((r) => {
        if (!r) return null;
        if (typeof r === 'string') return r;
        if (typeof r === 'object') return r.name || r.role || r.authority || null;
        return null;
      })
      .filter(Boolean)
      .map((r) => String(r).toUpperCase());
  };

  const isStudent = (user) => {
    const roles = normalizeRoles(user);
    return roles.includes('STUDENT') || roles.includes('ROLE_STUDENT') || roles.includes('HOC_VIEN');
  };

  const isActiveUser = (user) => {
    if (typeof user?.active !== 'undefined') return !!user.active;
    if (typeof user?.enabled !== 'undefined') return !!user.enabled;
    if (typeof user?.isActive !== 'undefined') return !!user.isActive;
    if (typeof user?.status === 'string') return user.status.toUpperCase() === 'ACTIVE';
    return true; // giả định active nếu không có field
  };

  const parseDate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const getCreatedAt = (item) => {
    return (
      parseDate(item?.createdAt) ||
      parseDate(item?.created_at) ||
      parseDate(item?.createAt) ||
      parseDate(item?.createdDate) ||
      parseDate(item?.created_on) ||
      parseDate(item?.createdOn) ||
      null
    );
  };

  const monthIndex = (d) => (d ? d.getMonth() : -1); // 0..11

  // Fetch dữ liệu thống kê (thay mock bằng gọi API thật)
  const fetchStatsData = async () => {
    try {
      setLoading(true);

      // Gọi song song các API cần thiết
      const [users, courses, exams] = await Promise.all([
        getAllUsers().catch(() => []),
        getAllCourses().catch(() => []),
        getAllExams().catch(() => [])
      ]);

      // Tính toán số liệu tổng quan
      const totalUsers = Array.isArray(users) ? users.length : 0;
      const totalCourses = Array.isArray(courses) ? courses.length : 0;
      const totalExams = Array.isArray(exams) ? exams.length : 0;

      const activeStudents = (Array.isArray(users) ? users : []).filter((u) => isStudent(u) && isActiveUser(u)).length;

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const newUsersThisMonth = (Array.isArray(users) ? users : []).filter((u) => {
        const c = getCreatedAt(u);
        return c && c >= monthStart;
      }).length;

      const completedCourses = (Array.isArray(courses) ? courses : []).filter((c) => {
        const s = (c?.status || c?.courseStatus || '').toString().toUpperCase();
        const completedFlag = c?.completed === true || c?.isCompleted === true;
        return completedFlag || s === 'COMPLETED' || s === 'HOAN_THANH';
      }).length;

      setStatsData({
        totalUsers,
        totalCourses,
        totalExams,
        activeStudents,
        newUsersThisMonth,
        completedCourses
      });

      // Users by Role chart
      const studentCount = (users || []).filter((u) => isStudent(u)).length;
      const teacherCount = (users || []).filter((u) => {
        const roles = normalizeRoles(u);
        return roles.includes('TEACHER') || roles.includes('ROLE_TEACHER') || roles.includes('GIANG_VIEN');
      }).length;
      const adminCount = (users || []).filter((u) => {
        const roles = normalizeRoles(u);
        return roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');
      }).length;

      const usersByRole = {
        labels: ['Học viên', 'Giảng viên', 'Admin'],
        datasets: [
          {
            label: 'Số lượng người dùng',
            data: [studentCount, teacherCount, adminCount],
            backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)'],
            borderColor: ['rgba(59, 130, 246, 1)', 'rgba(16, 185, 129, 1)', 'rgba(245, 158, 11, 1)'],
            borderWidth: 2,
            borderRadius: 8
          }
        ]
      };

      // Courses by Status chart
      const statusCounts = { ACTIVE: 0, PAUSED: 0, COMPLETED: 0, DRAFT: 0 };
      (courses || []).forEach((c) => {
        const raw = (c?.status || c?.courseStatus || '').toString().toUpperCase();
        const isActive = c?.active === true || c?.isActive === true || raw === 'ACTIVE' || raw === 'HOAT_DONG';
        const isPaused = raw === 'PAUSED' || raw === 'INACTIVE' || raw === 'TAM_DUNG';
        const isCompleted = c?.completed === true || c?.isCompleted === true || raw === 'COMPLETED' || raw === 'HOAN_THANH';
        const isDraft = raw === 'DRAFT' || raw === 'NHAP';
        if (isCompleted) statusCounts.COMPLETED += 1;
        else if (isPaused) statusCounts.PAUSED += 1;
        else if (isDraft) statusCounts.DRAFT += 1;
        else if (isActive) statusCounts.ACTIVE += 1;
        else statusCounts.ACTIVE += 1; // mặc định Active nếu không rõ
      });

      const coursesByStatus = {
        labels: ['Đang hoạt động', 'Tạm dừng', 'Hoàn thành', 'Nháp'],
        datasets: [
          {
            data: [statusCounts.ACTIVE, statusCounts.PAUSED, statusCounts.COMPLETED, statusCounts.DRAFT],
            backgroundColor: ['#10B981', '#F59E0B', '#8B5CF6', '#6B7280'],
            borderWidth: 0
          }
        ]
      };

      // Enrollment trend proxy: số học viên mới theo tháng (trong năm hiện tại)
      const enrollmentMonthly = new Array(12).fill(0);
      (users || []).forEach((u) => {
        if (!isStudent(u)) return;
        const d = getCreatedAt(u);
        if (!d || d.getFullYear() !== now.getFullYear()) return;
        const mi = monthIndex(d);
        if (mi >= 0) enrollmentMonthly[mi] += 1;
      });

      const enrollmentTrend = {
        labels: Array.from({ length: 12 }, (_, i) => `T${i + 1}`),
        datasets: [
          {
            label: 'Đăng ký mới',
            data: enrollmentMonthly,
            borderColor: 'rgba(59, 130, 246, 1)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgba(59, 130, 246, 1)',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 3,
            pointRadius: 4
          }
        ]
      };

      // Exams by Month chart
      const examsMonthly = new Array(12).fill(0);
      (exams || []).forEach((e) => {
        const d = getCreatedAt(e);
        if (!d || d.getFullYear() !== now.getFullYear()) return;
        const mi = monthIndex(d);
        if (mi >= 0) examsMonthly[mi] += 1;
      });

      const examsByMonth = {
        labels: Array.from({ length: 12 }, (_, i) => `T${i + 1}`),
        datasets: [
          {
            label: 'Bài kiểm tra được tạo',
            data: examsMonthly,
            borderColor: 'rgba(16, 185, 129, 1)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      };

      setChartsData({ usersByRole, coursesByStatus, enrollmentTrend, examsByMonth });
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu thống kê:', error);
      // Không chặn UI: giữ dữ liệu rỗng thay vì mock
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsData();
  }, [token]);

  // Component StatCard
  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue' }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600 text-blue-600',
      green: 'from-green-500 to-green-600 text-green-600',
      purple: 'from-purple-500 to-purple-600 text-purple-600',
      orange: 'from-orange-500 to-orange-600 text-orange-600',
      red: 'from-red-500 to-red-600 text-red-600',
      indigo: 'from-indigo-500 to-indigo-600 text-indigo-600'
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {trend && (
              <div className="flex items-center space-x-1">
                {trend === 'up' ? (
                  <FaArrowUp className="w-3 h-3 text-green-500" />
                ) : (
                  <FaArrowDown className="w-3 h-3 text-red-500" />
                )}
                <span className={`text-xs font-medium ${
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trendValue}% so với tháng trước
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[2]}`} />
          </div>
        </div>
      </div>
    );
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12 },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        padding: 12
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { size: 11 } }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 12 },
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        padding: 12
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
          <p className="text-gray-600 mt-1">Tổng quan về hoạt động hệ thống</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <FaCalendarAlt className="w-4 h-4" />
            <span>Tháng này</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <FaChevronUp className="w-4 h-4" />
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="xl:col-span-2">
          <StatCard
            title="Tổng số người dùng"
            value={statsData.totalUsers}
            icon={FaUsers}
            trend="up"
            trendValue={12.5}
            color="blue"
          />
        </div>

        <StatCard
          title="Học viên hoạt động"
          value={statsData.activeStudents}
          icon={FaUserGraduate}
          trend="up"
          trendValue={8.3}
          color="green"
        />

        <StatCard
          title="Tổng khóa học"
          value={statsData.totalCourses}
          icon={FaGraduationCap}
          trend="up"
          trendValue={15.2}
          color="purple"
        />

        <StatCard
          title="Bài kiểm tra"
          value={statsData.totalExams}
          icon={FaClipboardList}
          trend="up"
          trendValue={6.7}
          color="orange"
        />

        <StatCard
          title="Người dùng mới"
          value={statsData.newUsersThisMonth}
          icon={FaChalkboardTeacher}
          trend="up"
          trendValue={22.1}
          color="indigo"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ cột - Người dùng theo vai trò */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Phân bố người dùng</h3>
            <FaChartBar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <Bar data={chartsData.usersByRole} options={chartOptions} />
          </div>
        </div>

        {/* Biểu đồ tròn - Trạng thái khóa học */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Trạng thái khóa học</h3>
            <FaGraduationCap className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <Doughnut data={chartsData.coursesByStatus} options={pieOptions} />
          </div>
        </div>

        {/* Biểu đồ đường - Xu hướng đăng ký */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Xu hướng đăng ký khóa học</h3>
            <FaChevronUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <Line data={chartsData.enrollmentTrend} options={chartOptions} />
          </div>
        </div>

        {/* Biểu đồ vùng - Bài kiểm tra theo tháng */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Bài kiểm tra được tạo</h3>
            <FaClipboardList className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <Line data={chartsData.examsByMonth} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Bảng thống kê chi tiết */}
      {/*<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">*/}
      {/*  <div className="px-6 py-4 border-b border-gray-200">*/}
      {/*    <h3 className="text-lg font-semibold text-gray-900">Thống kê chi tiết</h3>*/}
      {/*  </div>*/}
      {/*  <div className="overflow-x-auto">*/}
      {/*    <table className="w-full">*/}
      {/*      <thead className="bg-gray-50">*/}
      {/*        <tr>*/}
      {/*          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">*/}
      {/*            Chỉ số*/}
      {/*          </th>*/}
      {/*          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">*/}
      {/*            Tháng này*/}
      {/*          </th>*/}
      {/*          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">*/}
      {/*            Tháng trước*/}
      {/*          </th>*/}
      {/*          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">*/}
      {/*            Thay đổi*/}
      {/*          </th>*/}
      {/*        </tr>*/}
      {/*      </thead>*/}
      {/*      <tbody className="bg-white divide-y divide-gray-200">*/}
      {/*        <tr>*/}
      {/*          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">*/}
      {/*            Đăng ký mới*/}
      {/*          </td>*/}
      {/*          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">160</td>*/}
      {/*          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">135</td>*/}
      {/*          <td className="px-6 py-4 whitespace-nowrap">*/}
      {/*            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">*/}
      {/*              +18.5%*/}
      {/*            </span>*/}
      {/*          </td>*/}
      {/*        </tr>*/}
      {/*        <tr>*/}
      {/*          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">*/}
      {/*            Khóa học hoàn thành*/}
      {/*          </td>*/}
      {/*          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">45</td>*/}
      {/*          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">38</td>*/}
      {/*          <td className="px-6 py-4 whitespace-nowrap">*/}
      {/*            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">*/}
      {/*              +18.4%*/}
      {/*            </span>*/}
      {/*          </td>*/}
      {/*        </tr>*/}
      {/*        <tr>*/}
      {/*          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">*/}
      {/*            Bài kiểm tra mới*/}
      {/*          </td>*/}
      {/*          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">45</td>*/}
      {/*          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">38</td>*/}
      {/*          <td className="px-6 py-4 whitespace-nowrap">*/}
      {/*            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">*/}
      {/*              +18.4%*/}
      {/*            </span>*/}
      {/*          </td>*/}
      {/*        </tr>*/}
      {/*      </tbody>*/}
      {/*    </table>*/}
      {/*  </div>*/}
      {/*</div>*/}
    </div>
  );
};

export default AdminReports;
