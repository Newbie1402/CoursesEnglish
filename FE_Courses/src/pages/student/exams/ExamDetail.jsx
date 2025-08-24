import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getExamDetail, submitExam } from "../../../services/studentService";

const ExamDetail = () => {
  const { id } = useParams(); // examId từ URL
  const navigate = useNavigate();
  const studentId = 1; 

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const data = await getExamDetail(id);
        setExam(data);
      } catch (err) {
        console.error("Failed to load exam detail", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  const handleChange = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async () => {
    try {
      await submitExam(id, studentId, answers);
      alert("Nộp bài thành công!");
      navigate(`/student/exams/${id}/result`);
    } catch (err) {
      alert("Nộp bài thất bại!");
    }
  };

  if (loading) return <p>Đang tải đề thi...</p>;
  if (!exam) return <p>Không tìm thấy đề thi.</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">{exam.title}</h2>
      <p className="text-gray-600 mb-6">Môn học: {exam.courseName}</p>

      <form className="space-y-6">
        {exam.questions.map((q, index) => (
          <div key={q.id} className="border rounded p-4 shadow">
            <h3 className="font-semibold mb-2">
              Câu {index + 1}: {q.content}
            </h3>
            {q.type === "MULTIPLE_CHOICE" ? (
              <div className="space-y-2">
                {q.options.map((opt, i) => (
                  <label key={i} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                className="w-full border rounded p-2"
                rows="4"
                placeholder="Nhập câu trả lời..."
                value={answers[q.id] || ""}
                onChange={(e) => handleChange(q.id, e.target.value)}
              />
            )}
          </div>
        ))}
      </form>

      <button
        onClick={handleSubmit}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Nộp bài
      </button>
    </div>
  );
};

export default ExamDetail;
