import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getExamResult } from "../../../services/hooks/studentService.js";

const ExamResult = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await getExamResult(id);
        setResult(data);
      } catch (err) {
        console.error("Failed to load exam result", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  if (loading) return <p>Đang tải kết quả...</p>;
  if (!result) return <p>Không tìm thấy kết quả.</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Kết quả bài kiểm tra</h2>
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <p><strong>Tên bài kiểm tra:</strong> {result.examTitle}</p>
        <p><strong>Điểm:</strong> {result.score} / {result.total}</p>
        <p><strong>Thời gian nộp:</strong> {result.submittedAt}</p>
      </div>

      <h3 className="text-xl font-semibold mb-3">Chi tiết câu hỏi</h3>
      <div className="space-y-4">
        {result.questions.map((q, idx) => (
          <div key={idx} className="border rounded-lg p-3">
            <p className="font-medium">{idx + 1}. {q.text}</p>
            <p>Đáp án của bạn: <span className="font-semibold">{q.yourAnswer}</span></p>
            <p>Đáp án đúng: <span className="font-semibold text-green-600">{q.correctAnswer}</span></p>
            {q.isCorrect ? (
              <span className="text-green-600 font-medium">✓ Đúng</span>
            ) : (
              <span className="text-red-600 font-medium">✗ Sai</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Link
          to="/student/exams"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Quay lại danh sách
        </Link>
      </div>
    </div>
  );
};

export default ExamResult;
