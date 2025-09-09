import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getCourseDetails } from "@/services/hooks/courseService.js";
import ExamCard from "../../../components/student/ExamCard";

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await getCourseDetails(courseId);
        setCourse(data);
      } catch (e) {
        console.error("Failed to load course detail:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [courseId]);

  const handleStartExam = (examId) => {
    navigate(`/student/exams/${examId}`);
  };

  if (loading) return <p className="p-6">Đang tải chi tiết khóa học...</p>;
  if (!course) return <p className="p-6">Không tìm thấy khóa học.</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow p-6 flex gap-6">
        <img
          src={course.imageUrl || "/default-course.png"}
          alt={course.name}
          className="w-40 h-40 object-cover rounded-xl"
        />
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-1">{course.name}</h1>
          <p className="text-gray-600 mb-2">
            Giảng viên: <span className="font-medium">{course.teacherName}</span>
          </p>
          <p className="text-gray-600 mb-4">
            Lịch học: {course.schedule || "Cập nhật sau"}
          </p>
          <p className="text-gray-700">{course.description}</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
              Vào lớp học
            </button>
            <Link
              to="/student/exams"
              className="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200"
            >
              Xem bài kiểm tra
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-sm text-gray-500">Số bài học</p>
          <p className="text-2xl font-semibold">
            {course.stats?.lessonsCount ?? "-"}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-sm text-gray-500">Đã hoàn thành</p>
          <p className="text-2xl font-semibold">
            {course.stats?.completedLessons ?? "-"}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-sm text-gray-500">Tiến độ</p>
          <p className="text-2xl font-semibold">
            {course.stats?.progressPercent != null
              ? `${course.stats.progressPercent}%`
              : "-"}
          </p>
        </div>
      </div>

      {/* Upcoming exams (nếu có) */}
      {Array.isArray(course.upcomingExams) && course.upcomingExams.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Bài kiểm tra sắp diễn ra</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {course.upcomingExams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} onStart={handleStartExam} />
            ))}
          </div>
        </section>
      )}

      {/* Lessons (nếu backend trả về) */}
      {Array.isArray(course.lessons) && course.lessons.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Danh sách bài học</h2>
          <ul className="bg-white rounded-2xl shadow divide-y">
            {course.lessons.slice(0, 12).map((lesson) => (
              <li key={lesson.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{lesson.title}</p>
                  {lesson.date && (
                    <p className="text-sm text-gray-500">{lesson.date}</p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    lesson.completed
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {lesson.completed ? "Đã học" : "Chưa học"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default CourseDetail;
