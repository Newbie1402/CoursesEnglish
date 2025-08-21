import React, { useEffect, useState } from "react";
import { getMyCourses } from "../../../services/studentService";
import CourseCard from "../../../components/student/CourseCard";

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const studentId = 1; // TODO: lấy từ auth context hoặc redux

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getMyCourses(studentId);
        setCourses(data);
      } catch (err) {
        console.error("Failed to load courses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [studentId]);

  const handleCourseClick = (id) => {
    // ví dụ: điều hướng sang trang chi tiết
    console.log("Clicked course:", id);
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Khóa học của tôi</h2>
      {courses.length === 0 ? (
        <p>Bạn chưa đăng ký khóa học nào.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} onClick={handleCourseClick} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
