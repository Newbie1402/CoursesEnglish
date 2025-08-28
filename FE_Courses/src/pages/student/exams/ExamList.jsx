import React, { useEffect, useState } from "react";
import { getMyExams } from "../../../services/hooks/studentService.js";
import ExamCard from "../../../components/student/ExamCard";
import { useNavigate } from "react-router-dom";

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const studentId = 1; // TODO: lấy từ auth context / redux
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await getMyExams(studentId);
        setExams(data);
      } catch (err) {
        console.error("Failed to load exams", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [studentId]);

  const handleExamClick = (id) => {
    navigate(`/student/exams/${id}`); // sang trang chi tiết bài kiểm tra
  };

  if (loading) return <p>Đang tải danh sách bài kiểm tra...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Danh sách bài kiểm tra</h2>
      {exams.length === 0 ? (
        <p>Bạn chưa có bài kiểm tra nào.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((e) => (
            <ExamCard key={e.id} exam={e} onClick={handleExamClick} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamList;
