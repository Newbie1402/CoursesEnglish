import React, { useEffect, useState } from 'react';
import { getAllExams } from '@/services/hooks/adminService.js';
import LoadingSpinner from '@/components/ui/loading/LoadingSpinner';

const AdminExamList = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await getAllExams();
        setExams(response);
      } catch (error) {
        console.error('Error fetching exams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Danh sách bài kiểm tra</h1>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Tiêu đề</th>
            <th className="border border-gray-300 px-4 py-2">Loại</th>
            <th className="border border-gray-300 px-4 py-2">Khóa học</th>
            <th className="border border-gray-300 px-4 py-2">Thời gian bắt đầu</th>
            <th className="border border-gray-300 px-4 py-2">Thời gian kết thúc</th>
            <th className="border border-gray-300 px-4 py-2">Thời lượng (phút)</th>
            <th className="border border-gray-300 px-4 py-2">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => (
            <tr key={exam.examId}>
              <td className="border border-gray-300 px-4 py-2">{exam.title}</td>
              <td className="border border-gray-300 px-4 py-2">{exam.type}</td>
              <td className="border border-gray-300 px-4 py-2">{exam.courseId}</td>
              <td className="border border-gray-300 px-4 py-2">{exam.startTime}</td>
              <td className="border border-gray-300 px-4 py-2">{exam.endTime}</td>
              <td className="border border-gray-300 px-4 py-2">{exam.durationMinutes}</td>
              <td className="border border-gray-300 px-4 py-2">{exam.active ? 'Đang hoạt động' : 'Không hoạt động'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminExamList;
