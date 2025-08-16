import React from "react";
import {
  FaBook,
  FaClipboardList,
  FaUserGraduate,
  FaPlusCircle,
  FaChalkboardTeacher,
  FaBell,
  FaSearch,
  FaSignOutAlt,
  FaCog,
  FaUserCircle
} from "react-icons/fa";

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
  return (
    <div className="min-h-screen bg-gray-50/95">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="lg:w-1/4 bg-white shadow-lg p-6 border-r border-gray-100 min-h-screen">
          {/* Profile Section */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <img
                src={mockTeacher.avatar}
                alt={mockTeacher.name}
                className="w-24 h-24 rounded-full border-4 border-blue-100 hover:border-blue-200 transition duration-300"
              />
              <div className="absolute bottom-0 right-0 bg-green-400 w-4 h-4 rounded-full border-2 border-white"></div>
            </div>
            <h2 className="text-xl font-semibold mt-4 text-gray-800">{mockTeacher.name}</h2>
            <p className="text-blue-600 font-medium">{mockTeacher.role}</p>
            <p className="text-gray-500 text-sm">{mockTeacher.email}</p>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition">
              <FaChalkboardTeacher className="text-xl" />
              <span>Dashboard</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition">
              <FaBook className="text-xl" />
              <span>Khóa học</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition">
              <FaUserGraduate className="text-xl" />
              <span>Học viên</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-500">Xin chào, {mockTeacher.name}!</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button className="p-2 rounded-full hover:bg-gray-100 transition">
                  <FaBell className="text-xl text-gray-600" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    2
                  </span>
                </button>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                <FaPlusCircle />
                <span>Tạo khóa học</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {mockStats.map((stat, index) => (
              <div
                key={index}
                className={`${stat.bg} rounded-xl p-6 transition-all hover:scale-[1.02] hover:shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/50 backdrop-blur-sm">
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Courses */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Khóa học gần đây</h2>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Xem tất cả
              </button>
            </div>
            <div className="grid gap-6">
              {mockCourses.map((course) => (
                <div
                  key={course.id}
                  className="p-4 border border-gray-100 rounded-lg hover:border-blue-200 transition-all hover:shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{course.name}</h3>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>{course.lessons} bài học</span>
                        <span>{course.students} học viên</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      course.status === "Đang diễn ra" 
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {course.status}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tiến độ</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Thông báo mới</h2>
            <div className="space-y-4">
              {mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className={`p-2 rounded-lg ${
                    notification.type === "task" 
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    <FaBell className="text-xl" />
                  </div>
                  <div>
                    <p className="text-gray-800">{notification.message}</p>
                    <p className="text-sm text-gray-500">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
