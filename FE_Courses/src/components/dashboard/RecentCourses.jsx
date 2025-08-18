import React from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const RecentCourses = ({ courses }) => {
  const navigate = useNavigate();

  const handleCourseClick = (courseId) => {
    navigate(`/teacher/courses/${courseId}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-100">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-800">Khóa học gần đây</h2>
        <button
          onClick={() => navigate('/teacher/courses')}
          className="text-sm lg:text-base text-blue-600 hover:text-blue-700 font-medium active:scale-95 transition-transform"
        >
          Xem tất cả
        </button>
      </div>
      <div className="divide-y divide-gray-100">
        {courses.map((course) => (
          <div
            key={course.id}
            onClick={() => handleCourseClick(course.id)}
            className={cn(
              "p-4 lg:p-6 hover:bg-gray-50 cursor-pointer active:bg-gray-100",
              "transition-colors touch-manipulation"
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 mb-1 truncate">{course.name}</h3>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span className="inline-flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {course.lessons} bài học
                  </span>
                  <span className="inline-flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {course.students} học viên
                  </span>
                </div>
              </div>
              <span className={cn(
                "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium",
                course.status === "Đang diễn ra"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              )}>
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
  );
};

export default RecentCourses;
