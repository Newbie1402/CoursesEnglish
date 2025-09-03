import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAttendance } from "@/services/hooks/studentService.js";

const AttendanceList = () => {
  const { studentId } = useParams();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await getAttendance(studentId);
        setAttendance(data);
      } catch (err) {
        console.error("Error fetching attendance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [studentId]);

  if (loading) return <p className="text-center">Đang tải dữ liệu...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Danh sách điểm danh</h2>
      {attendance.length === 0 ? (
        <p>Chưa có dữ liệu điểm danh.</p>
      ) : (
        <table className="min-w-full border border-gray-300 shadow-sm rounded-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b">Ngày học</th>
              <th className="py-2 px-4 border-b">Môn học</th>
              <th className="py-2 px-4 border-b">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((item, index) => (
              <tr key={index} className="text-center">
                <td className="py-2 px-4 border-b">{item.date}</td>
                <td className="py-2 px-4 border-b">{item.courseName}</td>
                <td
                  className={`py-2 px-4 border-b font-semibold ${
                    item.present ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.present ? "Có mặt" : "Vắng"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AttendanceList;