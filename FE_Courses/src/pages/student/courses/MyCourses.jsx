import React, { useEffect, useState } from "react";
import { getCourseOfStudent } from "@/services/hooks/courseService";
import CourseCard from "../../../components/student/CourseCard";
import { useNavigate } from "react-router-dom";
import { useAuth} from "@/contexts/AuthContext.jsx";

const MyCourses = () => {
    const { studentId } = useAuth();
    const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setError(null);
        const data = await getCourseOfStudent(studentId);
        // Chuẩn hóa dữ liệu cho CourseCard (id, name, description)
        const normalized = (data || []).map((c) => ({
          ...c,
          id: c.courseId ?? c.id,
          name: c.title ?? c.name,
          description: c.description || "",
        }));
        setCourses(normalized);
      } catch (err) {
        console.error("Failed to load courses", err);
        setError("Không thể tải danh sách khóa học.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [studentId]);

  const handleCourseClick = (id) => {
    navigate(`/student/courses/${id}`)
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Khóa học của tôi</h2>
      {courses.length === 0 ? (
        <p>Bạn chưa đăng ký khóa học nào.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <CourseCard key={c.courseId} course={c} onView={handleCourseClick} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
