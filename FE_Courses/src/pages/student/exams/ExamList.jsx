import React, { useEffect, useState } from "react";
import { getAssignmentOfCourses } from "@/services/hooks/assignmentService";
import { getSubmissionsList } from "@/services/hooks/submissionService";
import { useAuth } from "@/contexts/AuthContext.jsx";
import ExamCard from "../../../components/student/ExamCard";
import { useNavigate } from "react-router-dom";

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const courseId = 1; // TODO: lấy từ auth context / redux
  const { studentId } = useAuth();
  const [examStatuses, setExamStatuses] = useState({}); // { [examId]: 'not_started' | 'in_progress' | 'submitted' }
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await getAssignmentOfCourses(courseId);
        setExams(data);
      } catch (err) {
        console.error("Failed to load exams", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [courseId]);

  useEffect(() => {
    if (!exams.length) return;
    if (!studentId) return; // chưa xác định sinh viên
    let ignore = false;
    const loadStatuses = async () => {
      setLoadingStatuses(true);
      const statusMap = {};
      try {
        // Duyệt từng exam -> gọi submissions (có thể tối ưu backend bằng 1 endpoint tổng hợp)
        await Promise.all(
          exams.map(async (ex) => {
            try {
              const subs = await getSubmissionsList(ex.examId);
              const mine = subs.filter((s) => String(s.studentId) === String(studentId));
              if (!mine.length) {
                statusMap[ex.examId] = "not_started";
                return;
              }
              const inProgress = mine.find((s) => !s.submittedAt);
              if (inProgress) {
                statusMap[ex.examId] = "in_progress";
                return;
              }
              // Có ít nhất 1 bài đã nộp
              statusMap[ex.examId] = "submitted";
            } catch (e) {
              console.error("Load submissions failed for exam", ex.examId, e);
              statusMap[ex.examId] = "not_started";
            }
          })
        );
      } finally {
        if (!ignore) {
          setExamStatuses(statusMap);
          setLoadingStatuses(false);
        }
      }
    };
    loadStatuses();
    return () => {
      ignore = true;
    };
  }, [exams, studentId]);

  const handleExamClick = (examId) => {
    navigate(`/student/exams/${examId}`);
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
            <ExamCard
              key={e.examId}
              exam={e}
              onStart={handleExamClick}
              studentStatus={examStatuses[e.examId]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamList;
