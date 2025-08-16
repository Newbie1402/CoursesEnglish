import React from 'react';
import { useParams } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaUserGraduate, FaBook, FaClipboardList } from 'react-icons/fa';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/Card';

const CourseDetail = () => {
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = React.useState('overview');

  const course = {
    id: courseId,
    name: 'Tiếng Anh Giao Tiếp Cơ Bản',
    description: 'Khóa học giúp học viên nắm vững kỹ năng giao tiếp tiếng Anh cơ bản trong cuộc sống hàng ngày.',
    level: 'Beginner',
    duration: '3 tháng',
    totalLessons: 24,
    totalStudents: 45,
    progress: 75,
    instructor: {
      name: 'Nguyễn Văn A',
      avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A'
    }
  };

  const stats = [
    {
      label: 'Bài học',
      value: course.totalLessons,
      icon: <FaBook className="w-5 h-5 text-blue-500" />
    },
    {
      label: 'Học viên',
      value: course.totalStudents,
      icon: <FaUserGraduate className="w-5 h-5 text-green-500" />
    },
    {
      label: 'Bài tập',
      value: 18,
      icon: <FaClipboardList className="w-5 h-5 text-yellow-500" />
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Course Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
          <p className="mt-2 text-gray-600">{course.description}</p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
            <FaEdit className="mr-2" />
            Chỉnh sửa
          </button>
          <button className="inline-flex items-center px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
            <FaTrash className="mr-2" />
            Xóa
          </button>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-gray-50">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
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
                  <p className="text-sm font-medium text-gray-500">Cấp độ</p>
                  <p className="mt-1">{course.level}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Thời lượng</p>
                  <p className="mt-1">{course.duration}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tiến độ</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{course.progress}% hoàn thành</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
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
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{course.instructor.name}</h3>
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
              <button className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                <FaPlus className="mr-2" />
                Thêm bài học
              </button>
            </div>
            {/* Lesson list will be added here */}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Danh sách bài tập</h2>
              <button className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                <FaPlus className="mr-2" />
                Thêm bài tập
              </button>
            </div>
            {/* Assignment list will be added here */}
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
            {/* Student list will be added here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
