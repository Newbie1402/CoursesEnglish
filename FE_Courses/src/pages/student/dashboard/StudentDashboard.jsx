// src/pages/student/dashboard/StudentDashboard.jsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card/Card";
import { Progress } from "@/components/ui/progress/Progress";
import { FaBook, FaClipboardList, FaBell, FaChartBar } from "react-icons/fa";

const StudentDashboard = () => {
  const student = {
    name: "Nguyễn Văn B",
    courses: 5,
    exams: 2,
    notifications: 3,
    progress: 70,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Xin chào, {student.name} 👋
        </h1>
        <p className="text-gray-600">
          Đây là bảng điều khiển học tập của bạn. Theo dõi tiến độ, khóa học và thông báo tại đây.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <FaBook className="text-blue-600 w-8 h-8" />
          <CardContent>
            <h3 className="text-lg font-semibold">{student.courses}</h3>
            <p className="text-sm text-gray-600">Khoá học đang học</p>
          </CardContent>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <FaClipboardList className="text-green-600 w-8 h-8" />
          <CardContent>
            <h3 className="text-lg font-semibold">{student.exams}</h3>
            <p className="text-sm text-gray-600">Kỳ thi sắp tới</p>
          </CardContent>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <FaBell className="text-yellow-500 w-8 h-8" />
          <CardContent>
            <h3 className="text-lg font-semibold">{student.notifications}</h3>
            <p className="text-sm text-gray-600">Thông báo mới</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <FaChartBar className="text-purple-600" /> Tiến độ học tập
        </h3>
        <Progress value={student.progress} className="h-3" />
        <p className="text-sm text-gray-600 mt-2">
          Bạn đã hoàn thành {student.progress}% chương trình.
        </p>
      </Card>

      {/* Recent Courses */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Khoá học gần đây</h3>
        <ul className="space-y-2 text-gray-700">
          <li>📘 Tiếng Anh giao tiếp</li>
          <li>📗 Ngữ pháp nâng cao</li>
          <li>📕 Luyện thi TOEIC</li>
        </ul>
      </Card>

      {/* Notifications */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Thông báo mới nhất</h3>
        <ul className="space-y-2 text-gray-700 text-sm">
          <li>🔔 Ngày 25/8: Kiểm tra giữa kỳ môn Tiếng Anh giao tiếp.</li>
          <li>🔔 Bổ sung tài liệu luyện thi TOEIC.</li>
          <li>🔔 Nhắc nhở nộp bài tập Ngữ pháp nâng cao.</li>
        </ul>
      </Card>
    </div>
  );
};

export default StudentDashboard;
