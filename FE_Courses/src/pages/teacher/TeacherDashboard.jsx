import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaPlusCircle,
  FaBook,
  FaClipboardList,
  FaUserGraduate
} from "react-icons/fa";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentCourses from "@/components/dashboard/RecentCourses";
import NotificationList from "@/components/dashboard/NotificationList";

const mockTeacher = {
  name: "Nguyễn Văn A",
  avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+A",
  role: "Giảng viên tiếng Anh",
  email: "teacher@example.com"
};

const mockStats = [
  {
    label: "Khóa học",
    value: 5,
    icon: <FaBook className="text-blue-500 text-2xl" />,
    bg: "bg-blue-100"
  },
  {
    label: "Bài học",
    value: 32,
    icon: <FaClipboardList className="text-green-500 text-2xl" />,
    bg: "bg-green-100"
  },
  {
    label: "Bài tập",
    value: 18,
    icon: <FaClipboardList className="text-yellow-500 text-2xl" />,
    bg: "bg-yellow-100"
  },
  {
    label: "Học viên",
    value: 120,
    icon: <FaUserGraduate className="text-purple-500 text-2xl" />,
    bg: "bg-purple-100"
  }
];

const mockCourses = [
  {
    id: 1,
    name: "Tiếng Anh Giao Tiếp Cơ Bản",
    lessons: 12,
    students: 40,
    progress: 75,
    status: "Đang diễn ra"
  },
  {
    id: 2,
    name: "Luyện Thi IELTS 6.5+",
    lessons: 10,
    students: 30,
    progress: 45,
    status: "Đang diễn ra"
  },
  {
    id: 3,
    name: "Tiếng Anh Cho Người Mất Gốc",
    lessons: 10,
    students: 50,
    progress: 90,
    status: "Sắp kết thúc"
  }
];

const mockNotifications = [
  {
    id: 1,
    message: "Bạn có 2 bài tập cần chấm điểm",
    time: "2 giờ trước",
    type: "task"
  },
  {
    id: 2,
    message: "Khóa học mới đã được tạo thành công!",
    time: "1 ngày trước",
    type: "success"
  }
];

const TeacherDashboard = () => {
  const navigate = useNavigate();

  const handleCreateCourse = () => {
    navigate('/teacher/courses/new');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">Xin chào, {mockTeacher.name}!</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Thông báo"
            >
              <FaBell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </button>
          </div>
          <button
            onClick={handleCreateCourse}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <FaPlusCircle className="w-4 h-4" />
            <span>Tạo khóa học</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <DashboardStats stats={mockStats} />

      {/* Recent Courses */}
      <RecentCourses courses={mockCourses} />

      {/* Notifications */}
      <NotificationList notifications={mockNotifications} />
    </div>
  );
};

export default TeacherDashboard;
